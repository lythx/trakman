import config from '../config/AdminCommands.config.js'
import { actions } from '../../actions/Actions.js'

const commands: tm.Command[] = [
  {
    aliases: config.kick.aliases,
    help: config.kick.help,
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: actions.kick,
    privilege: config.kick.privilege
  },
  {
    aliases: config.mute.aliases,
    help: config.mute.help,
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: actions.mute,
    privilege: config.mute.privilege
  },
  {
    aliases: config.unmute.aliases,
    help: config.unmute.help,
    params: [{ name: 'login' }],
    callback: actions.unmute,
    privilege: config.unmute.privilege
  },
  {
    aliases: config.forcespec.aliases,
    help: config.forcespec.help,
    params: [{ name: 'login' }],
    callback: actions.forceSpectator,
    privilege: config.forcespec.privilege
  },
  {
    aliases: config.forceplay.aliases,
    help: config.forceplay.help,
    params: [{ name: 'login' }],
    callback: actions.forcePlay,
    privilege: config.forceplay.privilege
  },
  {
    aliases: config.kickghost.aliases,
    help: config.kickghost.help,
    params: [{ name: 'login' }],
    callback: (info: tm.MessageInfo, login: string): void => {
      tm.sendMessage(tm.utils.strVar(config.kickghost.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: login }), config.kickghost.public ? undefined : info.login)
      tm.client.callNoRes(`Kick`, [{ string: login }])
    },
    privilege: config.kickghost.privilege
  },
  {
    aliases: config.ban.aliases,
    help: config.ban.help,
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: actions.ban,
    privilege: config.ban.privilege
  },
  {
    aliases: config.unban.aliases,
    help: config.unban.help,
    params: [{ name: 'login' }],
    callback: actions.unban,
    privilege: config.unban.privilege
  },
  {
    aliases: config.blacklist.aliases,
    help: config.blacklist.help,
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: actions.blacklist,
    privilege: config.blacklist.privilege
  },
  {
    aliases: config.unblacklist.aliases,
    help: config.unblacklist.help,
    params: [{ name: 'login' }],
    callback: actions.unblacklist,
    privilege: config.unblacklist.privilege
  },
  {
    aliases: config.addguest.aliases,
    help: config.addguest.help,
    params: [{ name: 'login' }],
    callback: actions.addGuest,
    privilege: config.addguest.privilege
  },
  {
    aliases: config.rmguest.aliases,
    help: config.rmguest.help,
    params: [{ name: 'login' }],
    callback: actions.removeGuest,
    privilege: config.rmguest.privilege
  },
  {
    aliases: config.loadmatchsettings.aliases,
    help: config.loadmatchsettings.help,
    params: [{ name: 'file' }],
    callback: async (info: tm.MessageInfo, file: string) => {
      const res = await tm.client.call(`LoadMatchSettings`, [{ string: file }])
      if (res instanceof Error) {
        tm.sendMessage(config.loadmatchsettings.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.loadmatchsettings.text,
        {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          file: tm.utils.strip(file)
        }
      ), config.loadmatchsettings.public ? undefined : info.login)
    },
    privilege: config.loadmatchsettings.privilege
  }
]

tm.commands.add(...commands)
