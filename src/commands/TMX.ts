import { ChatService } from '../services/ChatService.js'
import { TMXService } from '../services/TMXService.js'
import { Client } from '../client/Client.js'
import { trakman as TM } from '../Trakman.js'

const command: TMCommand = {
  aliases: ['add'],
  help: 'Add a map from TMX.',
  params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
  callback: async (info: MessageInfo, id: number, tmxSite?: string): Promise<void> => {
    const tmxSites: TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
    const site: TMXSite | undefined = tmxSites.find(a => a === tmxSite)
    const file: { name: string, content: Buffer } | Error = await TMXService.fetchMapFile(id, site).catch((err: Error) => err)
    if (file instanceof Error) {
      TM.sendMessage(`${TM.utils.palette.server}»${TM.utils.palette.error} Failed to fetch file from ${TM.utils.palette.highlight + (tmxSite || 'TMNF')} TMX` +
        `${TM.utils.palette.error}, check if you specified the correct game.`, info.login)
      return
    }
    const base64String: string = file.content.toString('base64')
    const write: any[] | Error = await Client.call('WriteFile', [{ string: file.name }, { base64: base64String }])
    if (write instanceof Error) {
      TM.sendMessage(`${TM.utils.palette.server}»${TM.utils.palette.error} Server failed to write file.`, info.login)
      return
    }
    const map: TMMap | Error = await TM.maps.add(file.name, info.login)
    if (map instanceof Error) {
      if (map.message.trim() === 'Challenge already added. Code: -1000') {
        const content: string = file.content.toString()
        let i: number = 0
        while (i < content.length) {
          if (content.substring(i, i + 12) === `<ident uid="`) {
            const id: string = content.substring(i + 12, i + 12 + 27)
            const map: TMMap | undefined = TM.maps.list.find(a => a.id === id)
            if (map === undefined) {
              TM.sendMessage(`${TM.utils.palette.server}»${TM.utils.palette.error} Server failed to queue the map.`, info.login)
              return
            }
            TM.jukebox.add(id, info.login)
            TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.admin} ` +
              `${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.admin} is already on the server, ` +
              `it will be ${TM.utils.palette.highlight}queued ${TM.utils.palette.admin}instead.`, info.login)
            return
          }
          i++
        }
      }
      TM.sendMessage(`${TM.utils.palette.server}»${TM.utils.palette.error} Server failed to queue the map.`, info.login)
      return
    }
    TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} ` +
      `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added and queued ` +
      `${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.admin} from TMX.`)
  },
  privilege: 1
}

ChatService.addCommand(command)
