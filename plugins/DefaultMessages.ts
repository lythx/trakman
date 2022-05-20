'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'


const c1 = TM.colours.white
const c2 = TM.colours.folly

const plugins: TMEvent[] = [
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
    callback: async (params: any[]) => {
      const player = TM.getPlayer(params[0].login)
      if (player == null) { throw new Error('Cant find player object in runtime memory') }
      const records = TM.getLocalRecords(params[0].challenge, 30)
      const position = records.findIndex(r => r.login === player.login)
      if (position === -1) {
        return
      }
      const msg = `Player $z${player.nickName}$z${TM.colours.white}$s${params[1]}${TM.Utils.getPositionString(position + 1)} local record: ${TM.Utils.getTimeString(params[0].score)}`
      await TM.sendMessage(msg)
    }
  }
]

for (const plugin of plugins) {
  TM.addListener(plugin.event, plugin.callback)
}