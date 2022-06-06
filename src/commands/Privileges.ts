import { PlayerService } from '../services/PlayerService.js'
import { ChatService } from '../services/ChatService.js'
import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['mad', 'masteradmin'],
    help: 'Change player privilege to Masteradmin.',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 3) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has promoted ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly} to Masteradmin.`)
        await PlayerService.setPrivilege(targetLogin, 3)
      } else if (targetInfo.privilege === 3) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.red} is already Masteradmin.`, callerLogin)
      }
    },
    privilege: 4
  },
  {
    aliases: ['ad', 'admin'],
    help: 'Change player privilege to Admin.',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 2) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has promoted ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly} to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2)
      } else if (targetInfo.privilege === 2) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.red} is already Admin.`, callerLogin)
      } else if (targetInfo.privilege > 2) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has demoted ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly} to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2)
      }
    },
    privilege: 3
  },
  {
    aliases: ['op', 'operator'],
    help: 'Change player privilege to Operator.',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 1) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has promoted ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly} to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1)
      } else if (targetInfo.privilege === 1) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.red} is already Operator.`, callerLogin)
      } else if (targetInfo.privilege > 1) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has demoted ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly} to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1)
      }
    },
    privilege: 2
  },
  {
    aliases: ['rp', 'user'],
    help: 'Remove player priveleges.',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege > 1) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has removed ` +
          `permissions of ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly}.`)
        await PlayerService.setPrivilege(targetLogin, 0)
      } else if (targetInfo.privilege === -1) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has enabled ` +
          `${TM.colours.white + TM.strip(targetInfo.nickName, true)} ${TM.colours.folly}commands.`)
      } else if (targetInfo.privilege === 0) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.red} has no priveleges.`, callerLogin)
      }
    },
    privilege: 2
  },
  {
    aliases: ['dcmds', 'disablecommands'],
    help: 'Disable player commands.',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege === -1) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.red} already can't use commands.`, callerLogin)
      }
      else if (targetInfo.privilege < 1) {
        TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
          `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has disabled ` +
          `commands for ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly}.`)
        await PlayerService.setPrivilege(targetLogin, -1)
      }
      else {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot disable commands of a privileged person.`, callerLogin)
      }
    },
    privilege: 2
  },
]

for (const command of commands) { ChatService.addCommand(command) }
