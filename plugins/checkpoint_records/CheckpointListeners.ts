import { TRAKMAN as TM } from '../../src/Trakman.js'
import { BestCheckpoints, PlayerCheckpoints } from './CheckpointTypes.js'
import { bestSecsDB, allCpsDB } from './CheckpointDB.js'
import { emitEvent } from './CheckpointEvents.js'

let currentBestSecs: BestCheckpoints

let currentMapDBId: number

const currentPlayerSecs: PlayerCheckpoints[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await TM.db.getMapId(TM.map.id)
  if (DBId === undefined) {
    await TM.fatalError(`Failed to fetch current map (${TM.map.id}) id from database`)
    return
  }
  currentMapDBId = DBId
  const res = await bestSecsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await TM.fatalError(`Failed to fetch best checkpoints for map ${TM.map.id}`, res.message)
    return
  }
  currentBestSecs = res
  const playerSecs = await allCpsDB.get(currentMapDBId, ...TM.players.list.map(a => a.login))
  if (playerSecs instanceof Error) {
    await TM.fatalError(`Failed to fetch player checkpoints for map ${TM.map.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.length = 0
  currentPlayerSecs.push(...playerSecs)
  emitEvent('CheckpointsFetch', currentBestSecs, currentPlayerSecs)
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.BeginMap', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
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

TM.addListener('Controller.PlayerJoin', async (info) => {
  const playerSecs = await allCpsDB.get(currentMapDBId, info.login)
  if (playerSecs instanceof Error) {
    await TM.fatalError(`Failed to fetch player ${info.login} sectors for map ${TM.map.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.push(...playerSecs)
})

TM.addCommand({
  aliases: ['delmycp', 'deletemycp'],
  help: 'Delete personal cp records or one cp on the current map. Index is 1 based',
  params: [{ name: 'cpIndex', type: 'int', optional: true }],
  callback(info, cpIndex?: number) {
    const secs = currentPlayerSecs.find(a => a.login === info.login)
    if (secs === undefined) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You have no checkpoint records on the ongoing map.`, info.login)
      return
    }
    if (cpIndex === undefined) {
      secs.checkpoints.length = 0
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.servermsg}Your checkpoints on the ongoing map were removed.`, info.login)
      void allCpsDB.update(currentMapDBId, info.login, secs.checkpoints.map(a => a === undefined ? -1 : a))
    } else {
      if (cpIndex < 1 || cpIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Checkpoint index needs to be > 0 and <= to the ongoing map's checkpoint count.`, info.login)
        return
      }
      secs.checkpoints[cpIndex - 1] = undefined
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.servermsg}Your ${TM.utils.palette.highlight + TM.utils.getPositionString(cpIndex)}`
        + `${TM.utils.palette.servermsg} checkpoint was removed.`, info.login)
      void allCpsDB.update(currentMapDBId, info.login, secs.checkpoints.map(a => a === undefined ? -1 : a))
    }
    emitEvent('DeletePlayerCheckpoint', info.login)
  },
  privilege: 0
})

TM.addCommand({
  aliases: ['delcp', 'deletecp'],
  help: 'Delete all best cp records or one cp record on current map. Index is 1 based',
  params: [{ name: 'cpIndex', type: 'int', optional: true }],
  callback(info, cpIndex?: number) {
    if (cpIndex === undefined) {
      currentBestSecs.length = 0
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
        + `${TM.utils.palette.highlight + 'all checkpoint records'}${TM.utils.palette.admin} on the ongoing map.`)
      void bestSecsDB.delete(currentMapDBId)
    } else {
      if (cpIndex < 1 || cpIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Checkpoint index needs to be > 0 and <= to the ongoing map's checkpoint count.`, info.login)
        return
      }
      currentBestSecs[cpIndex - 1] = undefined
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed the `
        + `${TM.utils.palette.highlight + TM.utils.getPositionString(cpIndex)}${TM.utils.palette.admin} checkpoint record on the ongoing map.`)
      void bestSecsDB.delete(currentMapDBId, cpIndex - 1)
    }
    emitEvent('DeleteBestCheckpoint', currentBestSecs, currentPlayerSecs)
  },
  privilege: 2
})

const getMapCheckpoints = (): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] => {
  const arr: ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount - 1).fill(null)
  for (const [i, e] of currentBestSecs.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerCheckpoints = (): ({ login: string, checkpoints: (number | null)[] })[] => {
  const arr: ({ login: string, checkpoints: (number | null)[] })[] = []
  for (const [i, e] of TM.players.list.entries()) {
    arr[i] = {
      login: e.login,
      checkpoints: new Array(TM.map.checkpointsAmount - 1).fill(null).map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.checkpoints[i] ?? null)
    }
  }
  return arr
}

export { getMapCheckpoints, getPlayerCheckpoints }