import { TRAKMAN as TM } from '../src/Trakman.js'
import config from '../config.json' assert { type: 'json' }
import { Logger } from '../src/Logger.js'
import 'dotenv/config'

const events: TMListener[] = [
  {
    event: 'Controller.Ready',
    callback: (): void => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.servermsg}Trakman ${TM.palette.highlight}`
        + `v${config.version}${TM.palette.servermsg} startup sequence successful.`)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.servermsg}You can see the changelog with `
        + `${TM.palette.highlight}/changes${TM.palette.servermsg}.`)
    }
  },
  {
    event: ['Controller.BeginMap', 'Controller.Ready'],
    callback: async (): Promise<void> => {
      const allRanks: any[] | Error = await TM.queryDB(`select count(*) from players;`)
      for (const player of TM.players) {
        const index: number = TM.localRecords.findIndex(a => a.login === player.login)
        if (index === -1) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You don't have a personal best on this map.`, player.login)
        } else {
          const rec: TMLocalRecord = TM.localRecords[index]
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.record}Personal best${TM.palette.highlight}: ${TM.Utils.getTimeString(rec.time)}${TM.palette.record}, the `
            + `${TM.palette.rank + TM.Utils.getPositionString(index + 1)} ${TM.palette.record}record.`, player.login)
        }
        const playerRank: number | undefined = player.rank
        if (allRanks instanceof Error) {
          Logger.error('how')
          return
        }
        if (playerRank === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You don't have a rank on the server yet.`, player.login)
        } else {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.record}You are currently ranked ${TM.palette.rank + TM.Utils.getPositionString(playerRank)} ${TM.palette.record}out `
            + `of ${TM.palette.highlight + allRanks[0].count}${TM.palette.record} people total.`, player.login)
        }
      }
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo): Promise<void> => {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Welcome to ${TM.palette.highlight + TM.strip(TM.serverConfig.name)}${TM.palette.error}. `
        + `This server is running Trakman ${TM.palette.highlight}v${config.version}${TM.palette.error}.\n`
        + `${TM.palette.server}» ${TM.palette.error}You can see the recent changes with the ${TM.palette.highlight}/changes ${TM.palette.error}command.`, player.login)
      const index: number = TM.localRecords.findIndex(a => a.login === player.login)
      if (index === -1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You don't have a personal best on this map.`, player.login)
      } else {
        const rec: TMLocalRecord = TM.localRecords[index]
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.record}Personal best${TM.palette.highlight}: ${TM.Utils.getTimeString(rec.time)}${TM.palette.record}, the `
          + `${TM.palette.rank + TM.Utils.getPositionString(index + 1)} ${TM.palette.record}record.`, player.login)
      }
      const playerRank: number | undefined = player.rank
      const allRanks: any[] | Error = await TM.queryDB(`select count(*) from players;`)
      if (allRanks instanceof Error) {
        Logger.error('how')
        return
      }
      if (playerRank === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You don't have a rank on the server yet.`, player.login)
      } else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.record}You are currently ranked ${TM.palette.rank + TM.Utils.getPositionString(playerRank)} ${TM.palette.record}out `
          + `of ${TM.palette.highlight + allRanks[0].count}${TM.palette.record} people total.`, player.login)
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.servermsg}${TM.getTitle(player)}${TM.palette.highlight}: `
        + `${TM.strip(player.nickname, true)}${TM.palette.servermsg} Country${TM.palette.highlight}: `
        + `${player.nation} ${TM.palette.servermsg}Visits${TM.palette.highlight}: ${player.visits}${TM.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.EndMap',
    callback: (endMapInfo: EndMapInfo): void => {
      if (endMapInfo.winnerLogin === undefined || endMapInfo.winnerWins === undefined) {
        return
      }
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.record}You have won your `
        + `${TM.palette.rank + TM.Utils.getPositionString(endMapInfo.winnerWins)}${TM.palette.record} race.`, endMapInfo.winnerLogin)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: (player: LeaveInfo): void => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(player.nickname, true)}${TM.palette.servermsg} `
        + `has quit after ${TM.palette.highlight + TM.msToTime(player.sessionTime)}${TM.palette.servermsg}.`)
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
      const rs = TM.getRankingString(prevPos, info.position, prevTime, info.time)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.record} has `
        + `${rs.status} the ${TM.palette.rank + TM.Utils.getPositionString(info.position)}${TM.palette.record} `
        + `local record. Time${TM.palette.highlight}: ${TM.Utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${TM.palette.record}$n(${TM.palette.rank + info.previousPosition} ${TM.palette.highlight}-${rs.difference + TM.palette.record})` : ``}`)
    }
  },
  {
    event: 'Controller.DedimaniaRecord',
    callback: (info: DediRecordInfo): void => {
      const rs = TM.getRankingString(info.previousPosition, info.position, info.previousTime, info.time)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.dedirecord} has `
        + `${rs.status} the ${TM.palette.rank + TM.Utils.getPositionString(info.position)}${TM.palette.dedirecord} `
        + `dedimania record. Time${TM.palette.highlight}: ${TM.Utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${TM.palette.dedirecord}$n(${TM.palette.rank + info.previousPosition} ${TM.palette.highlight}-${rs.difference + TM.palette.dedirecord})` : ``}`)
    }
  },
]

for (const event of events) { TM.addListener(event.event, event.callback) }
