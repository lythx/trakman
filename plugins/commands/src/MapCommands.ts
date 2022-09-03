import { trakman as tm } from '../../../src/Trakman.js'
import config from '../config/MapCommands.config.js'

const commands: TMCommand[] = [
  {
    aliases: ['add'], // TODO config
    help: 'Add a map from TMX.',
    params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
    callback: async (info: TMMessageInfo, id: number, tmxSite?: string): Promise<void> => {
      const tmxSites: TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
      const site: TMXSite | undefined = tmxSites.find(a => a === tmxSite)
      const file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(id, site).catch((err: Error) => err)
      if (file instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}»${tm.utils.palette.error} Failed to fetch file from ${tm.utils.palette.highlight + (tmxSite || 'TMNF')} TMX` +
          `${tm.utils.palette.error}, check if you specified the correct game.`, info.login)
        return
      }
      const base64String: string = file.content.toString('base64')
      const write: any[] | Error = await tm.client.call('WriteFile', [{ string: file.name }, { base64: base64String }])
      if (write instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}»${tm.utils.palette.error} Server failed to write file.`, info.login)
        return
      }
      const map: TMMap | Error = await tm.maps.add(file.name, info)
      if (map instanceof Error) {
        if (map.message.trim() === 'Challenge already added. Code: -1000') {
          const content: string = file.content.toString()
          let i: number = 0
          while (i < content.length) {
            if (content.substring(i, i + 12) === `<ident uid="`) {
              const id: string = content.substring(i + 12, i + 12 + 27)
              const map: TMMap | undefined = tm.maps.list.find(a => a.id === id)
              if (map === undefined) {
                tm.sendMessage(`${tm.utils.palette.server}»${tm.utils.palette.error} Server failed to queue the map.`, info.login)
                return
              }
              tm.jukebox.add(id, info)
              tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.admin} ` +
                `${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.admin} is already on the server, ` +
                `it will be ${tm.utils.palette.highlight}queued ${tm.utils.palette.admin}instead.`, info.login)
              return
            }
            i++
          }
        }
        tm.sendMessage(`${tm.utils.palette.server}»${tm.utils.palette.error} Server failed to queue the map.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
        `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued ` +
        `${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.admin} from TMX.`)
    },
    privilege: 1
  },
  {
    aliases: ['aadb', 'addallfromdb'],
    help: 'Adds all the maps present in database if they are on the server based on filename.',
    callback: async (info: TMMessageInfo): Promise<void> => {
      const res: any[] | Error = await tm.db.query('SELECT * FROM maps;')
      if (res instanceof Error) {
        tm.sendMessage(config.addallfromdb.error, config.addallfromdb.public === true ? info.login : undefined)
        return
      }
      for (const map of res) {
        if (tm.maps.list.some(a => a.id === map.id)) { continue }
        tm.maps.add(map.filename)
      }
    },
    privilege: config.addallfromdb.privilege
  }
]

tm.commands.add(...commands)