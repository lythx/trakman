import { PlayerService } from '../services/PlayerService.js'
import { ChatService } from '../services/ChatService.js'
import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['mad', 'masteradmin'],
    help: 'Change player privilege to Masteradmin.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 3) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin} to Masteradmin.`)
        await PlayerService.setPrivilege(targetLogin, 3, info.login)
      } else if (prevPrivilege === 3) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.error} is already Masteradmin.`, callerLogin)
      }
    },
    privilege: 4
  },
  {
    aliases: ['ad', 'admin'],
    help: 'Change player privilege to Admin.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 2) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin} to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2, info.login)
      } else if (prevPrivilege === 2) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.error} is already Admin.`, callerLogin)
      } else if (prevPrivilege > 2) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has demoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin} to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2, info.login)
      }
    },
    privilege: 3
  },
  {
    aliases: ['op', 'operator'],
    help: 'Change player privilege to Operator.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege < 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin} to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1, info.login)
      } else if (prevPrivilege === 1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.error} is already Operator.`, callerLogin)
      } else if (prevPrivilege > 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has demoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin} to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1, info.login)
      }
    },
    privilege: 2
  },
  {
    aliases: ['rp', 'user'],
    help: 'Remove player priveleges.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege >= 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has removed ` +
          `permissions of ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin}.`)
        await PlayerService.setPrivilege(targetLogin, 0, info.login)
      } else if (prevPrivilege === -1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has enabled ` +
          `${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)} ${TM.palette.admin}commands.`)
        await PlayerService.setPrivilege(targetLogin, 0, info.login)
      } else if (prevPrivilege === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.error} has no priveleges.`, callerLogin)
      }
    },
    privilege: 2
  },
  {
    aliases: ['dcmds', 'disablecommands'],
    help: 'Disable player commands.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      const targetLogin: string = login
      const callerLogin: string = info.login
      const targetInfo: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(targetLogin)
      const prevPrivilege: number = targetInfo?.privilege ?? 0
      if (prevPrivilege >= info.privilege) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
        return
      }
      if (prevPrivilege === -1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.error} already can't use commands.`, callerLogin)
      } else {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info.login)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has disabled ` +
          `commands for ${TM.palette.highlight + TM.strip(targetInfo?.nickname ?? login, true)}${TM.palette.admin}.`)
        await PlayerService.setPrivilege(targetLogin, -1, info.login)
      }
    },
    privilege: 2
  },
]

for (const command of commands) { ChatService.addCommand(command) }
