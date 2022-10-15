import { dedimania } from '../dedimania/Dedimania.js'
import { Logger } from '../../src/Logger.js'
import c from './Config.js'

const events: tm.Listener[] = [
  {
    event: 'Startup',
    callback: (): void => {
      tm.sendMessage(tm.utils.strVar(c.startup, { version: tm.config.version }))
      tm.sendMessage(c.changelog)
    }
  },
  {
    event: ['BeginMap', 'Startup'],
    callback: async (): Promise<void> => {
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`) //FIX
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
        if (allRanks instanceof Error) {
          Logger.error('how')
          return
        }
        if (playerRank === undefined) {
          tm.sendMessage(c.noRank, player.login)
        } else {
          tm.sendMessage(tm.utils.strVar(c.rank, {
            rank: tm.utils.getPositionString(playerRank),
            total: allRanks[0].count
          }), player.login)
        }
      }
    }
  },
  {
    event: 'PlayerJoin',
    callback: async (player: tm.JoinInfo): Promise<void> => {
      tm.sendMessage(tm.utils.strVar(c.welcome, {
        name: tm.utils.strip(tm.state.serverConfig.name),
        version: tm.config.version
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
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`) // FIX TOO
      if (allRanks instanceof Error) {
        Logger.error('how')
        return
      }
      if (playerRank === undefined) {
        tm.sendMessage(c.noRank, player.login)
      } else {
        tm.sendMessage(tm.utils.strVar(c.rank, {
          rank: tm.utils.getPositionString(playerRank),
          total: allRanks[0].count
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
    callback: (info: tm.EndMapInfo): void => {
      if (info.winnerLogin === undefined || info.winnerWins === undefined) {
        return
      }
      tm.sendMessage(tm.utils.strVar(c.win, {
        wins: tm.utils.getPositionString(info.winnerWins)
      }), info.winnerLogin)
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
      let prevPos: number = info.previousPosition
      let prevTime: number = info.previousTime
      if (info.previousPosition > tm.records.maxLocalsAmount) {
        prevPos = -1
        prevTime = -1
      }
      const rs = tm.utils.getRankingString(prevPos, info.position, prevTime, info.time)
      tm.sendMessage(tm.utils.strVar(c.record, {
        nickname: tm.utils.strip(info.nickname, true),
        status: rs.status,
        position: tm.utils.getPositionString(info.position),
        time: tm.utils.getTimeString(info.time),
        difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference, {
          position: info.previousPosition,
          time: rs.difference
        }) : ''
      }))
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback, true) }

dedimania.onRecord((record) => {
  const rs = tm.utils.getRankingString(record.previousPosition, record.position, record.previousTime, record.time)
  tm.sendMessage(tm.utils.strVar(c.dediRecord, {
    nickname: tm.utils.strip(record.nickname, true),
    status: rs.status,
    position: tm.utils.getPositionString(record.position),
    time: tm.utils.getTimeString(record.time),
    difference: rs.difference !== undefined ? tm.utils.strVar(c.recordDifference, {
      position: record.previousPosition,
      time: rs.difference
    }) : ''
  }))
})
