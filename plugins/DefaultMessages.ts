import { trakman as tm, palette as p } from '../src/Trakman.js'

tm.utils.palette.admin
p.admin

import config from '../config.json' assert { type: 'json' }
import { Logger } from '../src/Logger.js'
import 'dotenv/config'

const events: TMListener[] = [
  {
    event: 'Controller.Ready',
    callback: (): void => {
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.servermsg}Trakman ${tm.utils.palette.highlight}`
        + `v${config.version}${tm.utils.palette.servermsg} startup sequence successful.`)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.servermsg}You can see the changelog with `
        + `${tm.utils.palette.highlight}/changes${tm.utils.palette.servermsg}.`)
    }
  },
  {
    event: ['Controller.BeginMap', 'Controller.Ready'],
    callback: async (): Promise<void> => {
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`)
      for (const player of tm.players.list) {
        const index: number = tm.records.local.findIndex(a => a.login === player.login)
        if (index === -1) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You don't have a personal best on this map.`, player.login)
        } else {
          const rec: TMLocalRecord = tm.records.local[index]
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.record}Personal best${tm.utils.palette.highlight}: ${tm.utils.getTimeString(rec.time)}${tm.utils.palette.record}, the `
            + `${tm.utils.palette.rank + tm.utils.getPositionString(index + 1)} ${tm.utils.palette.record}record.`, player.login)
        }
        const playerRank: number | undefined = player.rank
        if (allRanks instanceof Error) {
          Logger.error('how')
          return
        }
        if (playerRank === undefined) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You don't have a rank on the server yet.`, player.login)
        } else {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.record}You are currently ranked ${tm.utils.palette.rank + tm.utils.getPositionString(playerRank)} ${tm.utils.palette.record}out `
            + `of ${tm.utils.palette.highlight + allRanks[0].count}${tm.utils.palette.record} people total.`, player.login)
        }
      }
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo): Promise<void> => {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Welcome to ${tm.utils.palette.highlight + tm.utils.strip(tm.state.serverConfig.name)}${tm.utils.palette.error}. `
        + `This server is running Trakman ${tm.utils.palette.highlight}v${config.version}${tm.utils.palette.error}.\n`
        + `${tm.utils.palette.server}» ${tm.utils.palette.error}You can see the recent changes with the ${tm.utils.palette.highlight}/changes ${tm.utils.palette.error}command.`, player.login)
      const index: number = tm.records.local.findIndex(a => a.login === player.login)
      if (index === -1) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You don't have a personal best on this map.`, player.login)
      } else {
        const rec: TMLocalRecord = tm.records.local[index]
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.record}Personal best${tm.utils.palette.highlight}: ${tm.utils.getTimeString(rec.time)}${tm.utils.palette.record}, the `
          + `${tm.utils.palette.rank + tm.utils.getPositionString(index + 1)} ${tm.utils.palette.record}record.`, player.login)
      }
      const playerRank: number | undefined = player.rank
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`)
      if (allRanks instanceof Error) {
        Logger.error('how')
        return
      }
      if (playerRank === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You don't have a rank on the server yet.`, player.login)
      } else {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.record}You are currently ranked ${tm.utils.palette.rank + tm.utils.getPositionString(playerRank)} ${tm.utils.palette.record}out `
          + `of ${tm.utils.palette.highlight + allRanks[0].count}${tm.utils.palette.record} people total.`, player.login)
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.servermsg}${tm.utils.getTitle(player)}${tm.utils.palette.highlight}: `
        + `${tm.utils.strip(player.nickname, true)}${tm.utils.palette.servermsg} Country${tm.utils.palette.highlight}: `
        + `${player.country} ${tm.utils.palette.servermsg}Visits${tm.utils.palette.highlight}: ${player.visits}${tm.utils.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.EndMap',
    callback: (endMapInfo: EndMapInfo): void => {
      if (endMapInfo.winnerLogin === undefined || endMapInfo.winnerWins === undefined) {
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.record}You have won your `
        + `${tm.utils.palette.rank + tm.utils.getPositionString(endMapInfo.winnerWins)}${tm.utils.palette.record} race.`, endMapInfo.winnerLogin)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: (player: LeaveInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(player.nickname, true)}${tm.utils.palette.servermsg} `
        + `has quit after ${tm.utils.palette.highlight + tm.utils.msToTime(player.sessionTime)}${tm.utils.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: (info: RecordInfo): void => {
      let prevPos: number = info.previousPosition
      let prevTime: number = info.previousTime
      if (info.previousPosition > Number(process.env.LOCALS_AMOUNT)) {
        prevPos = -1
        prevTime = -1
      }
      const rs = tm.utils.getRankingString(prevPos, info.position, prevTime, info.time)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.record} has `
        + `${rs.status} the ${tm.utils.palette.rank + tm.utils.getPositionString(info.position)}${tm.utils.palette.record} `
        + `local record. Time${tm.utils.palette.highlight}: ${tm.utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${tm.utils.palette.record}$n(${tm.utils.palette.rank + info.previousPosition} ${tm.utils.palette.highlight}-${rs.difference + tm.utils.palette.record})` : ``}`)
    }
  },
  {
    event: 'Controller.DedimaniaRecord',
    callback: (info: DediRecordInfo): void => {
      const rs = tm.utils.getRankingString(info.previousPosition, info.position, info.previousTime, info.time)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.dedirecord} has `
        + `${rs.status} the ${tm.utils.palette.rank + tm.utils.getPositionString(info.position)}${tm.utils.palette.dedirecord} `
        + `dedimania record. Time${tm.utils.palette.highlight}: ${tm.utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${tm.utils.palette.dedirecord}$n(${tm.utils.palette.rank + info.previousPosition} ${tm.utils.palette.highlight}-${rs.difference + tm.utils.palette.dedirecord})` : ``}`)
    }
  },
]

for (const event of events) { tm.addListener(event.event, event.callback) }
