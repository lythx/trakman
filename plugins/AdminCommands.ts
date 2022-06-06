import { TRAKMAN as TM } from '../src/Trakman.js'

const hfsList: string[] = []

const commands: TMCommand[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    callback: (info: MessageInfo) => {
      let mode: number
      switch (info.text.toLowerCase()) {
        case 'rounds':
        case 'round':
          mode = 0
          break
        case 'timeattack':
        case 'ta':
          mode = 1
          break
        case 'teams':
        case 'team':
          mode = 2
          break
        case 'laps':
        case 'lap':
          mode = 3
          break
        case 'stunts':
        case 'stunt':
          mode = 4
          break
        case 'cup':
          mode = 5
          break
        default:
          TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Invalid gamemode.`, info.login)
          return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
            + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has set `
            + `the gamemode to ${TM.colours.white + info.text.toUpperCase()}${TM.colours.folly}.`
        }]
      },
        {
          method: 'SetGameMode',
          params: [{ int: mode }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['b', 'ban'],
    help: 'Ban a specific player.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
            + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has banned `
            + `${TM.colours.white + TM.strip(targetInfo.nickName)}${TM.colours.folly}.`
        }]
      },
        {
          method: 'Ban',
          params: [{ string: targetInfo.login }, { string: 'asdsasdasd' }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['ub', 'unban'],
    help: 'Unban a specific player.',
    callback: (info: MessageInfo) => {
      // TODO: implement an internal ban list or something
      // So that this returns if you attempt to unban somebody who's not banned
      TM.fetchPlayer(info.text).then(async (i) => {
        const targetInfo = i
        if (targetInfo == null) { return }
        TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has unbanned `
              + `${TM.colours.white + TM.strip(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
          {
            method: 'UnBan',
            params: [{ string: targetInfo.login }]
          })
      })
    },
    privilege: 2
  },
  {
    aliases: ['bl', 'blacklist'],
    help: 'Blacklist a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
            + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has blacklisted `
            + `${TM.colours.white + TM.strip(targetInfo.nickName)}${TM.colours.folly}.`
        }]
      },
        {
          method: 'Kick', // Kick the player first, so that we don't have to execute BanAndBlackList method
          params: [{ string: targetInfo.login }, { string: 'asdsasdasd' }]
        })
      await new Promise((r) => setTimeout(r, 5)) // Timeout to ensure BlackList gets called after Kick
      TM.callNoRes('BlackList', [{ string: targetInfo.login }])
    },
    privilege: 2
  },
  {
    aliases: ['ubl', 'unblacklist'],
    help: 'Unblacklist a specific player.',
    callback: async (info: MessageInfo) => {
      // TODO: implement an internal blacklisted people list or something
      // So that this returns if you attempt to unblacklist somebody who's not blacklisted
      TM.fetchPlayer(info.text).then(async (i) => {
        const targetInfo = i
        if (targetInfo == null) { return }
        TM.multiCallNoRes({
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has unblacklisted `
              + `${TM.colours.white + TM.strip(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
          {
            method: 'UnBlackList',
            params: [{ string: targetInfo.login }]
          })
      })
    },
    privilege: 2
  },
  {
    aliases: ['hm', 'hardmute'],
    help: 'Mute a player and disable his commands.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}No login specified.`, callerLogin)
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
      else if (targetInfo.privilege < 1) {
        TM.setPrivilege(targetLogin, -1)
      }
      else {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}You cannot disable commands of a privileged person.`, callerLogin)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} ` +
            `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has disabled ` +
            `commands and muted ${TM.colours.white + TM.strip(targetInfo.nickName, true)}${TM.colours.folly}.`
        }]
      },
        {
          method: 'Ignore',
          params: [{ string: targetInfo.login }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['hfs', 'hardforcespec'],
    help: 'Force player into specmode without ability to disable it.',
    callback: async (info: MessageInfo) => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Login not specified.`, info.login)
        return
      }
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Player is not on the server.`, info.login)
        return
      }
      if (hfsList.some(a => a === targetInfo.login)) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Player is already hardforced into specmode.`, info.login)
        return
      }
      hfsList.push(targetInfo.login)
      await TM.multiCall(
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 1 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has hardforced `
              + `${TM.colours.white + TM.strip(targetInfo.nickName)}${TM.colours.folly} into specmode.`
          }]
        }
      )
      TM.addListener('Controller.PlayerJoin', (i: JoinInfo) => {
        if (hfsList.some(a => a === i.login)) {
          TM.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      TM.addListener('Controller.PlayerInfoChanged', async (i: InfoChangedInfo) => {
        if (hfsList.some(a => a === i.login)) {
          await new Promise((r) => setTimeout(r, (Math.random() * 6800) + 200))
          TM.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      await new Promise((r) => setTimeout(r, 5))
      TM.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.text }])
    },
    privilege: 2
  },
  {
    aliases: ['uhfs', 'undohardforcespec'],
    help: 'Undo hardforcespec.',
    callback: async (info: MessageInfo) => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Login not specified.`, info.login)
        return
      }
      if (!hfsList.some(a => a === info.login)) {
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Player is not hardforced into specmode.`, info.login)
        return
      }
      hfsList.splice(hfsList.indexOf(info.login), 1)
      const targetInfo = TM.getPlayer(info.text)
      TM.multiCallNoRes(
        {
          method: 'ForceSpectator',
          params: [{ string: info.text }, { int: 0 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.strip(info.nickName, true)}${TM.colours.folly} has released `
              + `${TM.colours.white + TM.strip(targetInfo?.nickName || info.login)}${TM.colours.folly} out of specmode.`
          }]
        }
      )
    },
    privilege: 2
  }
]

for (const command of commands) { TM.addCommand(command) }
