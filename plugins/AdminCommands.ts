import { TRAKMAN as TM } from '../src/Trakman.js'

const hfsList: string[] = []

const commands: TMCommand[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    params: [{ name: 'mode' }],
    callback: (info: MessageInfo, mode: string) => {
      let modeInt: number
      switch (mode.toLowerCase()) {
        case 'rounds': case 'round':
          modeInt = 0
          break
        case 'timeattack': case 'ta':
          modeInt = 1
          break
        case 'teams': case 'team':
          modeInt = 2
          break
        case 'laps': case 'lap':
          modeInt = 3
          break
        case 'stunts': case 'stunt':
          modeInt = 4
          break
        case 'cup':
          modeInt = 5
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
            + `the gamemode to ${TM.palette.highlight + mode.toUpperCase()}${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetGameMode',
          params: [{ int: modeInt }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['b', 'ban'],
    help: 'Ban a specific player.',
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, login: string, reason?: string, duration?: number) => {
      const targetInfo = TM.getPlayer(login)
      const expireDate = duration === undefined ? undefined : new Date(Date.now() + duration)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player ${login} is not on the server.`, info.login)
        return
      }
      TM.addToBanlist(targetInfo.ip, targetInfo.login, info.login, reason, expireDate)
      const reasonString = reason === undefined ? '' : ` Reason: ${TM.palette.highlight}${reason}.`
      const durationString = duration === undefined ? '' : ` for ${TM.palette.highlight}${TM.msToTime(duration)}`
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has banned `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}${durationString}.${TM.palette.admin}${reasonString}`
        }]
      },
        {
          method: 'Kick',
          params: [{ string: targetInfo.login }, { string: reason === undefined ? 'No reason specified' : `Reason: ${reason}` }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['ub', 'unban'],
    help: 'Unban a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo) => {
      const login = info.text
      if (TM.banlist.some(a => a.login === login) === false) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Specified player was not banned.`, info.login)
        return
      }
      let targetInfo = TM.getPlayer(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player.`, info.login)
          return
        }
      }
      TM.removeFromBanlist(targetInfo.login)
      TM.sendMessage('ChatSendServerMessage',
        `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has unbanned `
        + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['bl', 'blacklist'],
    help: 'Blacklist a specific player.',
    // TODO params
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      TM.addToBlacklist(info.text, info.login)
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
    },
    privilege: 2
  },
  {
    aliases: ['ubl', 'unblacklist'],
    help: 'Unblacklist a specific player.',
    // TODO params
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
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, password: string) => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (!regex.test(password) || password.length > 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the referee password to ${TM.palette.highlight + (password.length > 0 ? password : 'none (disabled)')}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetRefereePassword',
          params: [{ string: password }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['srm', 'setrefmode', 'setrefereemode'],
    help: 'Change the referee mode.',
    params: [{ name: 'mode', type: 'boolean' }],
    callback: (info: MessageInfo, mode: boolean) => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set the referee mode to `
            + `${TM.palette.highlight + (mode ? 'ALL' : 'TOP3')}${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetRefereeMode',
          params: [{
            int: mode ? 1 : 0
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['ag', 'addguest'],
    help: 'Add a player to the guestlist',
    // TODO params
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
    // TODO params
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
    // TODO params
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
    // TODO params
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
    // TODO params
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
