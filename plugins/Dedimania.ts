import { Events } from "../src/Events.js"
import { Client } from "../src/Client.js"
import 'dotenv/config'

if (process.env.USE_DEDIMANIA === 'YES') {
    const plugins: TMEvent[] = [
        {
            event: 'Controller.DedimaniaRecords',
            callback: (params: any[]) => {
                let str = `Dedimania records on ${params[0].Name}: `
                for (const record of params[0].Records) {
                    str += `${record.NickName}[${record.Best}], `
                }
                str = str.substring(0, str.length - 3)
                Client.call('ChatSendServerMessage', [{ string: str }])
            }
        },
    ]
    for (const plugin of plugins)
        Events.addListener(plugin.event, plugin.callback)
}

