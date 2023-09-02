import config from '../config/PrivilegesCommands.config.js'
import { actions } from '../../actions/Actions.js'

const commands: tm.Command[] = [
  {
    aliases: config.masteradmin.aliases,
    help: config.masteradmin.help,
    params: [{ name: 'player', type: 'offlinePlayer' }],
    callback: async (info: tm.MessageInfo, player: tm.OfflinePlayer): Promise<void> => {
      await actions.setPlayerPrivilege(player.login, info, 3)
    },
    privilege: config.masteradmin.privilege
  },
  {
    aliases: config.admin.aliases,
    help: config.admin.help,
    params: [{ name: 'player', type: 'offlinePlayer' }],
    callback: async (info: tm.MessageInfo, player: tm.OfflinePlayer): Promise<void> => {
      await actions.setPlayerPrivilege(player.login, info, 2)
    },
    privilege: 3
  },
  {
    aliases: config.operator.aliases,
    help: config.operator.help,
    params: [{ name: 'player', type: 'offlinePlayer' }],
    callback: async (info: tm.MessageInfo, player: tm.OfflinePlayer): Promise<void> => {
      await actions.setPlayerPrivilege(player.login, info, 1)
    },
    privilege: 2
  },
  {
    aliases: config.user.aliases,
    help: config.user.help,
    params: [{ name: 'player', type: 'offlinePlayer' }],
    callback: async (info: tm.MessageInfo, player: tm.OfflinePlayer): Promise<void> => {
      await actions.setPlayerPrivilege(player.login, info, 0)
    },
    privilege: 2
  },
]

tm.commands.add(...commands)
