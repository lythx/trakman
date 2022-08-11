import { trakman as tm } from '../../src/Trakman.js'
import { BestCheckpoints, PlayerCheckpoints } from './CheckpointTypes.js'
import { bestSecsDB, allCpsDB } from './CheckpointDB.js'
import { emitEvent } from './CheckpointEvents.js'

let currentBestSecs: BestCheckpoints

let currentMapDBId: number

const currentPlayerSecs: PlayerCheckpoints[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await tm.db.getMapId(tm.maps.current.id)
  if (DBId === undefined) {
    await tm.log.fatal(`Failed to fetch current map (${tm.maps.current.id}) id from database`)
    return
  }
  currentMapDBId = DBId
  const res = await bestSecsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await tm.log.fatal(`Failed to fetch best checkpoints for map ${tm.maps.current.id}`, res.message)
    return
  }
  currentBestSecs = res
  const playerSecs = await allCpsDB.get(currentMapDBId, ...tm.players.list.map(a => a.login))
  if (playerSecs instanceof Error) {
    await tm.log.fatal(`Failed to fetch player checkpoints for map ${tm.maps.current.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.length = 0
  currentPlayerSecs.push(...playerSecs)
  emitEvent('CheckpointsFetch', currentBestSecs, currentPlayerSecs)
}

tm.addListener('Controller.Ready', async (): Promise<void> => {
  await onMapStart()
}, true)

tm.addListener('Controller.BeginMap', async (): Promise<void> => {
  await onMapStart()
}, true)

tm.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const date = new Date()
  const playerCheckpoints = currentPlayerSecs.find(a => a.login === info.player.login)
  if (playerCheckpoints === undefined) {
    currentPlayerSecs.push({ login: info.player.login, checkpoints: [info.time] })
    void allCpsDB.add(currentMapDBId, info.player.login, [info.time])
    emitEvent('PlayerCheckpoint', info.player.login, info.player.nickname, info.index)
  } else if ((playerCheckpoints.checkpoints[info.index] ?? Infinity) > info.time) {
    playerCheckpoints.checkpoints[info.index] = info.time
    void allCpsDB.update(currentMapDBId, info.player.login, playerCheckpoints.checkpoints.map(a => a === undefined ? -1 : a))
    emitEvent('PlayerCheckpoint', info.player.login, info.player.nickname, info.index)
  }
  const cp = currentBestSecs[info.index]?.checkpoint
  if (cp === undefined || cp > info.time) {
    currentBestSecs[info.index] = {
      login: info.player.login,
      nickname: info.player.nickname,
      checkpoint: info.time,
      date: date
    }
    cp === undefined ? void bestSecsDB.add(currentMapDBId, info.player.login, info.index, info.time, date)
      : void bestSecsDB.update(currentMapDBId, info.player.login, info.index, info.time, date)
    emitEvent('BestCheckpoint', info.player.login, info.player.nickname, info.index, date)
  }
})

tm.addListener('Controller.PlayerJoin', async (info) => {
  const playerSecs = await allCpsDB.get(currentMapDBId, info.login)
  if (playerSecs instanceof Error) {
    await tm.log.fatal(`Failed to fetch player ${info.login} sectors for map ${tm.maps.current.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.push(...playerSecs)
})

tm.commands.add({
  aliases: ['delmycp', 'deletemycp'],
  help: 'Delete personal cp records or one cp on the current map. Index is 1 based',
  params: [{ name: 'cpIndex', type: 'int', optional: true }],
  callback(info, cpIndex?: number) {
    const secs = currentPlayerSecs.find(a => a.login === info.login)
    if (secs === undefined) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You have no checkpoint records on the ongoing map.`, info.login)
      return
    }
    if (cpIndex === undefined) {
      secs.checkpoints.length = 0
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.servermsg}Your checkpoints on the ongoing map were removed.`, info.login)
      void allCpsDB.update(currentMapDBId, info.login, secs.checkpoints.map(a => a === undefined ? -1 : a))
    } else {
      if (cpIndex < 1 || cpIndex > tm.maps.current.checkpointsAmount) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Checkpoint index needs to be > 0 and <= to the ongoing map's checkpoint count.`, info.login)
        return
      }
      secs.checkpoints[cpIndex - 1] = undefined
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.servermsg}Your ${tm.utils.palette.highlight + tm.utils.getPositionString(cpIndex)}`
        + `${tm.utils.palette.servermsg} checkpoint was removed.`, info.login)
      void allCpsDB.update(currentMapDBId, info.login, secs.checkpoints.map(a => a === undefined ? -1 : a))
    }
    emitEvent('DeletePlayerCheckpoint', info.login)
  },
  privilege: 0
})

tm.commands.add({
  aliases: ['delcp', 'deletecp'],
  help: 'Delete all best cp records or one cp record on current map. Index is 1 based',
  params: [{ name: 'cpIndex', type: 'int', optional: true }],
  callback(info, cpIndex?: number) {
    if (cpIndex === undefined) {
      currentBestSecs.length = 0
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
        + `${tm.utils.palette.highlight + 'all checkpoint records'}${tm.utils.palette.admin} on the ongoing map.`)
      void bestSecsDB.delete(currentMapDBId)
    } else {
      if (cpIndex < 1 || cpIndex > tm.maps.current.checkpointsAmount) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Checkpoint index needs to be > 0 and <= to the ongoing map's checkpoint count.`, info.login)
        return
      }
      currentBestSecs[cpIndex - 1] = undefined
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed the `
        + `${tm.utils.palette.highlight + tm.utils.getPositionString(cpIndex)}${tm.utils.palette.admin} checkpoint record on the ongoing map.`)
      void bestSecsDB.delete(currentMapDBId, cpIndex - 1)
    }
    emitEvent('DeleteBestCheckpoint', currentBestSecs, currentPlayerSecs)
  },
  privilege: 2
})

const getMapCheckpoints = (): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] => {
  const arr: ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] = new Array(tm.maps.current.checkpointsAmount - 1).fill(null)
  for (const [i, e] of currentBestSecs.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerCheckpoints = (): ({ login: string, checkpoints: (number | null)[] })[] => {
  const arr: ({ login: string, checkpoints: (number | null)[] })[] = []
  for (const [i, e] of tm.players.list.entries()) {
    arr[i] = {
      login: e.login,
      checkpoints: new Array(tm.maps.current.checkpointsAmount - 1).fill(null).map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.checkpoints[i] ?? null)
    }
  }
  return arr
}

export { getMapCheckpoints, getPlayerCheckpoints }