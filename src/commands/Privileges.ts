'use strict'
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
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 3) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has promoted 
        ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.folly}to Masteradmin.`)
        await PlayerService.setPrivilege(targetLogin, 3)
      } else if (targetInfo.privilege === 3) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.red}is already Masteradmin.`, callerLogin)
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
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 2) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has promoted 
        ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.folly}to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2)
      } else if (targetInfo.privilege === 2) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.red}is already Admin.`, callerLogin)
      } else if (targetInfo.privilege > 2) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has demoted 
        ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.folly}to Admin.`)
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
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 1) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has promoted 
        ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.folly}to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1)
      } else if (targetInfo.privilege === 1) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.red}is already Operator.`, callerLogin)
      } else if (targetInfo.privilege > 1) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has demoted 
        ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.folly}to Operator.`)
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
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege > 1) {
        await TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} 
        ${TM.colours.white + TM.stripModifiers(info.nickName, true)} ${TM.colours.folly}has removed 
        permissions of ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)}${TM.colours.folly}.`)
        await PlayerService.setPrivilege(targetLogin, 2)
      } else if (targetInfo.privilege === 0) {
        await TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.white + TM.stripModifiers(targetInfo.nickName, true)} ${TM.colours.red}has no priveleges.`, callerLogin)
      }
    },
    privilege: 2
  }
]

for (const command of commands) { ChatService.addCommand(command) }
