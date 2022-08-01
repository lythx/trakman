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
    }
  },
  {
    event: ['Controller.BeginMap', 'Controller.Ready'],
    callback: (): void => {
      for (const player of TM.players) {
        let msg: string
        const index: number = TM.localRecords.findIndex(a => a.login === player.login)
        if (index === -1) {
          msg = `${TM.palette.error}You don't have a PB on this map.`
        } else {
          const rec: TMLocalRecord = TM.localRecords[index]
          msg = `${TM.palette.record}PB${TM.palette.highlight}: ${TM.Utils.getTimeString(rec.time)}${TM.palette.record}, `
            + `${TM.palette.rank + TM.Utils.getPositionString(index + 1)} ${TM.palette.record}record.`
        }
        TM.sendMessage(`${TM.palette.server}» ${msg}`, player.login)
      }
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: (player: JoinInfo): void => {
      let msg: string
      const index: number = TM.localRecords.findIndex(a => a.login === player.login)
      if (index === -1) {
        msg = `${TM.palette.error}You don't have a PB on this map.`
      } else {
        const rec: TMLocalRecord = TM.localRecords[index]
        msg = `${TM.palette.record}PB${TM.palette.highlight}: ${TM.Utils.getTimeString(rec.time)}${TM.palette.record}, `
          + `${TM.palette.rank + TM.Utils.getPositionString(index + 1)} ${TM.palette.record}record.`
      }
      TM.sendMessage(`${TM.palette.server}» ${msg}`, player.login)
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.servermsg}${TM.getTitle(player)}${TM.palette.highlight}: `
        + `${TM.strip(player.nickname, true)}${TM.palette.servermsg} Country${TM.palette.highlight}: `
        + `${player.nation} ${TM.palette.servermsg}Visits${TM.palette.highlight}: ${player.visits}${TM.palette.servermsg}.`)
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
      let prevPos = info.previousPosition
      let prevTime = info.previousTime
      if (info.previousPosition > Number(process.env.LOCALS_AMOUNT)) {
        prevPos = -1
        prevTime = -1
      }
      const rs = TM.getRankingString(prevPos, info.position, prevTime, info.time)
      Logger.debug(JSON.stringify(TM.getRankingString(info.previousPosition, info.position, info.previousTime, info.time)))
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
