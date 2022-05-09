import Events from "./Events"


const event = 'TrackMania.PlayerConnect'
const callback = (params) => {
    Chat.sendMessage(`SUSSY PETYA ${params[0]}`)
}


Events.addListener(event, callback)