'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'

const c1 = TM.colours.white
const c2 = TM.colours.folly

const plugins: TMEvent[] = [
  {
    event: 'Controller.Ready',
    callback: async () => {
      TM.sendMessage(`${c2}TRAKMAN ${c1}started`)
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: TMPlayer) => {
      const title = TM.getTitle(player)
      const nick = TM.stripModifiers(player.nickName)
      const msg = `»» ${c2}${title}${c1}: ${nick}$z$s${c2} Country${c1}: ${player.nation} ${c2}Visits: ${c1}${player.visits}${c2}.`
      TM.sendMessage(msg)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: async (player: PlayerInfo) => {
      const nick = TM.stripModifiers(player.nickName)
      const msg = `»» ${c1}${nick}$z$s${c2} left after ${c1}${TM.msToTime(player.sessionTime)}${c2}.`
      TM.sendMessage(msg)
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: async (info: RecordInfo) => {
      const msg = `Player $z${info.nickName}$z${TM.colours.white}$s ${info.status} ${TM.Utils.getPositionString(info.position)} local record: ${TM.Utils.getTimeString(info.score)}`
      await TM.sendMessage(msg)
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
