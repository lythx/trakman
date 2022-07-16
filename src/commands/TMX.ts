import { ChatService } from '../services/ChatService.js'
import { TMXService } from '../services/TMXService.js'
import { Client } from '../client/Client.js'
import { TRAKMAN as TM } from '../Trakman.js'

const command: TMCommand = {
  aliases: ['add'],
  help: 'Add a map from TMX.',
  params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
  callback: async (info: MessageInfo, id: number, tmxSite?: string): Promise<void> => {
    const file: TMXFileData | Error = await TMXService.fetchMapFile(id, tmxSite).catch((err: Error) => err)
    if (file instanceof Error) {
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Failed to fetch file from ${TM.palette.highlight + (tmxSite || 'TMNF')} TMX` +
        `${TM.palette.error}, check if you specified the correct game.`, info.login)
      return
    }
    const base64String: string = file.content.toString('base64')
    const write: any[] | Error = await Client.call('WriteFile', [{ string: file.name }, { base64: base64String }])
    if (write instanceof Error) {
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Server failed to write file.`, info.login)
      return
    }
    const map: TMMap | Error = await TM.addMap(file.name, info.login)
    if (map instanceof Error) {
      if (map.message.trim() === 'Challenge already added. Code: -1000') {
        const content: string = file.content.toString()
        let i: number = 0
        while (i < content.length) {
          if (content.substring(i, i + 12) === `<ident uid="`) {
            const id: string = content.substring(i + 12, i + 12 + 27)
            const map: TMMap | undefined = TM.maps.find(a => a.id === id)
            if (map === undefined) {
              TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Server failed to queue the map.`, info.login)
              return
            }
            TM.addToJukebox(id)
            TM.sendMessage(`${TM.palette.server}» ${TM.palette.admin} ` +
              `${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.admin} is already on the server, ` +
              `it will be ${TM.palette.highlight}queued ${TM.palette.admin}instead.`, info.login)
            return
          }
          i++
        }
      }
      TM.sendMessage(`${TM.palette.server}»${TM.palette.error} Server failed to queue the map.`, info.login)
      return
    }
    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
      `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued ` +
      `${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.admin} from TMX.`)
  },
  privilege: 1
}

ChatService.addCommand(command)
