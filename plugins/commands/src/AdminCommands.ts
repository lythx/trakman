import config from '../config/AdminCommands.config.js'
import { adminActions } from '../../admin_actions/AdminActions.js'

const commands: tm.Command[] = [
  {
    aliases: config.kick.aliases,
    help: config.kick.help,
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: adminActions.kick,
    privilege: config.kick.privilege
  },
  {
    aliases: config.mute.aliases,
    help: config.mute.help,
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: adminActions.mute,
    privilege: config.mute.privilege
  },
  {
    aliases: config.unmute.aliases,
    help: config.unmute.help,
    params: [{ name: 'login' }],
    callback: adminActions.unmute,
    privilege: config.unmute.privilege
  },
  {
    aliases: config.forcespec.aliases,
    help: config.forcespec.help,
    params: [{ name: 'login' }],
    callback: adminActions.forceSpectator,
    privilege: config.forcespec.privilege
  },
  {
    aliases: config.forceplay.aliases,
    help: config.forceplay.help,
    params: [{ name: 'login' }],
    callback: adminActions.forcePlay,
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
    callback: adminActions.ban,
    privilege: config.ban.privilege
  },
  {
    aliases: config.unban.aliases,
    help: config.unban.help,
    params: [{ name: 'login' }],
    callback: adminActions.unban,
    privilege: config.unban.privilege
  },
  {
    aliases: config.blacklist.aliases,
    help: config.blacklist.help,
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: adminActions.blacklist,
    privilege: config.blacklist.privilege
  },
  {
    aliases: config.unblacklist.aliases,
    help: config.unblacklist.help,
    params: [{ name: 'login' }],
    callback: adminActions.unblacklist,
    privilege: config.unblacklist.privilege
  },
  {
    aliases: config.addguest.aliases,
    help: config.addguest.help,
    params: [{ name: 'login' }],
    callback: adminActions.addGuest,
    privilege: config.addguest.privilege
  },
  {
    aliases: config.rmguest.aliases,
    help: config.rmguest.help,
    params: [{ name: 'login' }],
    callback: adminActions.removeGuest,
    privilege: config.rmguest.privilege
  }
]

tm.commands.add(...commands)
