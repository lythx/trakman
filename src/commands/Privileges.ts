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
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
        return
      }
      const targetInfo: PlayersDBEntry  | undefined = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 3) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin} to Masteradmin.`)
        await PlayerService.setPrivilege(targetLogin, 3, info.login)
      } else if (targetInfo.privilege === 3) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.error} is already Masteradmin.`, callerLogin)
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
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
        return
      }
      const targetInfo: PlayersDBEntry | undefined = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 2) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin} to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2, info.login)
      } else if (targetInfo.privilege === 2) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.error} is already Admin.`, callerLogin)
      } else if (targetInfo.privilege > 2) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has demoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin} to Admin.`)
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
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
        return
      }
      const targetInfo: PlayersDBEntry | undefined = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has promoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin} to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1, info.login)
      } else if (targetInfo.privilege === 1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.error} is already Operator.`, callerLogin)
      } else if (targetInfo.privilege > 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has demoted ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin} to Operator.`)
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
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
        return
      }
      const targetInfo: PlayersDBEntry | undefined = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege >= 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has removed ` +
          `permissions of ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin}.`)
        await PlayerService.setPrivilege(targetLogin, 0, info.login)
      } else if (targetInfo.privilege === -1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has enabled ` +
          `${TM.palette.highlight + TM.strip(targetInfo.nickname, true)} ${TM.palette.admin}commands.`)
      } else if (targetInfo.privilege === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.error} has no priveleges.`, callerLogin)
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
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
        return
      }
      const targetInfo: PlayersDBEntry | undefined = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege === -1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.error} already can't use commands.`, callerLogin)
      }
      else if (targetInfo.privilege < 1) {
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
          `${TM.palette.highlight + TM.strip(info.nickname, true)}${TM.palette.admin} has disabled ` +
          `commands for ${TM.palette.highlight + TM.strip(targetInfo.nickname, true)}${TM.palette.admin}.`)
        await PlayerService.setPrivilege(targetLogin, -1, info.login)
      }
      else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot disable commands of a privileged person.`, callerLogin)
      }
    },
    privilege: 2
  },
]

for (const command of commands) { ChatService.addCommand(command) }
