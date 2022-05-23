import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
  const plugins: TMEvent[] = [
    {
      event: 'Controller.DedimaniaRecords',
      callback: (params: any[]) => {
        let str = `$zDedimania records on ${TM.challenge.name}: `
        for (const record of params) {
          let nick = TM.getPlayer(record.login)?.nickName
          if (nick === undefined) { nick = record.nickName }
          str += `${nick}$z[${TM.Utils.getTimeString(record.score)}], `
        }
        str = str.substring(0, str.length - 2)
        TM.sendMessage(str).then()
      }
    }
  ]
  for (const plugin of plugins) { TM.addListener(plugin.event, plugin.callback) }
}
