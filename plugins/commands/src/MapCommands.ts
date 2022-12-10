import config from '../config/MapCommands.config.js'
import fetch from 'node-fetch'

let mapToErase: string | undefined
tm.addListener('BeginMap', (info): void => {
  if (info.isRestart === true) { return }
  if (mapToErase !== undefined) {
    void tm.maps.remove(mapToErase)
    mapToErase = undefined
  }
})

const commands: tm.Command[] = [
  {
    aliases: config.add.aliases,
    help: config.add.help,
    params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
    callback: async (info: tm.MessageInfo, id: number, tmxSite?: string): Promise<void> => {
      const tmxSites: tm.TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
      const site: tm.TMXSite | undefined = tmxSites.find(a => a === tmxSite?.toUpperCase())
      let file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(id, site).catch((err: Error) => err)
      if (file instanceof Error) {
        const remainingSites: tm.TMXSite[] = tmxSites.filter(a => a !== tmxSite)
        for (const e of remainingSites) {
          file = await tm.tmx.fetchMapFile(id, e).catch((err: Error) => err)
          if (!(file instanceof Error)) { break }
        }
      }
      if (file instanceof Error) {
        tm.sendMessage(config.add.fetchError, info.login)
        return
      }
      const obj = await tm.maps.writeFileAndAdd(file.name, file.content, info)
      if (obj instanceof Error) {
        tm.log.warn(obj.message)
        tm.sendMessage(config.add.addError, info.login)
        return
      } else if (obj.wasAlreadyAdded === true) {
        tm.sendMessage(tm.utils.strVar(config.add.alreadyAdded, {
          map: tm.utils.strip(obj.map.name, true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.add.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.add.added, {
          title: info.title,
          map: tm.utils.strip(obj.map.name, true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.add.public ? undefined : info.login)
      }
    },
    privilege: config.add.privilege
  },
  {
    aliases: config.addlocal.aliases,
    help: config.addlocal.help,
    params: [{ name: 'filename' }],
    callback: async (info: tm.MessageInfo, filename: string): Promise<void> => {
      const map: tm.Map | Error = await tm.maps.add(filename, info)
      if (map instanceof Error) {
        tm.sendMessage(config.addlocal.addError, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.addlocal.added, {
        title: info.title,
        map: tm.utils.strip(map.name, true),
        nickname: tm.utils.strip(info.nickname, true)
      }), config.addlocal.public ? undefined : info.login)
    },
    privilege: config.addlocal.privilege
  },
  {
    aliases: config.remove.aliases,
    help: config.remove.help,
    callback: (info): void => {
      if (mapToErase !== undefined) {
        tm.sendMessage(config.remove.error, info.login)
        return
      }
      mapToErase = tm.maps.current.id
      tm.sendMessage(tm.utils.strVar(config.remove.text, {
        title: info.title,
        nickname: tm.utils.strip(info.nickname, true)
      }), config.remove.public ? undefined : info.login)
    },
    privilege: config.remove.privilege
  },
  {
    aliases: config.addfromurl.aliases,
    help: config.addfromurl.help,
    params: [{ name: 'url' }, { name: 'filename', optional: true }],
    callback: async (info: tm.MessageInfo, url: string, filename?: string): Promise<void> => {
      const file = await fetch(url).catch((err: Error) => err)
      if (file instanceof Error) {
        tm.sendMessage(config.addfromurl.fetchError, info.login)
        return
      }
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const obj = await tm.maps.writeFileAndAdd(filename ?? url, buffer, info)
      if (obj instanceof Error) {
        tm.log.warn(obj.message)
        tm.sendMessage(config.addfromurl.addError, info.login)
        return
      } else if (obj.wasAlreadyAdded === true) {
        tm.sendMessage(tm.utils.strVar(config.addfromurl.alreadyAdded, {
          map: tm.utils.strip(obj.map.name, true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.addfromurl.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.addfromurl.added, {
          title: info.title,
          map: tm.utils.strip(obj.map.name, true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.addfromurl.public ? undefined : info.login)
      }
    },
    privilege: config.addfromurl.privilege
  },
  {
    aliases: config.addallfromdb.aliases,
    help: config.addallfromdb.help,
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