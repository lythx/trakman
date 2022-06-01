'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'

const plugins: TMEvent[] = [
  {
    event: 'Controller.Ready',
    callback: async () => {
      TM.sendMessage(
        `${TM.colours.mayablue}||||||||||||||||||TRAKMAN\n`
        + `${TM.colours.carnationpink}||||||||||||||||||0.0.1a\n`
        + `${TM.colours.white}||||||||||||||||||STARTUP\n`
        + `${TM.colours.carnationpink}||||||||||||||||||SEQUENCE\n`
        + `${TM.colours.mayablue}||||||||||||||||||SUCCESSFUL`)
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo) => {
      TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(player)}${TM.colours.white}: `
        + `${TM.strip(player.nickName, true)}${TM.colours.folly} Country${TM.colours.white}: `
        + `${player.nation} ${TM.colours.folly}Visits${TM.colours.white}: ${player.visits}${TM.colours.folly}.`)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: async (player: LeaveInfo) => {
      TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.white + TM.strip(player.nickName, true)}${TM.colours.folly} `
        + `has quit after ${TM.colours.white + TM.msToTime(player.sessionTime)}${TM.colours.folly}.`)
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: async (info: RecordInfo) => {
      TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} `
        + `${info.status} ${TM.colours.white + TM.Utils.getPositionString(info.position)}${TM.colours.folly} `
        + `local record. Time${TM.colours.white}: ${TM.Utils.getTimeString(info.score)}`)
    }
  },
  {
    event: 'Controller.LocalRecords',
    callback: async (info: RecordInfo) => {
      // if(info.status === 0)
      //   return
      // const msg = `Player $z${info.nickName}$z${TM.colours.white}$s${info.status.toString()}${TM.Utils.getPositionString(position + 1)} local record: ${TM.Utils.getTimeString(info.score)}`
      // await TM.sendMessage(msg)
    }
  }
]

for (const plugin of plugins) {
  TM.addListener(plugin.event, plugin.callback)
}
