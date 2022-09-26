import { trakman as tm } from '../../../src/Trakman.js'
import config from '../config/PrivilegesCommands.config.js'

const commands: TMCommand[] = [
  {
    aliases: ['mad', 'masteradmin'],
    help: 'Change player privilege to Masteradmin.',
    params: [{ name: 'login' }],
    callback: async (info: TMMessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        tm.sendMessage(config.noPrivilege, callerLogin)
        return
      }
      if (prevPrivilege < 3) {
        tm.sendMessage(tm.utils.strVar(config.masteradmin.promote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.masteradmin.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 3, info)
      } else if (prevPrivilege === 3) {
        tm.sendMessage(tm.utils.strVar(config.masteradmin.alreadyIs, {
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), callerLogin)
      }
    },
    privilege: config.masteradmin.privilege
  },
  {
    aliases: ['ad', 'admin'],
    help: 'Change player privilege to Admin.',
    params: [{ name: 'login' }],
    callback: async (info: TMMessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        tm.sendMessage(config.noPrivilege, callerLogin)
        return
      }
      if (prevPrivilege < 2) {
        tm.sendMessage(tm.utils.strVar(config.admin.promote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.admin.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 2, info)
      } else if (prevPrivilege === 2) {
        tm.sendMessage(tm.utils.strVar(config.admin.alreadyIs, {
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), callerLogin)
      } else {
        tm.sendMessage(tm.utils.strVar(config.admin.demote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.admin.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 2, info)
      }
    },
    privilege: 3
  },
  {
    aliases: ['op', 'operator'],
    help: 'Change player privilege to Operator.',
    params: [{ name: 'login' }],
    callback: async (info: TMMessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        tm.sendMessage(config.noPrivilege, callerLogin)
        return
      }
      if (prevPrivilege < 1) {
        tm.sendMessage(tm.utils.strVar(config.operator.promote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.operator.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 1, info)
      } else if (prevPrivilege === 1) {
        tm.sendMessage(tm.utils.strVar(config.operator.alreadyIs, {
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), callerLogin)
      } else {
        tm.sendMessage(tm.utils.strVar(config.operator.demote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.operator.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 1, info)
      }
    },
    privilege: 2
  },
  {
    aliases: ['rp', 'user'],
    help: 'Remove player priveleges.',
    params: [{ name: 'login' }],
    callback: async (info: TMMessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        tm.sendMessage(config.noPrivilege, callerLogin)
        return
      }
      if (prevPrivilege >= 1) {
        tm.sendMessage(tm.utils.strVar(config.user.demote, {
          title: info.title,
          adminNickname: tm.utils.strip(info.nickname, true),
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), config.user.public ? undefined : info.login)
        await tm.admin.setPrivilege(targetLogin, 0, info)
      } else if (prevPrivilege === 0) {
        tm.sendMessage(tm.utils.strVar(config.user.alreadyIs, {
          nickname: tm.utils.strip(targetInfo?.nickname ?? login, true)
        }), callerLogin)
      }
    },
    privilege: 2
  },
]

tm.commands.add(...commands)
