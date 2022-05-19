import { TRAKMAN as TM } from '../src/Trakman.js'
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
    const plugins: TMEvent[] = [
        {
            event: 'Controller.DedimaniaRecords',
            callback: (params: any[]) => {
                let str = `$zDedimania records on ${params[0].Name}: `
                for (const record of params[0].Records) {
                    str += `${record.NickName}$z[${TM.Utils.getTimeString(record.Best)}], `
                }
                str = str.substring(0, str.length - 3)
                TM.sendMessage(str)
            }
        },
    ]
    for (const plugin of plugins)
        TM.addListener(plugin.event, plugin.callback)
}