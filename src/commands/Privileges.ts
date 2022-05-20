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
        await TM.sendMessage(`No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`You cannot demote the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 3) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has promoted ${targetInfo.nickName}$z$s to Masteradmin.`)
        await PlayerService.setPrivilege(targetLogin, 3)
      } else if (targetInfo.privilege === 3) {
        await TM.sendMessage(`${targetInfo.nickName}$z$s is already Masteradmin.`, callerLogin)
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
        await TM.sendMessage(`No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`You cannot demote the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 2) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has promoted ${targetInfo.nickName}$z$s to Admin.`)
        await PlayerService.setPrivilege(targetLogin, 2)
      } else if (targetInfo.privilege === 2) {
        await TM.sendMessage(`${targetInfo.nickName}$z$s is already Admin.`, callerLogin)
      } else if (targetInfo.privilege > 2) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has demoted ${targetInfo.nickName}$z$s to Admin.`)
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
        await TM.sendMessage(`No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`You cannot demote the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege < 1) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has promoted ${targetInfo.nickName}$z$s to Operator.`)
        await PlayerService.setPrivilege(targetLogin, 1)
      } else if (targetInfo.privilege === 1) {
        await TM.sendMessage(`${targetInfo.nickName}$z$s is already Operator.`, callerLogin)
      } else if (targetInfo.privilege > 1) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has demoted ${targetInfo.nickName}$z$s to Operator.`)
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
        await TM.sendMessage(`No login specified.`, callerLogin)
        return
      }
      const targetInfo = await PlayerService.fetchPlayer(targetLogin)
      if (targetInfo == null) {
        await TM.sendMessage(`Cannot find the specified login in the database.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        await TM.sendMessage(`You cannot demote the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        await TM.sendMessage(`You cannot control your own privileges.`, callerLogin)
        return
      }
      if (targetInfo.privilege > 1) {
        await TM.sendMessage(`Player ${info.nickName}$z$s has removed ${targetInfo.nickName}$z$s's privileges.`)
        await PlayerService.setPrivilege(targetLogin, 0)
      } else if (targetInfo.privilege === 0) {
        await TM.sendMessage(`${targetInfo.nickName}$z$s has no privileges.`, callerLogin)
      }
    },
    privilege: 2
  }
]

for (const command of commands) { ChatService.addCommand(command) }
