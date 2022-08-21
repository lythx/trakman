import { trakman as tm, palette as p } from '../src/Trakman.js'
import { dedimania } from './dedimania/Dedimania.js'
import config from '../config.json' assert { type: 'json' }
import { Logger } from '../src/Logger.js'
import 'dotenv/config'

const events: TMListener[] = [
  {
    event: 'Controller.Ready',
    callback: (): void => {
      tm.sendMessage(`${p.server}»» ${p.servermsg}Trakman ${p.highlight}`
        + `v${config.version}${p.servermsg} startup sequence successful.`)
      tm.sendMessage(`${p.server}»» ${p.servermsg}You can see the changelog with `
        + `${p.highlight}/changes${p.servermsg}.`)
    }
  },
  {
    event: ['Controller.BeginMap', 'Controller.Ready'],
    callback: async (): Promise<void> => {
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`)
      for (const player of tm.players.list) {
        const index: number = tm.records.local.findIndex(a => a.login === player.login)
        if (index === -1) {
          tm.sendMessage(`${p.server}» ${p.error}You don't have a personal best on this map.`, player.login)
        } else {
          const rec: TMLocalRecord = tm.records.local[index]
          tm.sendMessage(`${p.server}» ${p.record}Personal best${p.highlight}: ${tm.utils.getTimeString(rec.time)}${p.record}, the `
            + `${p.rank + tm.utils.getPositionString(index + 1)} ${p.record}record.`, player.login)
        }
        const playerRank: number | undefined = player.rank
        if (allRanks instanceof Error) {
          Logger.error('how')
          return
        }
        if (playerRank === undefined) {
          tm.sendMessage(`${p.server}» ${p.error}You don't have a rank on the server yet.`, player.login)
        } else {
          tm.sendMessage(`${p.server}» ${p.record}You are currently ranked ${p.rank + tm.utils.getPositionString(playerRank)} ${p.record}out `
            + `of ${p.highlight + allRanks[0].count}${p.record} people total.`, player.login)
        }
      }
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo): Promise<void> => {
      tm.sendMessage(`${p.server}» ${p.error}Welcome to ${p.highlight + tm.utils.strip(tm.state.serverConfig.name)}${p.error}. `
        + `This server is running Trakman ${p.highlight}v${config.version}${p.error}.\n`
        + `${p.server}» ${p.error}You can see the recent changes with the ${p.highlight}/changes ${p.error}command.`, player.login)
      const index: number = tm.records.local.findIndex(a => a.login === player.login)
      if (index === -1) {
        tm.sendMessage(`${p.server}» ${p.error}You don't have a personal best on this map.`, player.login)
      } else {
        const rec: TMLocalRecord = tm.records.local[index]
        tm.sendMessage(`${p.server}» ${p.record}Personal best${p.highlight}: ${tm.utils.getTimeString(rec.time)}${p.record}, the `
          + `${p.rank + tm.utils.getPositionString(index + 1)} ${p.record}record.`, player.login)
      }
      const playerRank: number | undefined = player.rank
      const allRanks: any[] | Error = await tm.db.query(`select count(*) from players;`)
      if (allRanks instanceof Error) {
        Logger.error('how')
        return
      }
      if (playerRank === undefined) {
        tm.sendMessage(`${p.server}» ${p.error}You don't have a rank on the server yet.`, player.login)
      } else {
        tm.sendMessage(`${p.server}» ${p.record}You are currently ranked ${p.rank + tm.utils.getPositionString(playerRank)} ${p.record}out `
          + `of ${p.highlight + allRanks[0].count}${p.record} people total.`, player.login)
      }
      tm.sendMessage(`${p.server}»» ${p.servermsg}${tm.utils.getTitle(player)}${p.highlight}: `
        + `${tm.utils.strip(player.nickname, true)}${p.servermsg} Country${p.highlight}: `
        + `${player.country} ${p.servermsg}Visits${p.highlight}: ${player.visits}${p.servermsg}.`)
    }
  },
  {
    event: 'Controller.EndMap',
    callback: (endMapInfo: EndMapInfo): void => {
      if (endMapInfo.winnerLogin === undefined || endMapInfo.winnerWins === undefined) {
        return
      }
      tm.sendMessage(`${p.server}» ${p.record}You have won your `
        + `${p.rank + tm.utils.getPositionString(endMapInfo.winnerWins)}${p.record} race.`, endMapInfo.winnerLogin)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: (player: LeaveInfo): void => {
      tm.sendMessage(`${p.server}»» ${p.highlight + tm.utils.strip(player.nickname, true)}${p.servermsg} `
        + `has quit after ${p.highlight + tm.utils.msToTime(player.sessionTime)}${p.servermsg}.`)
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
      tm.sendMessage(`${p.server}»» ${p.highlight + tm.utils.strip(info.nickname, true)}${p.record} has `
        + `${rs.status} the ${p.rank + tm.utils.getPositionString(info.position)}${p.record} `
        + `local record. Time${p.highlight}: ${tm.utils.getTimeString(info.time)}`
        + `${rs.difference !== undefined ? ` ${p.record}$n(${p.rank + info.previousPosition} ${p.highlight}-${rs.difference + p.record})` : ``}`)
    }
  }
]

for (const event of events) { tm.addListener(event.event, event.callback) }

dedimania.onRecord((record) => {
  const rs = tm.utils.getRankingString(record.previousPosition, record.position, record.previousTime, record.time)
  tm.sendMessage(`${p.server}»» ${p.highlight + tm.utils.strip(record.nickname, true)}${p.dedirecord} has `
    + `${rs.status} the ${p.rank + tm.utils.getPositionString(record.position)}${p.dedirecord} `
    + `dedimania record. Time${p.highlight}: ${tm.utils.getTimeString(record.time)}`
    + `${rs.difference !== undefined ? ` ${p.dedirecord}$n(${p.rank + record.previousPosition} ${p.highlight}-${rs.difference + p.dedirecord})` : ``}`)
})
