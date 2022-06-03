'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const commands: TMCommand[] = [
    {
      aliases: ['dedirecs'],
      help: '',
      callback: (info: MessageInfo) => {
        const dediRecs: TMDedi[] = TM.dediRecords
        let str = `${TM.colours.yellow}» ${TM.colours.folly}Dedimania records on `
          + `${TM.colours.white + TM.strip(TM.challenge.name, false)}${TM.colours.white}: `
        for (const dr of dediRecs) {
          str += `${TM.strip(dr.nickName, false)}$z$s ${TM.colours.white + '- ' + TM.Utils.getTimeString(dr.score)}, `
        }
        TM.sendMessage(str.slice(0, -2), info.login)
      },
      privilege: 0
    }
  ]
  for (const command of commands) { TM.addCommand(command) }
}
