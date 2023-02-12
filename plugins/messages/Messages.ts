import { dedimania } from '../dedimania/Dedimania.js'
import c from './Config.js'

/**
 * Sends server messages on events
 * @author lythx & wiseraven
 * @since 0.1
 */

const events: tm.Listener[] = [
  {
    event: 'Startup',
    callback: (): void => {
      tm.sendMessage(tm.utils.strVar(c.startup, { version: tm.config.controller.version }))
      tm.sendMessage(c.changelog)
    }
  },
  {
    event: ['BeginMap', 'Startup'],
    callback: async (): Promise<void> => {
      for (const player of tm.players.list) {
        const index: number = tm.records.local.findIndex(a => a.login === player.login)
        if (index === -1) {
          tm.sendMessage(c.noPb, player.login)
        } else {
          const rec: tm.LocalRecord = tm.records.local[index]
          tm.sendMessage(tm.utils.strVar(c.pb, {
            time: tm.utils.getTimeString(rec.time),
            rank: tm.utils.getPositionString(index + 1)
          }), player.login)
        }
        const playerRank: number | undefined = player.rank
        if (playerRank === undefined) {
          tm.sendMessage(c.noRank, player.login)
        } else {
          tm.sendMessage(tm.utils.strVar(c.rank, {
            rank: tm.utils.getPositionString(playerRank),
            total: tm.players.totalCount
          }), player.login)
        }
      }
    }
  },
  {
    event: 'PlayerJoin',
    callback: async (player: tm.JoinInfo): Promise<void> => {
      tm.sendMessage(tm.utils.strVar(c.welcome, {
        name: tm.utils.strip(tm.config.server.name),
        version: tm.config.controller.version
      }), player.login)
      tm.sendMessage(c.changelog, player.login)
      const index: number = tm.records.local.findIndex(a => a.login === player.login)
      if (index === -1) {
        tm.sendMessage(c.noPb, player.login)
      } else {
        const rec: tm.LocalRecord = tm.records.local[index]
        tm.sendMessage(tm.utils.strVar(c.pb, {
          time: tm.utils.getTimeString(rec.time),
          rank: tm.utils.getPositionString(index + 1)
        }), player.login)
      }
      const playerRank: number | undefined = player.rank
      if (playerRank === undefined) {
        tm.sendMessage(c.noRank, player.login)
      } else {
        tm.sendMessage(tm.utils.strVar(c.rank, {
          rank: tm.utils.getPositionString(playerRank),
          total: tm.players.totalCount
        }), player.login)
      }
      tm.sendMessage(tm.utils.strVar(c.join, {
        title: player.title,
        nickname: tm.utils.strip(player.nickname, true),
        country: player.country,
        visits: player.visits
      }))
    }
  },
  {
    event: 'EndMap',
    callback: async (info: tm.EndMapInfo): Promise<void> => {
      if (info.winnerLogin !== undefined && info.winnerWins !== undefined) {
        tm.sendMessage(tm.utils.strVar(c.win, {
          wins: tm.utils.getPositionString(info.winnerWins)
        }), info.winnerLogin)
      }
      if (tm.jukebox.juked.length !== 0 && tm.jukebox.juked[0].callerLogin !== undefined) {
        const player: tm.OfflinePlayer | undefined = tm.players.get(tm.jukebox.juked[0].callerLogin) ?? await tm.players.fetch(tm.jukebox.juked[0].callerLogin) ?? undefined
        if (player === undefined) { return } // Not even possible
        tm.sendMessage(tm.utils.strVar(c.nextJuke, {
          map: tm.utils.strip(tm.jukebox.juked[0].map.name, true),
          nickname: tm.utils.strip(player?.nickname, true)
        }))
      }
    }
  },
  {
    event: 'PlayerLeave',
    callback: (player: tm.LeaveInfo): void => {
      tm.sendMessage(tm.utils.strVar(c.leave, {
        nickname: tm.utils.strip(player.nickname, true),
        time: tm.utils.msToTime(player.sessionTime)
      }))
    }
  },
  {
    event: 'LocalRecord',
    callback: (info: tm.RecordInfo): void => {
      let prevObj: undefined | { time: number, position: number } = info.previous
      if (info.previous !== undefined && info.previous.position > tm.records.maxLocalsAmount) {
        prevObj = undefined
      }
      const rs = tm.utils.getRankingString({ time: info.time, position: info.position }, prevObj)
      tm.sendMessage(tm.utils.strVar(c.record, {
        nickname: tm.utils.strip(info.nickname, true),
        status: rs.status,
        position: tm.utils.getPositionString(info.position),
        time: tm.utils.getTimeString(info.time),
        difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference, {
          position: info.previous?.position,
          time: rs.difference
        }) : ''
      }))
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback, true) }

dedimania.onRecord((record) => {
  const rs = tm.utils.getRankingString({ position: record.position, time: record.time }, record.previous)
  tm.sendMessage(tm.utils.strVar(c.dediRecord, {
    nickname: tm.utils.strip(record.nickname, true),
    status: rs.status,
    position: tm.utils.getPositionString(record.position),
    time: tm.utils.getTimeString(record.time),
    difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference, {
      position: record.previous?.position,
      time: rs.difference
    }) : ''
  }))
})
