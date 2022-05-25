import { ChatService } from '../services/ChatService.js'
import { TMXService } from '../services/TMXService.js'
import { Client } from '../Client.js'
import { TRAKMAN as TM } from '../Trakman.js'

const command: TMCommand = {
  aliases: ['add'],
  help: 'Add a track from TMX.',
  callback: async (info: MessageInfo) => {
    const [trackId, game] = info.text.split(' ')
    const file = await TMXService.fetchTrackFile(trackId, game).catch((err: Error) => err)
    if (file instanceof Error) {
      TM.sendMessage(`Failed to fetch map file from ${game || 'TMNF'} TMX, check if you specified the correct game.`, info.login)
      return
    }
    const write = await Client.call('WriteFile', [{ string: file.name }, { base64: file.content }])
    if(write instanceof Error){
      TM.sendMessage(`Server failed to write file`)
      return
    }
    const insert = await Client.call('InsertChallenge', [{ string: file.name }])
    if(insert instanceof Error) {
      TM.sendMessage(`Server failed to add challenge to jukebox`)
      return
    }
    const insertRes = await Client.call('GetNextChallengeInfo')
    if(insertRes instanceof Error) {
      TM.sendMessage('Failed to fetch next challenge info')
      return
    }
    const name = insertRes[0].Name
    TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
        `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has added and queued ` +
        `${TM.colours.white + TM.stripModifiers(name, true)}${TM.colours.folly} from TMX.`)
  },
  privilege: 1
}

ChatService.addCommand(command)
