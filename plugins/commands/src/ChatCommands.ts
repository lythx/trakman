import config from '../config/ChatCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.hi.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.hi.public ? undefined : info.login, false)
    },
    privilege: config.hi.privilege
  },
  {
    aliases: ['bb', 'bye'],
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.bye.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.bye.public ? undefined : info.login, false)
    },
    privilege: config.bye.privilege
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'],
    help: 'Express your gratitude.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.thx.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.thx.public ? undefined : info.login, false)
    },
    privilege: config.thx.privilege
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.gg.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.gg.public ? undefined : info.login, false)
    },
    privilege: config.gg.privilege
  },
  {
    aliases: ['bg', 'badgame'],
    help: 'Allow others to find out about your disenjoyment of the round.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.bg.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.bg.public ? undefined : info.login, false)
    },
    privilege: config.bg.privilege
  },
  {
    aliases: ['n1', 'nice1', 'niceone'],
    help: 'Rain your blessings upon the few selected by thy divine ritual.',
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: tm.MessageInfo, name: string): void => {
      tm.sendMessage(tm.utils.strVar(config.n1.text, { nickname: info.nickname, name: name }), config.n1.public ? undefined : info.login, false)
    },
    privilege: config.n1.privilege
  },
  {
    aliases: ['gr', 'goodrace'],
    help: 'Mention that you\'ve had a great time racing just now.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, name?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.gr.text, { nickname: info.nickname, name: name ?? 'everyone' }), config.gr.public ? undefined : info.login, false)
    },
    privilege: config.gr.privilege
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bgm.text, { nickname: info.nickname }), config.bgm.public ? undefined : info.login, false)
    },
    privilege: config.bgm.privilege
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.brb.text, { nickname: info.nickname }), config.brb.public ? undefined : info.login, false)
    },
    privilege: config.brb.privilege
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: tm.MessageInfo): Promise<void> => {
      tm.sendMessage(tm.utils.strVar(config.afk.text, { nickname: info.nickname }), config.afk.public ? undefined : info.login, false)
      await tm.client.call('system.multicall',
        [{
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 0 }]
        }])
      tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.login }])
    },
    privilege: config.afk.privilege
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    params: [{ name: 'thoughts', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, thoughts?: string): void => {
      tm.sendMessage(tm.utils.strVar(config.me.text, { nickname: info.nickname, message: thoughts ?? '' }), config.me.public ? undefined : info.login, false)
    },
    privilege: config.me.privilege
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.lol.text, { nickname: info.nickname }), config.lol.public ? undefined : info.login, false)
    },
    privilege: config.lol.privilege
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.lool.text, { nickname: info.nickname }), config.lool.public ? undefined : info.login, false)
    },
    privilege: config.lool.privilege
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.loool.text, { nickname: info.nickname }), config.loool.public ? undefined : info.login, false)
    },
    privilege: config.loool.privilege
  },
  {
    aliases: ['time'],
    help: 'Find out about the current server time.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.time.text, { time: new Date().toString() }), info.login)
    },
    privilege: config.time.privilege
  },
  {
    aliases: ['bm', 'bootme', 'dienow'],
    help: 'Part your ways with life.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), config.bootme.public ? undefined : info.login)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.bootme.leaveText }])
    },
    privilege: config.bootme.privilege
  },
  {
    aliases: ['rq', 'ragequit'],
    help: 'Signal your dissatisfaction with whatever is happening right now.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.bootme.text, { nickname: tm.utils.strip(info.nickname, false) }), config.rq.public ? undefined : info.login)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: config.rq.leaveText }])
    },
    privilege: config.rq.privilege
  },
  {
    aliases: ['pm', 'dm'],
    params: [{ name: 'login' }, { name: 'text', type: 'multiword', optional: true }],
    help: 'Message a player.',
    callback: (info: tm.MessageInfo, login: string, text: string = ''): void => {
      const playerInfo: tm.Player | undefined = tm.players.get(login)
      if (playerInfo === undefined) {
        tm.sendMessage(config.pm.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.pm.text, { sender: tm.utils.strip(info.nickname, false), recipient: tm.utils.strip(playerInfo.nickname, false), message: text }), [info.login, playerInfo.login].join())
    },
    privilege: config.pm.privilege
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
    aliases: ['ccs', 'coppers', 'checkcoppers'],
    help: 'Check the amount of coppers the server account currently has.',
    callback: async (info: tm.MessageInfo): Promise<void> => {
      if (tm.config.server.isUnited === false) {
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