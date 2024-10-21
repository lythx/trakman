import { dedimania } from '../dedimania/Dedimania.js'
import { ultimania } from '../ultimania/Ultimania.js'
import c from './Config.js'

/**
 * Sends server messages on events.
 * @author lythx & wiseraven
 * @since 0.1
 */

const events: tm.Listener[] = [
  {
    event: 'Startup',
    callback: (): void => {
      if (c.startup.public) { tm.sendMessage(tm.utils.strVar(c.startup.message, { version: tm.config.controller.version })) }
      if (c.changelog.public) { tm.sendMessage(c.changelog.message) }
    }
  },
  {
    event: ['BeginMap', 'Startup'],
    callback: async (): Promise<void> => {
      for (const player of tm.players.list) {
        const index: number = tm.records.local.findIndex(a => a.login === player.login)
        if (index === -1 && c.noPb.public) {
          tm.sendMessage(c.noPb.message, player.login)
        } else {
          if (c.pb.public) {
            const rec: tm.LocalRecord = tm.records.local[index]
            tm.sendMessage(tm.utils.strVar(c.pb.message, {
              time: tm.utils.getTimeString(rec.time),
              rank: tm.utils.getOrdinalSuffix(index + 1)
            }), player.login)
          }
        }
        const playerRank: number | undefined = player.rank
        if (playerRank === undefined && c.noRank.public) {
          tm.sendMessage(c.noRank.message, player.login)
        } else {
          if (c.rank.public) {
            tm.sendMessage(tm.utils.strVar(c.rank.message, {
              rank: tm.utils.getOrdinalSuffix(playerRank ?? 0),
              total: tm.players.totalCount
            }), player.login)
          }
        }
      }
    }
  },
  {
    event: 'PlayerJoin',
    callback: async (player: tm.JoinInfo): Promise<void> => {
      if (c.welcome.public) {
        tm.sendMessage(tm.utils.strVar(c.welcome.message, {
          name: tm.utils.strip(tm.config.server.name),
          version: tm.config.controller.version
        }), player.login)
      }
      if (c.changelog.public) { tm.sendMessage(c.changelog.message, player.login) }
      const index: number = tm.records.local.findIndex(a => a.login === player.login)
      if (index === -1 && c.noPb.public) {
        tm.sendMessage(c.noPb.message, player.login)
      } else {
        if (c.pb.public) {
          const rec: tm.LocalRecord = tm.records.local[index]
          tm.sendMessage(tm.utils.strVar(c.pb.message, {
            time: tm.utils.getTimeString(rec.time),
            rank: tm.utils.getOrdinalSuffix(index + 1)
          }), player.login)
        }
      }
      const playerRank: number | undefined = player.rank
      if (playerRank === undefined && c.noRank.public) {
        tm.sendMessage(c.noRank.message, player.login)
      } else {
        if (c.rank.public) {
          tm.sendMessage(tm.utils.strVar(c.rank.message, {
            rank: tm.utils.getOrdinalSuffix(playerRank ?? 0),
            total: tm.players.totalCount
          }), player.login)
        }
      }
      if (c.join.public) {
        tm.sendMessage(tm.utils.strVar(c.join.message, {
          title: player.title,
          nickname: tm.utils.strip(player.nickname, true),
          country: player.country,
          visits: player.visits
        }))
      }
    }
  },
  {
    event: 'EndMap',
    callback: async (info: tm.EndMapInfo): Promise<void> => {
      if (info.winnerLogin !== undefined && info.winnerWins !== undefined) {
        const player: tm.OfflinePlayer | undefined = tm.players.get(info.winnerLogin) ?? await tm.players.fetch(info.winnerLogin)
        if (info.winnerWins % c.specialWin === 0 && c.winPublic.public) {
          tm.sendMessage(tm.utils.strVar(c.winPublic.message, {
            nickname: tm.utils.strip(player?.nickname ?? '', true),
            wins: tm.utils.getOrdinalSuffix(info.winnerWins)
          }), undefined)
        } else {
          if (c.win.public) {
            tm.sendMessage(tm.utils.strVar(c.win.message, {
              wins: tm.utils.getOrdinalSuffix(info.winnerWins)
            }), info.winnerLogin)
          }
        }
      }
      if (info.droppedMap !== undefined && c.jukeSkipped.public) {
        tm.sendMessage(tm.utils.strVar(c.jukeSkipped.message, {
          map: tm.utils.strip(info.droppedMap.map.name, true),
          nickname: tm.utils.strip((await tm.players.fetch(info.droppedMap.callerLogin))?.nickname ?? '')
        }))
      }
      if (tm.jukebox.juked[0]?.callerLogin !== undefined && c.nextJuke.public) {
        const player: tm.OfflinePlayer | undefined = tm.players.get(tm.jukebox.juked[0].callerLogin) ?? await tm.players.fetch(tm.jukebox.juked[0].callerLogin)
        tm.sendMessage(tm.utils.strVar(c.nextJuke.message, {
          map: tm.utils.strip(tm.utils.decodeURI(tm.jukebox.juked[0].map.name), true),
          nickname: tm.utils.strip(player?.nickname ?? '', true)
        }))
      }
    }
  },
  {
    event: 'PlayerLeave',
    callback: (player: tm.LeaveInfo): void => {
      if (c.leave.public) {
        tm.sendMessage(tm.utils.strVar(c.leave.message, {
          nickname: tm.utils.strip(player.nickname, true),
          time: tm.utils.getVerboseTime(player.sessionTime)
        }))
      }
    }
  },
  {
    event: 'LocalRecord',
    callback: (info: tm.RecordInfo): void => {
      if (c.record.public) {
        const isStunts = tm.getGameMode() === 'Stunts'
        const diffSign = isStunts ? '+' : '-'
        let prevObj: undefined | { time: number, position: number } = info.previous
        if (info.previous !== undefined && info.previous.position > tm.records.maxLocalsAmount) {
          prevObj = undefined
        }
        const rs = tm.utils.getRankingString({ time: info.time, position: info.position }, prevObj)
        tm.sendMessage(tm.utils.strVar(c.record.message, {
          nickname: tm.utils.strip(info.nickname, true),
          status: rs.status,
          position: tm.utils.getOrdinalSuffix(info.position),
          time: tm.utils.getTimeString(info.time),
          type: isStunts ? 'Score' : 'Time',
          difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference.message, {
            position: info.previous?.position,
            time: diffSign + rs.difference
          }) : ''
        }))
      }
    }
  },
  {
    event: 'LapRecord',
    callback: (info: tm.LapRecordInfo): void => {
      if (c.lapRecord.public) {
        let prevObj: undefined | { time: number, position: number } = info.previous
        if (info.previous !== undefined && info.previous.position > tm.records.maxLocalsAmount) {
          prevObj = undefined
        }
        const rs = tm.utils.getRankingString({ time: info.time, position: info.position }, prevObj)
        tm.sendMessage(tm.utils.strVar(c.lapRecord.message, {
          nickname: tm.utils.strip(info.nickname, true),
          status: rs.status,
          position: tm.utils.getOrdinalSuffix(info.position),
          time: tm.utils.getTimeString(info.time),
          difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference.message, {
            position: info.previous?.position,
            time: rs.difference
          }) : ''
        }))
      }
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback, true) }

