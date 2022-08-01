import { TRAKMAN as TM } from '../../src/Trakman.js'
import { BestSectors, PlayerSectors } from './SectorTypes.js'
import { bestSecsDB, allSecsDB } from './SectorDB.js'
import { emitEvent } from './SectorEvents.js'

let currentBestSecs: BestSectors
let currentMapDBId: number
const currentPlayerSecs: PlayerSectors[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await TM.getMapDBId(TM.map.id)
  if (DBId === undefined) {
    await TM.fatalError(`Failed to fetch current map (${TM.map.id}) id from database`)
    return
  }
  currentMapDBId = DBId
  const res = await bestSecsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await TM.fatalError(`Failed to fetch best sectors for map ${TM.map.id}`, res.message)
    return
  }
  currentBestSecs = res
  const playerSecs = await allSecsDB.get(currentMapDBId, ...TM.players.map(a => a.login))
  if (playerSecs instanceof Error) {
    await TM.fatalError(`Failed to fetch player sectors for map ${TM.map.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.length = 0
  currentPlayerSecs.push(...playerSecs)
  emitEvent('SectorsFetch', currentBestSecs, currentPlayerSecs)
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.BeginMap', async (): Promise<void> => {
  await onMapStart()
}, true)

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const date = new Date()
  const playerSectors = currentPlayerSecs.find(a => a.login === info.player.login)
  const time = info.time - (info.player.currentCheckpoints[info.index - 1]?.time ?? 0)
  if (playerSectors === undefined) {
    currentPlayerSecs.push({ login: info.player.login, sectors: [time] })
    void allSecsDB.add(currentMapDBId, info.player.login, [time])
    emitEvent('PlayerSector', info.player.login, info.player.nickname, info.index)
  } else if ((playerSectors.sectors[info.index] ?? Infinity) > time) {
    playerSectors.sectors[info.index] = time
    void allSecsDB.update(currentMapDBId, info.player.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
    emitEvent('PlayerSector', info.player.login, info.player.nickname, info.index)
  }
  const sector = currentBestSecs[info.index]?.sector
  if (sector === undefined || sector > time) {
    currentBestSecs[info.index] = {
      login: info.player.login,
      nickname: info.player.nickname,
      sector: time,
      date: date
    }
    sector === undefined ? void bestSecsDB.add(currentMapDBId, info.player.login, info.index, time, date)
      : void bestSecsDB.update(currentMapDBId, info.player.login, info.index, time, date)
    emitEvent('BestSector', info.player.login, info.player.nickname, info.index, date)
  }
})

TM.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
  const date = new Date()
  const index = info.checkpoints.length
  const playerSectors = currentPlayerSecs.find(a => a.login === info.login)
  const time = info.time - (info.checkpoints[index - 1] ?? 0)
  if (playerSectors === undefined) {
    currentPlayerSecs.push({ login: info.login, sectors: [time] })
    void allSecsDB.add(currentMapDBId, info.login, [time])
    emitEvent('PlayerSector', info.login, info.nickname, index)
  } else if ((playerSectors.sectors[index] ?? Infinity) > time) {
    playerSectors.sectors[index] = time
    void allSecsDB.update(currentMapDBId, info.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
    emitEvent('PlayerSector', info.login, info.nickname, index)
  }
  const sector = currentBestSecs[index]?.sector
  if (sector === undefined || sector > time) {
    currentBestSecs[index] = {
      login: info.login,
      nickname: info.nickname,
      sector: time,
      date: date
    }
    sector === undefined ? void bestSecsDB.add(currentMapDBId, info.login, index, time, date)
      : void bestSecsDB.update(currentMapDBId, info.login, index, time, date)
    emitEvent('BestSector', info.login, info.nickname, index, date)
  }
})

TM.addListener('Controller.PlayerJoin', async (info) => {
  const playerSecs = await allSecsDB.get(currentMapDBId, info.login)
  if (playerSecs instanceof Error) {
    await TM.fatalError(`Failed to fetch player ${info.login} sectors for map ${TM.map.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.push(...playerSecs)
})

TM.addCommand({
  aliases: ['delmysec', 'deletemysector'],
  help: 'Delete player personal sectors or one sector on the current map. Index is 1 based',
  params: [{ name: 'sectorIndex', type: 'int', optional: true }],
  callback(info, sectorIndex?: number) {
    const secs = currentPlayerSecs.find(a => a.login === info.login)
    if (secs === undefined) {
      TM.sendMessage(`You have no sector records on ongoing map`, info.login)
      return
    }
    if (sectorIndex === undefined) {
      secs.sectors.length = 0
      TM.sendMessage(`Deleted sectors on current map`, info.login)
      void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
    } else {
      if (sectorIndex < 1 || sectorIndex > TM.map.checkpointsAmount) {
        TM.sendMessage(`Sector needs to be higher than 0 and lower or equal to current maps sectors amount`, info.login)
        return
      }
      secs.sectors[sectorIndex - 1] = undefined
      TM.sendMessage(`Deleted sector number ${sectorIndex}`, info.login)
      void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
    }
    emitEvent('DeletePlayerSector', info.login)
  },
  privilege: 0
})

TM.addCommand({
  aliases: ['delsec', 'deletesector'],
  help: 'Delete all sector records or one sector record on current map. Index is 1 based',
  params: [{ name: 'sectorIndex', type: 'int', optional: true }],
  callback(info, sectorIndex?: number) {
    if (sectorIndex === undefined) {
      currentBestSecs.length = 0
      TM.sendMessage(`${TM.strip(info.nickname)} deleted sectors on current map`)
      void bestSecsDB.delete(currentMapDBId)
    } else {
      if (sectorIndex < 1 || sectorIndex > TM.map.checkpointsAmount + 1) {
        TM.sendMessage(`Sector needs to be higher than 0 and lower or equal to current maps sectors amount`, info.login)
        return
      }
      currentBestSecs[sectorIndex - 1] = undefined
      TM.sendMessage(`${TM.strip(info.nickname)} deleted sector number ${sectorIndex} on current map`)
      void bestSecsDB.delete(currentMapDBId, sectorIndex - 1)
    }
    emitEvent('DeleteBestSector', currentBestSecs, currentPlayerSecs)
  },
  privilege: 2
})

const getMapSectors = (): ({ login: string, nickname: string, sector: number, date: Date } | null)[] => {
  const arr: ({ login: string, nickname: string, sector: number, date: Date } | null)[] = new Array(TM.map.checkpointsAmount).fill(null)
  for (const [i, e] of currentBestSecs.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerSectors = (): ({ login: string, sectors: (number | null)[] })[] => {
  const arr: ({ login: string, sectors: (number | null)[] })[] = []
  for (const [i, e] of TM.players.entries()) {
    arr[i] = {
      login: e.login,
      sectors: new Array(TM.map.checkpointsAmount).fill(null).map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.sectors[i] ?? null)
    }
  }
  return arr
}

export { getMapSectors, getPlayerSectors }