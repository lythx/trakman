
import { BestCheckpoints, PlayerCheckpoints } from './CheckpointTypes.js'
import { bestCpsDB, allCpsDB } from './CheckpointDB.js'
import { emitEvent } from './CheckpointEvents.js'
import config from './Config.js'

let currentBestCps: BestCheckpoints
let currentMapDBId: number
const currentPlayerCps: PlayerCheckpoints[] = []

const onMapStart = async (): Promise<void> => {
  const DBId = await tm.db.getMapId(tm.maps.current.id)
  if (DBId === undefined) {
    await tm.log.fatal(`Failed to fetch current map (${tm.maps.current.id}) id from database`)
    return
  }
  currentMapDBId = DBId
  const res = await bestCpsDB.get(currentMapDBId)
  if (res instanceof Error) {
    await tm.log.fatal(`Failed to fetch best checkpoints for map ${tm.maps.current.id}`, res.message)
    return
  }
  currentBestCps = res
  const playerCps = await allCpsDB.get(currentMapDBId, ...tm.players.list.map(a => a.login))
  if (playerCps instanceof Error) {
    await tm.log.fatal(`Failed to fetch player checkpoints for map ${tm.maps.current.id}`, playerCps.message)
    return
  }
  currentPlayerCps.length = 0
  currentPlayerCps.push(...playerCps)
  emitEvent('CheckpointsFetch', currentBestCps, playerCps)
}

