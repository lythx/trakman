'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const events: TMEvent[] = [
    {
      event: 'Controller.DedimaniaRecords',
      callback: (info: ChallengeDedisInfo) => {
        const dedis = info.dedis
        let str = `${TM.colours.yellow}»» ${TM.colours.folly}Dedimania records on `
          + `${TM.colours.white + TM.strip(TM.challenge.name, true)}: `
        for (const d of dedis) {
          str += `$n${TM.colours.white + TM.strip(d.nickName, true)}`
            + `${TM.colours.grey}[${TM.Utils.getTimeString(d.score)}], $z$s`
        }
        str = str.substring(0, str.length - 2)
        TM.sendMessage(str)
      }
    }
  ]
  for (const event of events) { TM.addListener(event.event, event.callback) }
}
