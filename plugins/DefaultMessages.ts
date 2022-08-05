import { TRAKMAN as TM } from '../src/Trakman.js'
import config from '../config.json' assert { type: 'json' }
import { Logger } from '../src/Logger.js'
import 'dotenv/config'

const events: TMListener[] = [
  {
    event: 'Controller.Ready',
    callback: (): void => {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.servermsg}Trakman ${TM.utils.palette.highlight}`
        + `v${config.version}${TM.utils.palette.servermsg} startup sequence successful.`)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.servermsg}You can see the changelog with `
        + `${TM.utils.palette.highlight}/changes${TM.utils.palette.servermsg}.`)
    }
  },
  {
    event: ['Controller.BeginMap', 'Controller.Ready'],
    callback: async (): Promise<void> => {
      const allRanks: any[] | Error = await TM.db.query(`select count(*) from players;`)
      for (const player of TM.players.list) {
        const index: number = TM.records.local.findIndex(a => a.login === player.login)
        if (index === -1) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You don't have a personal best on this map.`, player.login)
        } else {
          const rec: TMLocalRecord = TM.records.local[index]
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.record}Personal best${TM.utils.palette.highlight}: ${TM.utils.getTimeString(rec.time)}${TM.utils.palette.record}, the `
            + `${TM.utils.palette.rank + TM.utils.getPositionString(index + 1)} ${TM.utils.palette.record}record.`, player.login)
        }
        const playerRank: number | undefined = player.rank
        if (allRanks instanceof Error) {
          Logger.error('how')
          return
        }
        if (playerRank === undefined) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You don't have a rank on the server yet.`, player.login)
        } else {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.record}You are currently ranked ${TM.utils.palette.rank + TM.utils.getPositionString(playerRank)} ${TM.utils.palette.record}out `
            + `of ${TM.utils.palette.highlight + allRanks[0].count}${TM.utils.palette.record} people total.`, player.login)
        }
      }
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo): Promise<void> => {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Welcome to ${TM.utils.palette.highlight + TM.utils.strip(TM.serverConfig.name)}${TM.utils.palette.error}. `
        + `This server is running Trakman ${TM.utils.palette.highlight}v${config.version}${TM.utils.palette.error}.\n`
        + `${TM.utils.palette.server}» ${TM.utils.palette.error}You can see the recent changes with the ${TM.utils.palette.highlight}/changes ${TM.utils.palette.error}command.`, player.login)
      const index: number = TM.records.local.findIndex(a => a.login === player.login)
      if (index === -1) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You don't have a personal best on this map.`, player.login)
      } else {
        const rec: TMLocalRecord = TM.records.local[index]
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.record}Personal best${TM.utils.palette.highlight}: ${TM.utils.getTimeString(rec.time)}${TM.utils.palette.record}, the `
          + `${TM.utils.palette.rank + TM.utils.getPositionString(index + 1)} ${TM.utils.palette.record}record.`, player.login)
      }
      const playerRank: number | undefined = player.rank
      const allRanks: any[] | Error = await TM.db.query(`select count(*) from players;`)
      if (allRanks instanceof Error) {
        Logger.error('how')
        return
      }
      if (playerRank === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You don't have a rank on the server yet.`, player.login)
      } else {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.record}You are currently ranked ${TM.utils.palette.rank + TM.utils.getPositionString(playerRank)} ${TM.utils.palette.record}out `
          + `of ${TM.utils.palette.highlight + allRanks[0].count}${TM.utils.palette.record} people total.`, player.login)
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.servermsg}${TM.utils.getTitle(player)}${TM.utils.palette.highlight}: `
        + `${TM.utils.strip(player.nickname, true)}${TM.utils.palette.servermsg} Country${TM.utils.palette.highlight}: `
        + `${player.nation} ${TM.utils.palette.servermsg}Visits${TM.utils.palette.highlight}: ${player.visits}${TM.utils.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.EndMap',
    callback: (endMapInfo: EndMapInfo): void => {
      if (endMapInfo.winnerLogin === undefined || endMapInfo.winnerWins === undefined) {
        return
      }
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.record}You have won your `
        + `${TM.utils.palette.rank + TM.utils.getPositionString(endMapInfo.winnerWins)}${TM.utils.palette.record} race.`, endMapInfo.winnerLogin)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: (player: LeaveInfo): void => {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(player.nickname, true)}${TM.utils.palette.servermsg} `
        + `has quit after ${TM.utils.palette.highlight + TM.utils.msToTime(player.sessionTime)}${TM.utils.palette.servermsg}.`)
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
      const rs = TM.utils.getRankingString(prevPos, info.position, prevTime, info.time)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.record} has `
        + `${rs.status} the ${TM.utils.palette.rank + TM.utils.getPositionString(info.position)}${TM.utils.palette.record} `
        + `local record. Time${TM.utils.palette.highlight}: ${TM.utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${TM.utils.palette.record}$n(${TM.utils.palette.rank + info.previousPosition} ${TM.utils.palette.highlight}-${rs.difference + TM.utils.palette.record})` : ``}`)
    }
  },
  {
    event: 'Controller.DedimaniaRecord',
    callback: (info: DediRecordInfo): void => {
      const rs = TM.utils.getRankingString(info.previousPosition, info.position, info.previousTime, info.time)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.dedirecord} has `
        + `${rs.status} the ${TM.utils.palette.rank + TM.utils.getPositionString(info.position)}${TM.utils.palette.dedirecord} `
        + `dedimania record. Time${TM.utils.palette.highlight}: ${TM.utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${TM.utils.palette.dedirecord}$n(${TM.utils.palette.rank + info.previousPosition} ${TM.utils.palette.highlight}-${rs.difference + TM.utils.palette.dedirecord})` : ``}`)
    }
  },
]

for (const event of events) { TM.addListener(event.event, event.callback) }
