'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'
import { TMRecord } from '../src/services/RecordService.js'

const plugins: TMEvent[] = [
  {
    event: 'Controller.PlayerRecord',
    callback: async (params: TMRecord[]) => {
      const player = TM.getPlayer(params[0].login)
      if (player == null) { throw new Error('Cant find player object in runtime memory') }
      const msg = `Player $z${player.nickName} $z${TM.colours.white}$sgot a new personal record: ${TM.Time.getString(params[0].score)}`
      TM.sendMessage(msg)
    }
  }
]

for (const plugin of plugins) {
  TM.addListener(plugin.event, plugin.callback)
}
