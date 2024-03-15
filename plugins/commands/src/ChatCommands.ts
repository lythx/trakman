import config from '../config/ChatCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: config.hi.aliases,
    help: config.hi.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.hi.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.hi.public ? undefined : info.login, false)
    },
    privilege: config.hi.privilege,
    disableForMuted: true
  },
  {
    aliases: config.bye.aliases,
    help: config.bye.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.bye.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.bye.public ? undefined : info.login, false)
    },
    privilege: config.bye.privilege,
    disableForMuted: true
  },
  {
    aliases: config.thx.aliases,
    help: config.thx.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.thx.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.thx.public ? undefined : info.login, false)
    },
    privilege: config.thx.privilege,
    disableForMuted: true
  },
  {
    aliases: config.gg.aliases,
    help: config.gg.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.gg.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.gg.public ? undefined : info.login, false)
    },
    privilege: config.gg.privilege,
    disableForMuted: true
  },
  {
    aliases: config.bg.aliases,
    help: config.bg.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.bg.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.bg.public ? undefined : info.login, false)
    },
    privilege: config.bg.privilege,
    disableForMuted: true
  },
  {
    aliases: config.n1.aliases,
    help: config.n1.help,
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: tm.MessageInfo, name: string): void => {
      tm.sendMessage(tm.utils.strVar(config.n1.text, { nickname: info.nickname, name: name }), config.n1.public ? undefined : info.login, false)
    },
    privilege: config.n1.privilege,
    disableForMuted: true
  },
  {
    aliases: config.gr.aliases,
    help: config.gr.help,
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.gr.text, { nickname: info.nickname, name: name ?? config.defaultValue }), config.gr.public ? undefined : info.login, false)
    },
    privilege: config.gr.privilege,
    disableForMuted: true
  },
  {
    aliases: config.bgm.aliases,
    help: config.bgm.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bgm.text, { nickname: info.nickname }), config.bgm.public ? undefined : info.login, false)
    },
    privilege: config.bgm.privilege,
    disableForMuted: true
  },
  {
    aliases: config.brb.aliases,
    help: config.brb.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.brb.text, { nickname: info.nickname }), config.brb.public ? undefined : info.login, false)
    },
    privilege: config.brb.privilege,
    disableForMuted: true
  },
  {
    aliases: config.afk.aliases,
    help: config.afk.help,
    callback: async (info: tm.MessageInfo): Promise<void> => {
      const res = await tm.client.call('system.multicall',
        [{
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 0 }]
        }])
      if (res instanceof Error || res[0] instanceof Error) {
        tm.sendMessage(config.afk.tooManySpecs, info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.afk.text, { nickname: info.nickname }), config.afk.public ? undefined : info.login, false)
        tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.login }])
      }
    },
    privilege: config.afk.privilege
  },
  {
    aliases: config.me.aliases,
    help: config.me.help,
    params: [{ name: 'thoughts', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, thoughts?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.me.text, { nickname: info.nickname, message: thoughts ?? '' }), config.me.public ? undefined : info.login, false)
    },
    privilege: config.me.privilege,
    disableForMuted: true
  },
  {
    aliases: config.lol.aliases,
    help: config.lol.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.lol.text, { nickname: info.nickname }), config.lol.public ? undefined : info.login, false)
    },
    privilege: config.lol.privilege,
    disableForMuted: true
  },
  {
    aliases: config.lool.aliases,
    help: config.lool.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.lool.text, { nickname: info.nickname }), config.lool.public ? undefined : info.login, false)
    },
    privilege: config.lool.privilege,
    disableForMuted: true
  },
  {
    aliases: config.loool.aliases,
    help: config.loool.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.loool.text, { nickname: info.nickname }), config.loool.public ? undefined : info.login, false)
    },
    privilege: config.loool.privilege,
    disableForMuted: true
  },
  {
    aliases: config.time.aliases,
    help: config.time.help,
    callback: (info: tm.MessageInfo): void => {
      const date = new Date()
      tm.sendMessage(tm.utils.strVar(config.time.text,
        {
          time: date.toLocaleString('EU')
        }), info.login)
    },
    privilege: config.time.privilege
  },
  {
    aliases: config.bootme.aliases,
    help: config.bootme.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), config.bootme.public ? undefined : info.login)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.bootme.leaveText }])
    },
    privilege: config.bootme.privilege
  },
  {
    aliases: config.rq.aliases,
    help: config.rq.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), config.rq.public ? undefined : info.login)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.rq.leaveText }])
    },
    privilege: config.rq.privilege
  },
  {
    aliases: config.pm.aliases,
    help: config.pm.help,
    params: [{ name: 'login' }, { name: 'text', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, login: string, text: string = ''): void => {
      const playerInfo: tm.Player | undefined = tm.players.get(login)
      if (playerInfo === undefined) {
        tm.sendMessage(config.pm.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.pm.text,
        {
          sender: tm.utils.strip(info.nickname, false),
          recipient: tm.utils.strip(playerInfo.nickname, false),
          message: text
        }), [info.login, playerInfo.login].join())
    },
    privilege: config.pm.privilege
  },
  {
    aliases: config.playtime.aliases,
    help: config.playtime.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.playtime.text,
        { time: tm.utils.getVerboseTime(Date.now() - tm.timer.mapStartTimestamp) }),
        info.login)
    },
    privilege: config.playtime.privilege
  },
  {
    aliases: config.laston.aliases,
    help: config.laston.help,
    params: [{ name: 'login' }],
    callback: async (info: tm.MessageInfo, login: string): Promise<void> => {
      login = login.toLowerCase()
      const player = await tm.players.fetch(login)
      if (player?.lastOnline === undefined) {
        tm.sendMessage(tm.utils.strVar(config.laston.error, { name: login }), info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.laston.text, {
        name: tm.utils.strip(player.nickname),
        time: new Date(player.lastOnline).toLocaleString('EU')
      }), info.login)
    },
    privilege: config.laston.privilege
  },
  {
    aliases: config.sessiontime.aliases,
    help: config.sessiontime.help,
    params: [{ name: 'login', optional: true }],
    callback: async (info: tm.MessageInfo, login?: string): Promise<void> => {
      if (login === undefined || login === info.login) {
        tm.sendMessage(tm.utils.strVar(config.sessiontime.selfText, {
          time: tm.utils.getVerboseTime(Date.now() - info.joinTimestamp)
        }), info.login)
        return
      }
      const player = tm.players.get(login)
      if (player === undefined) {
        tm.sendMessage(tm.utils.strVar(config.sessiontime.error, {
          name: login
        }), info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.sessiontime.text, {
        name: tm.utils.strip(player.nickname),
        time: tm.utils.getVerboseTime(Date.now() - player.joinTimestamp)
      }), info.login)
    },
    privilege: config.sessiontime.privilege
  },
  {
    aliases: config.man.aliases,
    help: config.man.help,
    params: [{ name: 'commandName' }],
    callback: (info: tm.MessageInfo, commandName: string): void => {
      const command = tm.commands.list.filter(a => a.aliases.some(a => a === commandName))
      let str = ''
      for (const e of command) {
        if (e.help === undefined || e.privilege > info.privilege) { continue }
        str += '\n'
        const par = tm.utils.stringifyCommandParams(e.params)
        str += tm.utils.strVar(config.man.text, {
          name: commandName,
          params: par.length === 0 ? '' : `(${par}) `,
          help: e.help
        })
      }
      str = str.slice(1)
      if (str.length === 0) {
        tm.sendMessage(tm.utils.strVar(config.man.error, {
          name: commandName
        }), info.login)
        return
      }
      tm.sendMessage(str, info.login)
    },
    privilege: config.man.privilege
  },
  {
    aliases: ['admin', 'a'],
    callback: (info: tm.MessageInfo): void => {
      if (info.privilege > 0) {
        tm.sendMessage(config.admin.text, info.login)
      }
    },
    privilege: config.admin.privilege
  },
  {
    aliases: config.coppers.aliases,
    help: config.coppers.help,
    callback: async (info: tm.MessageInfo): Promise<void> => {
      if (!tm.config.server.isUnited) {
        tm.sendMessage(config.coppers.notUnited, info.login)
        return
      }
      const coppers: any | Error = await tm.client.call('GetServerCoppers')
      if (coppers instanceof Error) {
        tm.log.error(`Couldn't retrieve the coppers amount.`, coppers.message)
        tm.sendMessage(config.coppers.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.coppers.text, { value: coppers }), config.coppers.public ? undefined : info.login)
    },
    privilege: config.coppers.privilege
  }
]

tm.commands.add(...commands)