dedimania.onRecord((record) => {
  if (c.dediRecord.public) {
    const rs = tm.utils.getRankingString({ position: record.position, time: record.time }, record.previous)
    tm.sendMessage(tm.utils.strVar(c.dediRecord.message, {
      nickname: tm.utils.strip(record.nickname, true),
      status: rs.status,
      position: tm.utils.getOrdinalSuffix(record.position),
      time: tm.utils.getTimeString(record.time),
      difference: rs.difference !== undefined ? tm.utils.strVar(c.dediDifference.message, {
        position: record.previous?.position,
        time: rs.difference
      }) : ''
    }))
  }
})

ultimania.onRecord((record) => {
  if (c.ultiRecord.public) {
    const prev = record.previous === undefined ? undefined :
      { time: record.previous.score, position: record.previous.position }
    const rs = tm.utils.getRankingString({ position: record.position, time: record.score }, prev)
    tm.sendMessage(tm.utils.strVar(c.ultiRecord.message, {
      nickname: tm.utils.strip(record.nickname, true),
      status: rs.status,
      position: tm.utils.getOrdinalSuffix(record.position),
      score: record.score,
      difference: rs.difference !== undefined ? tm.utils.strVar(c.ultiDifference.message, {
        position: record.previous?.position,
        score: rs.difference
      }) : ''
    }))
  }
})

