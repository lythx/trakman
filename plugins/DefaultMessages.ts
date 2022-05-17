'use strict'

import {TMRecord} from "../src/services/RecordService.js";
import {PlayerService} from "../src/services/PlayerService.js";
import {Client} from "../src/Client.js";
import {Events} from "../src/Events.js";
import {Time} from "../src/types/Time.js"
import colours from "../src/data/Colours.json" assert {type: 'json'}

const plugins: TMEvent[] = [
  {
    event: 'Controller.PlayerRecord',
    callback: async (params: TMRecord[]) => {
      const nick = PlayerService.getPlayer(params[0].login).nickName
      const msg = `Player $z${nick} $z${colours.white}$sgot a new personal record: ${Time.getString(params[0].score)}`
      await Client.call('ChatSendServerMessage', [{string: msg}])
    }
  }
]

for (const plugin of plugins) {
  Events.addListener(plugin.event, plugin.callback)
}