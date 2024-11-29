import config from '../config/MapCommands.config.js'
import fetch from 'node-fetch'
import { actions } from '../../actions/Actions.js'

const commands: tm.Command[] = [
  {
    aliases: config.add.aliases,
    help: config.add.help,
    params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
    callback: async (info: tm.MessageInfo, id: number, tmxSite?: string): Promise<void> => {
      await actions.addMap(info.login, info.nickname, info.title, id, tmxSite)
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
    aliases: config.addrandom.aliases,
    help: config.addrandom.help,
    params: [{ name: 'tmxSite', optional: true }],
    callback: async (info: tm.MessageInfo, tmxSite?: string): Promise<void> => {
      let obj: { map?: tm.Map; wasAlreadyAdded: boolean; } | Error
      let iteration = 0
      do {
        const tmxSites: tm.TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
        const site: tm.TMXSite | undefined = tmxSites.find(a => a === tmxSite?.toUpperCase())
        const file: { name: string, content: Buffer } | Error =
          await tm.tmx.fetchRandomMapFile(site).catch((err: Error) => err)
        if (file instanceof Error) {
          tm.sendMessage(config.addrandom.fetchError, info.login)
          return
        }
        obj = await tm.maps.writeFileAndAdd(file.name, file.content, info, { cancelIfAlreadyAdded: true })
        iteration++
      } while (!(obj instanceof Error) && obj.wasAlreadyAdded && iteration < 10)
      if (obj instanceof Error) {
        tm.log.warn(obj.message)
        tm.sendMessage(config.addrandom.addError, info.login)
        return
      } else if (obj.map === undefined) {
        tm.sendMessage(config.addrandom.addError, info.login)
        return
      } else {
        tm.sendMessage(tm.utils.strVar(config.addrandom.added, {
          title: info.title,
          map: tm.utils.strip(obj.map.name, true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.addrandom.public ? undefined : info.login)
      }
    },
    privilege: config.addrandom.privilege
  },
  {
    aliases: config.remove.aliases,
    help: config.remove.help,
    callback: async (info): Promise<void> => {
      await actions.removeMap(info.login, info.nickname, info.title)
    },
    privilege: config.remove.privilege
  },
  {
    aliases: config.addfromurl.aliases,
    help: config.addfromurl.help,
    params: [{ name: 'url' }, { name: 'filename', optional: true }],
    callback: async (info: tm.MessageInfo, url: string, filename?: string): Promise<void> => {
      const file = await fetch(url).catch((err: Error) => err)
      if (file instanceof Error || !file.ok) {
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
      } else if (obj.wasAlreadyAdded) {
        tm.sendMessage(tm.utils.strVar(config.addfromurl.alreadyAdded, {
          map: tm.utils.strip(tm.utils.decodeURI(obj.map.name), true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.addfromurl.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.addfromurl.added, {
          title: info.title,
          map: tm.utils.strip(tm.utils.decodeURI(obj.map.name), true),
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
  },
  {
    aliases: config.publicadd.aliases,
    help: config.publicadd.help,
    params: [{ name: 'id', type: 'int' }, { name: 'tmxSite', optional: true }],
    callback: async (info: tm.MessageInfo, id: number, tmxSite?: string): Promise<void> => {
      if (!tm.config.controller.allowPublicAdd) {
        tm.sendMessage(config.publicadd.notAvailable, info.login)
        return
      }
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
        tm.sendMessage(config.publicadd.fetchError, info.login)
        return
      }
      if (tm.config.controller.voteOnPublicAdd) {
        const voteResult: boolean = await actions.publicAdd(info.login, info.nickname, info.title, file.name.slice(0, -14))
        if (!voteResult) {
          return
        }
      }
      const obj = await tm.maps.writeFileAndAdd(file.name, file.content, info)
      if (obj instanceof Error) {
        tm.log.warn(obj.message)
        tm.sendMessage(config.publicadd.addError, info.login)
        return
      } else if (obj.wasAlreadyAdded) {
        tm.sendMessage(tm.utils.strVar(config.publicadd.alreadyAdded, {
          map: tm.utils.strip(tm.utils.decodeURI(obj.map.name), true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.publicadd.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.publicadd.added, {
          title: info.title,
          map: tm.utils.strip(tm.utils.decodeURI(obj.map.name), true),
          nickname: tm.utils.strip(info.nickname, true)
        }), config.publicadd.public ? undefined : info.login)
      }
    },
    privilege: config.publicadd.privilege
  }
]

tm.commands.add(...commands)