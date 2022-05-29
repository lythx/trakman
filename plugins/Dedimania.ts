import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const plugins: TMEvent[] = [
    {
      event: 'Controller.DedimaniaRecords',
      callback: (info: ChallengeDedisInfo) => {
        const dedis = info.dedis
        let str = `${TM.colours.yellow}»» ${TM.colours.folly}Dedimania records on `
          + `${TM.colours.white + TM.stripModifiers(TM.challenge.name, true)}: `
        for (const d of dedis) {
          str += `${TM.colours.white + TM.stripModifiers(d.nickName, false)}`
            + `$z$s[${TM.Utils.getTimeString(d.score)}], `
        }
        str = str.substring(0, str.length - 2)
        TM.sendMessage(str)
      }
    }
  ]
  for (const plugin of plugins) { TM.addListener(plugin.event, plugin.callback) }
}
