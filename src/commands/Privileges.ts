'use strict'
import { PlayerService } from '../services/PlayerService.js'
import { Client } from '../Client.js'
import { ChatService } from '../services/ChatService.js'

const commands: Command[] = [
  {
    aliases: ['masteradmin'],
    help: 'Changes player privilege to masteradmin',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Please specify the new masteradmins\'s login' },
            { string: callerLogin }])
        return
      }
      const targetInfo = (await PlayerService.fetchPlayer(targetLogin))?.[0]
      if (!targetInfo) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Cannot find this login in database' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege === 4) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'You cannot demote the server owner' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege < 3) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} promoted ${targetInfo.nickname} to masteradmin` }])
        await PlayerService.setPrivilege(targetLogin, 3)
      } else if (targetInfo.privilege === 3) {
        await Client.call('ChatSendServerMessage',
          [{ string: `${targetInfo.nickname} is already masteradmin` },
            { string: callerLogin }])
      }
    },
    privilege: 4
  },
  {
    aliases: ['admin'],
    help: 'Changes player privilege to admin',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (!targetLogin) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Please specify the new admin\'s login' },
            { string: callerLogin }])
        return
      }
      const targetInfo = (await PlayerService.fetchPlayer(targetLogin))?.[0]
      if (!targetInfo) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Cannot find this login in database' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege === 4) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'You cannot demote the server owner' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege < 2) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} promoted ${targetInfo.nickname} to admin` }])
        await PlayerService.setPrivilege(targetLogin, 2)
      } else if (targetInfo.privilege === 2) {
        await Client.call('ChatSendServerMessage',
          [{ string: `${targetInfo.nickname} is already admin` },
            { string: callerLogin }])
      } else if (targetInfo.privilege > 2) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} demoted ${targetInfo.nickname} to admin` }])
        awaitPlayerService.setPrivilege(targetLogin, 2)
      }
    },
    privilege: 3
  },
  {
    aliases: ['operator'],
    help: 'Changes player privilege to operator',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (!targetLogin) {
        Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Please specify the new operator\'s login' },
            { string: callerLogin }])
        return
      }
      const targetInfo = (await PlayerService.fetchPlayer(targetLogin))?.[0]
      if (targetInfo == null) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Cannot find this login in database' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege === 4) {
        awit Client.call('ChatSendServerMessageToLogin',
          [{ string: 'You cannot demote the server owner' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege < 1) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} promoted ${targetInfo.nickname} to operator` }])
        await PlayerService.setPrivilege(targetLogin, 1)
      } else if (targetInfo.privilege === 1) {
        await Client.call('ChatSendServerMessage',
          [{ string: `${targetInfo.nickname} is already operator` },
            { string: callerLogin }])
      } else if (targetInfo.privilege > 1) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} demoted ${targetInfo.nickname} to operator` }])
        awaitPlayerService.setPrivilege(targetLogin, 1)
      }
    },
    privilege: 3
  },
  {
    aliases: ['user'],
    help: 'Changes player privilege to user',
    callback: async (info: MessageInfo) => {
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (!targetLogin) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Please specify the new users\'s login' },
            { string: callerLogin }])
        return
      }
      const targetInfo = (await PlayerService.fetchPlayer(targetLogin))?.[0]
      if (targetInfo == null) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'Cannot find this login in database' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege === 4) {
        await Client.call('ChatSendServerMessageToLogin',
          [{ string: 'You cannot demote the server owner' },
            { string: callerLogin }])
        return
      }
      if (targetInfo.privilege > 0) {
        await Client.call('ChatSendServerMessage', [{ string: `Player ${info.nickName} demoted ${targetInfo.nickname} to user` }])
        await PlayerService.setPrivilege(targetLogin, 0)
      } else if (targetInfo.privilege === 0) {
        await Client.call('ChatSendServerMessage',
          [{ string: `${targetInfo.nickname} is already user` },
            { string: callerLogin }])
      }
    },
    privilege: 3
  }
]

for (const command of commands) { ChatService.addCommand(command) }
