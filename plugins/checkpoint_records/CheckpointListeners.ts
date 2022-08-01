import { TRAKMAN as TM } from '../../src/Trakman.js'
import { BestCheckpoints, PlayerCheckpoints } from './CheckpointTypes.js'
import { bestSecsDB, allCpsDB } from './CheckpointDB.js'
import { emitEvent } from './CheckpointEvents.js'

let currentBestSecs: BestCheckpoints

let currentMapDBId: number

const currentPlayerSecs: PlayerCheckpoints[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await TM.getMapDBId(TM.map.id)
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
  const playerSecs = await allCpsDB.get(currentMapDBId, ...TM.players.map(a => a.login))
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
      checkpoint:info.time,
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
      TM.sendMessage(`You have no checkpoint records on ongoing map`, info.login)
      return
    }
    if (cpIndex === undefined) {
      secs.checkpoints.length = 0
      TM.sendMessage(`Deleted checkpoints on current map`, info.login)
      void allCpsDB.update(currentMapDBId, info.login, secs.checkpoints.map(a => a === undefined ? -1 : a))
    } else {
      if (cpIndex < 1 || cpIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`Checkpoint index needs to be higher than 0 and lower or equal to current maps checkpoints amount`, info.login)
        return
      }
      secs.checkpoints[cpIndex - 1] = undefined
      TM.sendMessage(`Deleted checkpoint number ${cpIndex}`, info.login)
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
      TM.sendMessage(`${TM.strip(info.nickname)} deleted cp records on current map`)
      void bestSecsDB.delete(currentMapDBId)
    } else {
      if (cpIndex < 1 || cpIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`Checkpoint index needs to be higher than 0 and lower or equal to  current maps checkpoints amount`, info.login)
        return
      }
      currentBestSecs[cpIndex - 1] = undefined
      TM.sendMessage(`${TM.strip(info.nickname)} deleted checkpoint number ${cpIndex} on current map`)
      void bestSecsDB.delete(currentMapDBId, cpIndex - 1)
    }
    emitEvent('DeleteBestCheckpoint', currentBestSecs, currentPlayerSecs)
  },
  privilege: 2
})

const getMapCheckpoints = (): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] => {
  const arr: ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount- 1).fill(null)
  for (const [i, e] of currentBestSecs.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerCheckpoints = (): ({ login: string, checkpoints: (number | null)[] })[] => {
  const arr: ({ login: string, checkpoints: (number | null)[] })[] = []
  for (const [i, e] of TM.players.entries()) {
    arr[i] = {
      login: e.login,
      checkpoints: new Array(TM.map.checkpointsAmount - 1).fill(null).map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.checkpoints[i] ?? null)
    }
  }
  return arr
}

export { getMapCheckpoints, getPlayerCheckpoints }