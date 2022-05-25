import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const plugins: TMEvent[] = [
    {
      event: 'Controller.DedimaniaRecords',
      callback: (params: any[]) => {
        let str = `${TM.colours.yellow}»» ${TM.colours.folly}Dedimania records on `
          + `${TM.colours.white + TM.stripModifiers(TM.challenge.name, true)}: `
        for (const record of params) {
          str += `${TM.colours.white + TM.stripModifiers(record.nickName, false)}`
            + `$z$s[${TM.Utils.getTimeString(record.score)}], `
        }
        str = str.substring(0, str.length - 2)
        TM.sendMessage(str)
      }
    }
  ]
  for (const plugin of plugins) { TM.addListener(plugin.event, plugin.callback) }
}
