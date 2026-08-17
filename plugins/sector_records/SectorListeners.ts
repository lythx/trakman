import type { BestSectors, PlayerSectors } from './SectorTypes.js'
import { allSecsDB, bestSecsDB } from './SectorDB.js'
import { addListener, emitEvent } from './SectorEvents.js'
import config from './Config.js'

let currentBestSecs: BestSectors
let currentMapDBId: number
const currentPlayerSecs: PlayerSectors[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await tm.db.getMapId(tm.maps.current.id)
  if (DBId === undefined) {
    await tm.log.fatal(`Failed to fetch current map (${tm.maps.current.id}) id from database`)
    return
  }
  currentMapDBId = DBId?.[0].id
  const res = await bestSecsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await tm.log.fatal(`Failed to fetch best sectors for map ${tm.maps.current.id}`, res.message)
    return
  }
  if (res === undefined) {
    return
  }
  currentBestSecs = res
  const playerSecs = await allSecsDB.get(currentMapDBId, ...tm.players.list.map(a => a.login))
  if (playerSecs instanceof Error) {
    await tm.log.fatal(`Failed to fetch player sectors for map ${tm.maps.current.id}`, playerSecs.message)
    return
  }
  currentPlayerSecs.length = 0
  currentPlayerSecs.push(...playerSecs)
  void emitEvent('SectorsFetch', currentBestSecs, currentPlayerSecs)
}

