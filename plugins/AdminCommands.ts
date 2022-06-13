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
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid gamemode.`, info.login)
          return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the gamemode to ${TM.palette.highlight + info.text.toUpperCase()}${TM.palette.admin}.`
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
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has banned `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
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
    callback: async (info: MessageInfo) => {
      // TODO: implement an internal ban list or something
      // So that this returns if you attempt to unban somebody who's not banned
      let targetInfo = TM.getPlayer(info.login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(info.login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has unbanned `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'UnBan',
          params: [{ string: targetInfo.login }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['bl', 'blacklist'],
    help: 'Blacklist a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      await TM.multiCall({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has blacklisted `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
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
      let targetInfo = TM.getPlayer(info.login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(info.login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has unblacklisted `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'UnBlackList',
          params: [{ string: targetInfo.login }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['srp', 'setrefpwd', 'setrefereepassword'],
    help: 'Change the referee password.',
    callback: (info: MessageInfo) => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (!regex.test(info.text) || info.text.length < 1) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the referee password to ${TM.palette.highlight + (info.text.length > 0 ? info.text : 'none (disabled)')}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetRefereePassword',
          params: [{ string: info.text }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['srm', 'setrefmode', 'setrefereemode'],
    help: 'Change the referee mode.',
    callback: (info: MessageInfo) => {
      let status: number
      if (['all', '1'].includes(info.text.toLowerCase())) { status = 1 }
      else if (['top3', '0'].includes(info.text.toLowerCase())) { status = 0 }
      else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Not a valid parameter.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set the referee mode to `
            + `${TM.palette.highlight + (status === 1 ? 'ALL' : 'TOP3')}${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetRefereeMode',
          params: [{
            int: status
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['ag', 'addguest'],
    help: 'Add a player to the guestlist',
    callback: async (info: MessageInfo) => {
      let targetInfo = TM.getPlayer(info.login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(info.login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added `
            + `${TM.palette.highlight + targetInfo.nickName}${TM.palette.admin} to guestlist.`
        }]
      },
        {
          method: 'AddGuest',
          params: [{
            string: targetInfo.login
          }],
        })
      TM.callNoRes('SaveGuestList', [{ string: 'guestlist.txt' }]) // Save the list
    },
    privilege: 2
  },
  {
    aliases: ['rg', 'rmguest', 'removeguest'],
    help: 'Remove a player from the guestlist',
    callback: async (info: MessageInfo) => {
      // TODO: implement an internal guestlist or something
      // So that this returns if you attempt to remove somebody who's not in the list anyway
      let targetInfo = TM.getPlayer(info.login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(info.login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has removed `
            + `${TM.palette.highlight + targetInfo.nickName}${TM.palette.admin} from guestlist.`
        }]
      },
        {
          method: 'RemoveGuest',
          params: [{
            string: targetInfo.login
          }],
        })
      TM.callNoRes('SaveGuestList', [{ string: 'guestlist.txt' }]) // Save the list
    },
    privilege: 2
  },
  {
    aliases: ['hm', 'hardmute'],
    help: 'Mute a player and disable their commands.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, callerLogin)
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
      else if (targetInfo.privilege < 1) {
        TM.setPrivilege(targetLogin, -1)
      }
      else {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}You cannot disable commands of a privileged person.`, callerLogin)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} ` +
            `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has disabled ` +
            `commands and muted ${TM.palette.highlight + TM.strip(targetInfo.nickName, true)}${TM.palette.admin}.`
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
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, info.login)
        return
      }
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server.`, info.login)
        return
      }
      if (hfsList.some(a => a === targetInfo.login)) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is already hardforced into specmode.`, info.login)
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
            string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
              + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has hardforced `
              + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin} into specmode.`
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
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, info.login)
        return
      }
      if (!hfsList.some(a => a === info.login)) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not hardforced into specmode.`, info.login)
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
            string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
              + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has released `
              + `${TM.palette.highlight + TM.strip(targetInfo?.nickName || info.login)}${TM.palette.admin} out of specmode.`
          }]
        }
      )
    },
    privilege: 2
  }
]

for (const command of commands) { TM.addCommand(command) }
