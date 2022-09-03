import { trakman as tm } from '../../../src/Trakman.js'
import config from '../config/PrivilegesCommands.config.js'
// TODO config

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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 3) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has promoted ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin} to Masteradmin.`)
        await tm.admin.setPrivilege(targetLogin, 3, info)
      } else if (prevPrivilege === 3) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} is already Masteradmin.`, callerLogin)
      }
    },
    privilege: 4
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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 2) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has promoted ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin} to Admin.`)
        await tm.admin.setPrivilege(targetLogin, 2, info)
      } else if (prevPrivilege === 2) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} is already Admin.`, callerLogin)
      } else if (prevPrivilege > 2) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has demoted ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin} to Admin.`)
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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 1) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has promoted ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin} to Operator.`)
        await tm.admin.setPrivilege(targetLogin, 1, info)
      } else if (prevPrivilege === 1) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} is already Operator.`, callerLogin)
      } else if (prevPrivilege > 1) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has demoted ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin} to Operator.`)
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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege >= 1) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed ` +
          `permissions of ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin}.`)
        await tm.admin.setPrivilege(targetLogin, 0, info)
      } else if (prevPrivilege === -1) {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has enabled ` +
          `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)} ${tm.utils.palette.admin}commands.`)
        await tm.admin.setPrivilege(targetLogin, 0, info)
      } else if (prevPrivilege === 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} has no priveleges.`, callerLogin)
      }
    },
    privilege: 2
  },
  {
    aliases: ['dcmds', 'disablecommands'],
    help: 'Disable player commands.',
    params: [{ name: 'login' }],
    callback: async (info: TMMessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege === -1) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} already can't use commands.`, callerLogin)
      } else {
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
          `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has disabled ` +
          `commands for ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin}.`)
        await tm.admin.setPrivilege(targetLogin, -1, info)
      }
    },
    privilege: 2
  },
]

tm.commands.add(...commands)
