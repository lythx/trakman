import config from '../config/AdminCommands.config.js'
import {actions} from '../../actions/Actions.js'

const commands: tm.Command[] = [
  {
    aliases: config.kick.aliases,
    help: config.kick.help,
    params: [{name: 'login'}, {name: 'reason', type: 'multiword', optional: true}],
    callback: actions.kick,
    privilege: config.kick.privilege
  },
  {
    aliases: config.mute.aliases,
    help: config.mute.help,
    params: [{name: 'login'}, {name: 'duration', type: 'time', optional: true}, {
      name: 'reason',
      type: 'multiword',
      optional: true
    }],
    callback: actions.mute,
    privilege: config.mute.privilege
  },
  {
    aliases: config.unmute.aliases,
    help: config.unmute.help,
    params: [{name: 'login'}],
    callback: actions.unmute,
    privilege: config.unmute.privilege
  },
  {
    aliases: config.forcespec.aliases,
    help: config.forcespec.help,
    params: [{name: 'login'}],
    callback: actions.forceSpectator,
    privilege: config.forcespec.privilege
  },
  {
    aliases: config.forceplay.aliases,
    help: config.forceplay.help,
    params: [{name: 'login'}],
    callback: actions.forcePlay,
    privilege: config.forceplay.privilege
  },
  {
    aliases: config.kickghost.aliases,
    help: config.kickghost.help,
    params: [{name: 'login'}],
    callback: (info: tm.MessageInfo, login: string): void => {
      tm.sendMessage(tm.utils.strVar(config.kickghost.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname),
        name: login
      }), config.kickghost.public ? undefined : info.login)
      tm.client.callNoRes(`Kick`, [{string: login}])
    },
    privilege: config.kickghost.privilege
  },
  {
    aliases: config.ban.aliases,
    help: config.ban.help,
    params: [{name: 'login'}, {name: 'duration', type: 'time', optional: true}, {
      name: 'reason',
      type: 'multiword',
      optional: true
    }],
    callback: actions.ban,
    privilege: config.ban.privilege
  },
  {
    aliases: config.unban.aliases,
    help: config.unban.help,
    params: [{name: 'login'}],
    callback: actions.unban,
    privilege: config.unban.privilege
  },
  {
    aliases: config.blacklist.aliases,
    help: config.blacklist.help,
    params: [{name: 'login'}, {name: 'duration', type: 'time', optional: true}, {
      name: 'reason',
      type: 'multiword',
      optional: true
    }],
    callback: actions.blacklist,
    privilege: config.blacklist.privilege
  },
  {
    aliases: config.unblacklist.aliases,
    help: config.unblacklist.help,
    params: [{name: 'login'}],
    callback: actions.unblacklist,
    privilege: config.unblacklist.privilege
  },
  {
    aliases: config.addguest.aliases,
    help: config.addguest.help,
    params: [{name: 'login'}],
    callback: actions.addGuest,
    privilege: config.addguest.privilege
  },
  {
    aliases: config.rmguest.aliases,
    help: config.rmguest.help,
    params: [{name: 'login'}],
    callback: actions.removeGuest,
    privilege: config.rmguest.privilege
  },
  {
    aliases: config.loadmatchsettings.aliases,
    help: config.loadmatchsettings.help,
    params: [{name: 'fileName', type: 'multiword',}],
    callback: async (info: tm.MessageInfo, fileName: string) => {
      const res = await tm.client.call(`LoadMatchSettings`, [{string: fileName}])
      if (res instanceof Error) {
        tm.sendMessage(config.loadmatchsettings.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.loadmatchsettings.text,
        {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          file: tm.utils.strip(fileName)
        }
      ), config.loadmatchsettings.public ? undefined : info.login)
    },
    privilege: config.loadmatchsettings.privilege
  },
  {
    aliases: config.savematchsettings.aliases,
    help: config.savematchsettings.help,
    params: [{name: 'fileName', type: 'multiword', optional: true}],
    callback: async (info: tm.MessageInfo, fileName?: string) => {
      fileName = fileName || tm.config.controller.matchSettingsFile
      const res = await tm.client.call(`SaveMatchSettings`, [{string: fileName}])
      if (res instanceof Error) {
        tm.sendMessage(config.savematchsettings.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.savematchsettings.text,
        {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          file: tm.utils.strip(fileName)
        }
      ), config.savematchsettings.public ? undefined : info.login)
    },
    privilege: config.savematchsettings.privilege
  },
  {
    aliases: config.updatemaps.aliases,
    help: config.updatemaps.help,
    callback: async (info: tm.MessageInfo) => {
      await tm.maps.updateMaps()
      tm.sendMessage(tm.utils.strVar(config.updatemaps.text,
        {
          title: info.title,
          adminName: tm.utils.strip(info.nickname)
        }), config.updatemaps.public ? undefined : info.login)
    },
    privilege: config.updatemaps.privilege
  }
]

tm.commands.add(...commands)
