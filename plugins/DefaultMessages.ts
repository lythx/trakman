'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'

const plugins: TMEvent[] = [
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
      const msg = `Player $z${player.nickName}$z${TM.colours.white}$s${params[1]}${position + 1}${TM.Utils.getPositionString(position + 1)} local record: ${TM.Utils.getTimeString(params[0].score)}`
      await TM.sendMessage(msg)
    }
  }
]

for (const plugin of plugins) {
  TM.addListener(plugin.event, plugin.callback)
}