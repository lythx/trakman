
import config from '../config/MapCommands.config.js'
import fetch from 'node-fetch'

const commands: tm.Command[] = [
  {
    aliases: ['add'],
    help: 'Add a map from TMX.',
    params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
    callback: async (info: tm.MessageInfo, id: number, tmxSite?: string): Promise<void> => {
      const tmxSites: TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
      const site: TMXSite | undefined = tmxSites.find(a => a === tmxSite?.toUpperCase())
      let file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(id, site).catch((err: Error) => err)
      if (file instanceof Error) {
        const remainingSites = tmxSites.filter(a => a !== tmxSite)
        for (const e of remainingSites) {
          file = await tm.tmx.fetchMapFile(id, e).catch((err: Error) => err)
          if (!(file instanceof Error)) { break }
        }
      }
      if (file instanceof Error) {
        tm.sendMessage(config.add.fetchError, info.login)
        return
      }
      const base64String: string = file.content.toString('base64')
      const write: any[] | Error = await tm.client.call('WriteFile', [{ string: file.name }, { base64: base64String }])
      if (write instanceof Error) {
        tm.log.warn(`Server failed to write map file ${file.name}.`)
        tm.sendMessage(config.add.writeError, info.login)
        return
      }
      const map: tm.Map | Error = await tm.maps.add(file.name, info)
      if (map instanceof Error) {
        // Yes we actually need to do this in order to juke a map if it was on the server already
        if (map.message.trim() === 'Challenge already added. Code: -1000') {
          const content: string = file.content.toString()
          let i: number = 0
          while (i < content.length) {
            if (content.substring(i, i + 12) === `<ident uid="`) {
              const id: string = content.substring(i + 12, i + 12 + 27)
              const map: tm.Map | undefined = tm.maps.list.find(a => a.id === id)
              if (map === undefined) {
                tm.sendMessage(config.add.queueError, info.login)
                return
              }
              tm.sendMessage(tm.utils.strVar(config.add.alreadyAdded, {
                map: tm.utils.strip(map.name, false),
                nickname: tm.utils.strip(info.nickname, true)
              }), config.add.public ? undefined : info.login)
              tm.jukebox.add(id, info)
              return
            }
            i++
          }
        }
        tm.sendMessage(config.add.queueError, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.add.added, {
        title: info.title,
        map: tm.utils.strip(map.name, false),
        nickname: tm.utils.strip(info.nickname, true)
      }), config.add.public ? undefined : info.login)
    },
    privilege: config.add.privilege
  },
  {
    aliases: ['addlocal'],
    help: 'Add a map from local files.',
    params: [{ name: 'filename' }],
    callback: async (info: tm.MessageInfo, filename: string): Promise<void> => {
      const map: tm.Map | Error = await tm.maps.add(filename, info)
      if (map instanceof Error) {
        tm.sendMessage(config.addlocal.addError, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.addlocal.added, {
        title: info.title,
        map: tm.utils.strip(map.name, false),
        nickname: tm.utils.strip(info.nickname, true)
      }), config.add.public ? undefined : info.login)
    },
    privilege: config.addlocal.privilege
  },
  {
    aliases: ['afu', 'addfromurl'],
    help: 'Add a map from url.',
    params: [{ name: 'url' }, { name: 'filename', optional: true }],
    callback: async (info: tm.MessageInfo, url: string, filename?: string): Promise<void> => {
      const file = await fetch(url).catch((err: Error) => err)
      if (file instanceof Error) {
        tm.sendMessage(config.addfromurl.fetchError, info.login)
        return
      }
      const buffer = await file.arrayBuffer()
      const base64String: string = Buffer.from(buffer).toString('base64')
      const finalFilename = filename ?? url
      const write: any[] | Error = await tm.client.call('WriteFile',
        [{ string: `${finalFilename}.Challenge.Gbx` }, { base64: base64String }])
      if (write instanceof Error) {
        tm.log.warn(`Server failed to write map file ${finalFilename}.`)
        tm.sendMessage(config.addfromurl.writeError, info.login)
        return
      }
      const map: tm.Map | Error = await tm.maps.add(finalFilename, info)
      if (map instanceof Error) {
        // Yes we actually need to do this in order to juke a map if it was on the server already
        if (map.message.trim() === 'Challenge already added. Code: -1000') {
          const content: string = file.toString()
          let i: number = 0
          while (i < content.length) {
            if (content.substring(i, i + 12) === `<ident uid="`) {
              const id: string = content.substring(i + 12, i + 12 + 27)
              const map: tm.Map | undefined = tm.maps.list.find(a => a.id === id)
              if (map === undefined) {
                tm.sendMessage(config.addfromurl.queueError, info.login)
                return
              }
              tm.sendMessage(tm.utils.strVar(config.addfromurl.alreadyAdded, {
                map: tm.utils.strip(map.name, false),
                nickname: tm.utils.strip(info.nickname, true)
              }), config.addfromurl.public ? undefined : info.login)
              tm.jukebox.add(id, info)
              return
            }
            i++
          }
        }
        tm.sendMessage(config.addfromurl.queueError, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.addfromurl.added, {
        title: info.title,
        map: tm.utils.strip(map.name, false),
        nickname: tm.utils.strip(info.nickname, true)
      }), config.addfromurl.public ? undefined : info.login)
    },
    privilege: config.addfromurl.privilege
  },
  {
    aliases: ['aadb', 'addallfromdb'],
    help: 'Adds all the maps present in database if they are on the server based on filename.',
    callback: async (info: tm.MessageInfo): Promise<void> => {
      const res: any[] | Error = await tm.db.query('SELECT * FROM maps;')
      if (res instanceof Error) {
        tm.sendMessage(config.addallfromdb.error, info.login)
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