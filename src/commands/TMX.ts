import { ChatService } from '../services/ChatService.js'
import { TMXService } from '../services/TMXService.js'
import { Client } from '../Client.js'
import { TRAKMAN as TM } from '../Trakman.js'

const command: TMCommand = {
  aliases: ['add'],
  help: 'Add a track from TMX.',
  params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
  callback: async (info: MessageInfo, id: number, tmxSite?: string) => {
    const file = await TMXService.fetchTrackFile(id, tmxSite).catch((err: Error) => err)
    if (file instanceof Error) {
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Failed to fetch file from ${TM.palette.highlight + (tmxSite || 'TMNF')} TMX` +
        `${TM.palette.error}, check if you specified the correct game.`, info.login)
      return
    }
    const write = await Client.call('WriteFile', [{ string: file.name }, { base64: file.content }])
    if (write instanceof Error) {
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Server failed to write file.`, info.login)
      return
    }
    const challenge = await TM.addChallenge(file.name)
    if (challenge instanceof Error) {
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Server failed to queue the challenge.`, info.login)
      return
    }
    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
      `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued ` +
      `${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.admin} from TMX.`)
  },
  privilege: 1
}

ChatService.addCommand(command)
