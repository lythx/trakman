import Chat from "./Chat.js"
import Events from "./Events.js"
import Logger from "./Logger.js"

class Listeners {

    #listeners = [
        {
            event: 'TrackMania.PlayerConnect',
            callback: (params) => {
                Chat.sendMessage(`SUSSY PETYA ${params[0]}`)
            }
        },
        {
            event: 'TrackMania.PlayerChat',
            callback: (params) => {
                Logger.fatal(JSON.stringify(params))
                //  if (Chat.checkIfCommand(params[2]) && params[0]!==0)
                //     Chat.handleCommand(params[1], params[2])
            }
        }
    ]

    constructor() {
        for (const listener of this.#listeners)
            Events.addListener(listener.event, listener.callback)
    }
}

export default Listeners