if (config.isEnabled) {

  tm.addListener('Startup', async (): Promise<void> => {
    await onMapStart()
  }, true)

  tm.addListener('BeginMap', async (): Promise<void> => {
    await onMapStart()
  }, true)

  const playerDataUpdated = (info: readonly tm.PlayerDataUpdatedInfo[], fromQueue: boolean = false) => {
    if (currentBestSecs === undefined) {
      if (!fromQueue) {
        tm.log.debug('PlayerDataUpdated event before sectors initialised, adding to queue')
        addListener('SectorsFetch', () => playerDataUpdated(info, true))
      } else {
        void tm.log.fatal('currentBestSecs is still undefined after sectors plugin initialisation')
      }
      return
    }
    const changedObjects: {
      login: string;
      nickname: string;
    }[] = []
    for (const e of currentBestSecs) {
      if (e === undefined) { continue }
      const newNickname = info.find(a => a.login === e.login)?.nickname
      if (newNickname !== undefined) {
        e.nickname = newNickname
        changedObjects.push(e)
      }
    }
    for (const e of currentPlayerSecs) {
      if (e === undefined) { continue }
      const newNickname = info.find(a => a.login === e.login)?.nickname
      if (newNickname !== undefined) {
        e.nickname = newNickname
        changedObjects.push(e)
      }
    }
    if (changedObjects.length !== 0) {
      void emitEvent('NicknameUpdated', changedObjects)
    }
  }
  tm.addListener('PlayerDataUpdated', playerDataUpdated)

  const playerCheckpoint = (info: tm.CheckpointInfo, fromQueue: boolean = false) => {
    if (currentBestSecs === undefined) {
      if (!fromQueue) {
        tm.log.debug('PlayerCheckpoint event before sectors initialised, adding to queue')
        addListener('SectorsFetch', () => playerCheckpoint(info, true))
      } else {
        void tm.log.fatal('currentBestSecs is still undefined after sectors plugin initialisation')
      }
      return
    }
    const date = new Date()
    const playerSectors = currentPlayerSecs.find(a => a.login === info.player.login)
    const time = info.time - (info.player.currentCheckpoints[info.index - 1]?.time ?? 0)
    const isStunts = tm.getGameMode() === 'Stunts'
    if (playerSectors === undefined) {
      currentPlayerSecs.push({
        login: info.player.login,
        sectors: [time],
        nickname: info.player.nickname
      })
      void allSecsDB.add(currentMapDBId, info.player.login, [time])
      emitEvent('PlayerSector', {
        login: info.player.login,
        nickname: info.player.nickname,
        index: info.index
      })
    } else if (((playerSectors.sectors[info.index] ?? Infinity) > time && !isStunts) || ((playerSectors.sectors[info.index] ?? -1) < time && isStunts)) {
      playerSectors.sectors[info.index] = time
      void allSecsDB.update(currentMapDBId, info.player.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
      emitEvent('PlayerSector', {
        login: info.player.login,
        nickname: info.player.nickname,
        index: info.index
      })
    }
    const sector = currentBestSecs[info.index]?.sector
    if (sector === undefined || (sector > time && !isStunts) || (sector < time && isStunts)) {
      currentBestSecs[info.index] = {
        login: info.player.login,
        nickname: info.player.nickname,
        sector: time,
        date: date
      }
      sector === undefined ? void bestSecsDB.add(currentMapDBId, info.player.login, info.index, time, date) :
        void bestSecsDB.update(currentMapDBId, info.player.login, info.index, time, date)
      emitEvent('BestSector', {
        login: info.player.login,
        nickname: info.player.nickname,
        index: info.index,
        date
      })
    }
  }
  tm.addListener('PlayerCheckpoint', playerCheckpoint)

  const playerFinish = (info: tm.FinishInfo, fromQueue: boolean = false) => {
    if (currentBestSecs === undefined) {
      if (!fromQueue) {
        tm.log.debug('PlayerCheckpoint event before sectors initialised, adding to queue')
        addListener('SectorsFetch', () => playerFinish(info, true))
      } else {
        void tm.log.fatal('currentBestSecs is still undefined after sectors plugin initialisation')
      }
      return
    }
    const date = new Date()
    const index = info.checkpoints.length
    const playerSectors = currentPlayerSecs.find(a => a.login === info.login)
    const time = info.time - (info.checkpoints[index - 1] ?? 0)
    const isStunts = tm.getGameMode() === 'Stunts'
    if (playerSectors === undefined) {
      currentPlayerSecs.push({
        login: info.login,
        sectors: [time],
        nickname: info.nickname
      })
      void allSecsDB.add(currentMapDBId, info.login, [time])
      emitEvent('PlayerSector', {
        login: info.login,
        nickname: info.nickname,
        index: index
      })
    } else if (((playerSectors.sectors[index] ?? Infinity) > time && !isStunts) || ((playerSectors.sectors[index] ?? -1) < time && isStunts)) {
      playerSectors.sectors[index] = time
      void allSecsDB.update(currentMapDBId, info.login, playerSectors.sectors.map(a => a === undefined ? -1 : a))
      emitEvent('PlayerSector', {
        login: info.login,
        nickname: info.nickname,
        index: index
      })
    }
    const sector = currentBestSecs[index]?.sector
    if (sector === undefined || (sector > time && !isStunts) || (sector < time && isStunts)) {
      currentBestSecs[index] = {
        login: info.login,
        nickname: info.nickname,
        sector: time,
        date: date
      }
      sector === undefined ? void bestSecsDB.add(currentMapDBId, info.login, index, time, date) :
        void bestSecsDB.update(currentMapDBId, info.login, index, time, date)
      emitEvent('BestSector', {
        login: info.login,
        nickname: info.nickname,
        index: index,
        date
      })
    }
  }
  tm.addListener('PlayerFinish', playerFinish)

  const playerJoin = async (info: Readonly<Omit<tm.Player, 'currentCheckpoints'>>, fromQueue: boolean = false) => {
    if (currentBestSecs === undefined) {
      if (!fromQueue) {
        tm.log.debug('PlayerCheckpoint event before sectors initialised, adding to queue')
        addListener('SectorsFetch', () => playerJoin(info, true))
      } else {
        void tm.log.fatal('currentBestSecs is still undefined after sectors plugin initialisation')
      }
      return
    }
    const playerSecs = await allSecsDB.get(currentMapDBId, info.login)
    if (playerSecs instanceof Error) {
      await tm.log.fatal(`Failed to fetch player ${info.login} sectors for map ${tm.maps.current.id}`,
        playerSecs.message)
      return
    }
    currentPlayerSecs.push(...playerSecs)
  }
  tm.addListener('PlayerJoin', playerJoin)

  tm.commands.add({
    aliases: config.commands.deletemysector.aliases,
    help: config.commands.deletemysector.help,
    params: [{
      name: 'sectorIndex',
      type: 'int',
      optional: true
    }],
    callback(info, sectorIndex?: number) {
      if (currentBestSecs === undefined) {
        tm.sendMessage(config.noSectorRecords, info.login)
        return
      }
      const secs = currentPlayerSecs.find(a => a.login === info.login)
      if (secs === undefined) {
        tm.sendMessage(config.noSectorRecords, info.login)
        return
      }
      if (sectorIndex === undefined) {
        const arr: number[] = secs.sectors.filter(a => a !== undefined) as any
        secs.sectors.length = 0
        tm.sendMessage(config.allPlayerSectorsRemoved, info.login)
        emitEvent('DeletePlayerSector', {
          ...info,
          deletedSectors: arr.map((a, i) => ({
            time: a,
            index: i
          }))
        })
        void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
      } else {
        if (sectorIndex < 1 || sectorIndex > tm.maps.current.checkpointsAmount) {
          tm.sendMessage(config.outOfRange, info.login)
          return
        }
        const deleted = secs.sectors[sectorIndex - 1]
        secs.sectors[sectorIndex - 1] = undefined
        tm.sendMessage(tm.utils.strVar(config.playerSectorRemoved, { index: tm.utils.getOrdinalSuffix(sectorIndex) }),
          info.login)
        if (deleted !== undefined) {
          emitEvent('DeletePlayerSector', {
            ...info,
            deletedSectors: [{
              time: deleted,
              index: sectorIndex
            }]
          })
        }
        void allSecsDB.update(currentMapDBId, info.login, secs.sectors.map(a => a === undefined ? -1 : a))
      }
    },
    privilege: config.commands.deletemysector.privilege
  }, {
    aliases: config.commands.deletesector.aliases,
    help: config.commands.deletesector.help,
    params: [{
      name: 'sectorIndex',
      type: 'int',
      optional: true
    }],
    callback(info, sectorIndex?: number) {
      if (currentBestSecs === undefined) {
        tm.sendMessage(config.noSectorRecords, info.login)
        return
      }
      if (sectorIndex === undefined) {
        const arr: {
          login: string,
          nickname: string,
          sector: number,
          date: Date
        }[] = currentBestSecs.filter(a => a !== undefined) as any
        currentBestSecs.length = 0
        tm.sendMessage(tm.utils.strVar(config.allBestSectorsRemoved, {
          title: info.title,
          nickname: tm.utils.strip(info.nickname, true)
        }))
        emitEvent('DeleteBestSector', arr.map((a, i) => ({
          ...a,
          index: i
        })))
        void bestSecsDB.delete(currentMapDBId)
      } else {
        if (sectorIndex < 1 || sectorIndex > tm.maps.current.checkpointsAmount + 1) {
          tm.sendMessage(config.outOfRange, info.login)
          return
        }
        const deleted = currentBestSecs[sectorIndex - 1]
        currentBestSecs[sectorIndex - 1] = undefined
        tm.sendMessage(tm.utils.strVar(config.bestSectorRemoved, {
          title: info.title,
          nickname: tm.utils.strip(info.nickname, true),
          index: tm.utils.getOrdinalSuffix(sectorIndex)
        }), config.commands.deletesector.public ? undefined : info.login)
        if (deleted !== undefined) {
          emitEvent('DeleteBestSector', [{
            ...deleted,
            index: sectorIndex
          }])
        }
        void bestSecsDB.delete(currentMapDBId, sectorIndex - 1)
      }
    },
    privilege: config.commands.deletesector.privilege
  })
}

const getMapSectors = (): ({
  login: string,
  nickname: string,
  sector: number,
  date: Date
} | null)[] => {
  if (currentBestSecs === undefined) {
    tm.log.debug('getMapSectors called before initialisation, aborting')
    return []
  }
  const arr: ({
    login: string,
    nickname: string,
    sector: number,
    date: Date
  } | null)[] = new Array(tm.maps.current.checkpointsAmount).fill(null)
  for (const [i, e] of currentBestSecs.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerSectors = (): ({
  login: string,
  nickname: string,
  sectors: (number | null)[]
})[] => {
  const arr: ({
    login: string,
    nickname: string,
    sectors: (number | null)[]
  })[] = []
  for (const [i, e] of tm.players.list.entries()) {
    arr[i] = {
      login: e.login,
      nickname: e.nickname,
      sectors: new Array(tm.maps.current.checkpointsAmount).fill(null)
      .map((a, i) => currentPlayerSecs.find(a => a.login === e.login)?.sectors[i] ?? null)
    }
  }
  return arr
}

export { getMapSectors, getPlayerSectors }