if (config.isEnabled === true) {

  tm.addListener('Startup', async (): Promise<void> => {
    await onMapStart()
  }, true)

  tm.addListener('BeginMap', async (): Promise<void> => {
    await onMapStart()
  }, true)

  tm.addListener('PlayerCheckpoint', (info: CheckpointInfo) => {
    const date = new Date()
    const playerCheckpoints = currentPlayerCps.find(a => a.login === info.player.login)
    if (playerCheckpoints === undefined) {
      currentPlayerCps.push({ login: info.player.login, nickname: info.player.nickname, checkpoints: [info.time] })
      void allCpsDB.add(currentMapDBId, info.player.login, [info.time])
      emitEvent('PlayerCheckpoint', { login: info.player.login, nickname: info.player.nickname, index: info.index })
    } else if ((playerCheckpoints.checkpoints[info.index] ?? Infinity) > info.time) {
      playerCheckpoints.checkpoints[info.index] = info.time
      void allCpsDB.update(currentMapDBId, info.player.login, playerCheckpoints.checkpoints.map(a => a === undefined ? -1 : a))
      emitEvent('PlayerCheckpoint', { login: info.player.login, nickname: info.player.nickname, index: info.index })
    }
    const cp = currentBestCps[info.index]?.checkpoint
    if (cp === undefined || cp > info.time) {
      currentBestCps[info.index] = {
        login: info.player.login,
        nickname: info.player.nickname,
        checkpoint: info.time,
        date: date
      }
      cp === undefined ? void bestCpsDB.add(currentMapDBId, info.player.login, info.index, info.time, date)
        : void bestCpsDB.update(currentMapDBId, info.player.login, info.index, info.time, date)
      emitEvent('BestCheckpoint', { login: info.player.login, nickname: info.player.nickname, index: info.index, date })
    }
  })

  tm.addListener('PlayerJoin', async (info) => {
    const playerCps = await allCpsDB.get(currentMapDBId, info.login)
    if (playerCps instanceof Error) {
      await tm.log.fatal(`Failed to fetch player ${info.login} checkpoint records for map ${tm.maps.current.id}`, playerCps.message)
      return
    }
    currentPlayerCps.push(...playerCps)
  })

  tm.commands.add({
    aliases: ['delmycp', 'deletemycp'],
    help: 'Delete personal cp records or one cp on the current map. Index is 1 based',
    params: [{ name: 'cpIndex', type: 'int', optional: true }],
    callback(info, cpIndex?: number) {
      const cps = currentPlayerCps.find(a => a.login === info.login)
      if (cps === undefined) {
        tm.sendMessage(config.noCpRecords, info.login)
        return
      }
      if (cpIndex === undefined) {
        const arr: number[] = cps.checkpoints.filter(a => a !== undefined) as any
        cps.checkpoints.length = 0
        tm.sendMessage(config.allPlayerCpsRemoved, info.login)
        emitEvent('DeletePlayerCheckpoint', { ...info, deletedCheckpoints: arr.map((a, i) => ({ time: a, index: i })) })
        void allCpsDB.update(currentMapDBId, info.login, cps.checkpoints.map(a => a === undefined ? -1 : a))
      } else {
        if (cpIndex < 1 || cpIndex > tm.maps.current.checkpointsAmount) {
          tm.sendMessage(config.outOfRange, info.login)
          return
        }
        const deleted = cps.checkpoints[cpIndex - 1]
        cps.checkpoints[cpIndex - 1] = undefined
        tm.sendMessage(tm.utils.strVar(config.playerCpRemoved, { index: tm.utils.getPositionString(cpIndex) }), info.login)
        if (deleted !== undefined) {
          emitEvent('DeletePlayerCheckpoint', { ...info, deletedCheckpoints: [{ time: deleted, index: cpIndex }] })
        }
        void allCpsDB.update(currentMapDBId, info.login, cps.checkpoints.map(a => a === undefined ? -1 : a))
      }
    },
    privilege: 0
  })

  tm.commands.add({
    aliases: ['delcp', 'deletecp'],
    help: 'Delete all best cp records or one cp record on current map. Index is 1 based',
    params: [{ name: 'cpIndex', type: 'int', optional: true }],
    callback(info, cpIndex?: number) {
      if (cpIndex === undefined) {
        const arr: {
          login: string;
          nickname: string;
          checkpoint: number;
          date: Date;
        }[] = currentBestCps.filter(a => a !== undefined) as any
        currentBestCps.length = 0
        tm.sendMessage(tm.utils.strVar(config.allBestCpsRemoved,
          { title: info.title, nickname: tm.utils.strip(info.nickname, true) }))
        emitEvent('DeleteBestCheckpoint', arr.map((a, i) => ({ ...a, index: i })))
        void bestCpsDB.delete(currentMapDBId)
      } else {
        if (cpIndex < 1 || cpIndex > tm.maps.current.checkpointsAmount) {
          tm.sendMessage(config.outOfRange, info.login)
          return
        }
        const deleted = currentBestCps[cpIndex - 1]
        currentBestCps[cpIndex - 1] = undefined
        tm.sendMessage(tm.utils.strVar(config.bestCpRemoved, {
          title: info.title,
          nickname: tm.utils.strip(info.nickname, true),
          index: tm.utils.getPositionString(cpIndex)
        }))
        if (deleted !== undefined) {
          emitEvent('DeleteBestCheckpoint', [{ ...deleted, index: cpIndex }])
        }
        void bestCpsDB.delete(currentMapDBId, cpIndex - 1)
      }
    },
    privilege: 2
  })

}

const getMapCheckpoints = (): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] => {
  const arr: ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] = new Array(tm.maps.current.checkpointsAmount - 1).fill(null)
  for (const [i, e] of currentBestCps.entries()) {
    arr[i] = e ?? null
  }
  return arr
}

const getPlayerCheckpoints = (): ({ login: string, nickname: string, checkpoints: (number | null)[] })[] => {
  const arr: ({ login: string, nickname: string, checkpoints: (number | null)[] })[] = []
  for (const [i, e] of tm.players.list.entries()) {
    arr[i] = {
      login: e.login,
      nickname: e.nickname,
      checkpoints: new Array(tm.maps.current.checkpointsAmount - 1).fill(null).map((a, i) => currentPlayerCps.find(a => a.login === e.login)?.checkpoints[i] ?? null)
    }
  }
  return arr
}

export { getMapCheckpoints, getPlayerCheckpoints }