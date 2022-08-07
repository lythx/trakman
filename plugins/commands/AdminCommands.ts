import { TRAKMAN as TM } from '../../src/Trakman.js'

const hfsList: string[] = []

const commands: TMCommand[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    params: [{ name: 'mode' }],
    callback: (info: MessageInfo, mode: string): void => {
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
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Invalid gamemode.`, info.login)
          return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has set `
            + `the gamemode to ${TM.utils.palette.highlight + mode.toUpperCase()}${TM.utils.palette.admin}.`
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
    callback: (info: MessageInfo, login: string, duration?: number, reason?: string): void => {
      const targetInfo: TMPlayer | undefined = TM.players.get(login)
      const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player ${login} is not on the server.`, info.login)
        return
      }
      TM.addToBanlist(targetInfo.ip, targetInfo.login, info.login, reason, expireDate)
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.utils.palette.highlight}: ${reason}${TM.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${TM.utils.palette.highlight}${TM.utils.msToTime(duration)}`
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has banned `
            + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}${durationString}.${TM.utils.palette.admin}${reasonString}`
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
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      if (TM.banlist.some(a => a.login === login) === false) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Specified player was not banned.`, info.login)
        return
      }
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      TM.removeFromBanlist(targetInfo.login, info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has unbanned `
        + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['bl', 'blacklist'],
    help: 'Blacklist a specific player.',
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
      const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      TM.addToBlacklist(targetInfo.login, info.login, reason, expireDate)
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.utils.palette.highlight}: ${reason}${TM.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${TM.utils.palette.highlight}${TM.utils.msToTime(duration)}`
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has blacklisted `
            + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}${durationString}.${TM.utils.palette.admin}${reasonString}`
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
    aliases: ['ubl', 'unblacklist'],
    help: 'Unblacklist a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      if (TM.blacklist.some(a => a.login === login) === false) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Specified player was not blacklisted.`, info.login)
        return
      }
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      TM.removeFromBlacklist(targetInfo.login, info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has unblacklisted `
        + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['srp', 'setrefpwd', 'setrefereepassword'],
    help: 'Change the referee password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has set `
            + `the referee password to ${TM.utils.palette.highlight + (password !== undefined ? password : 'none (disabled)')}$z$s${TM.utils.palette.admin}.`
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
    callback: (info: MessageInfo, mode: boolean): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has set the referee mode to `
            + `${TM.utils.palette.highlight + (mode ? 'ALL' : 'TOP3')}${TM.utils.palette.admin}.`
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
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      const res: boolean | Error = await TM.addToGuestlist(login, info.login)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server failed to add to guest list.`, info.login)
        return
      }
      if (res === false) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Specified player is already in the guestlist.`, info.login)
        return
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added `
        + `${TM.utils.palette.highlight + targetInfo.nickname}${TM.utils.palette.admin} to guestlist.`)
    },
    privilege: 2
  },
  {
    aliases: ['rg', 'rmguest', 'removeguest'],
    help: 'Remove a player from the guestlist',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      const res: boolean | Error = await TM.removeFromGuestlist(login, info.login)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server failed to remove from guest list.`, info.login)
        return
      }
      if (res === false) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Specified player is not in the guestlist.`, info.login)
        return
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
        + `${TM.utils.palette.highlight + targetInfo.nickname}${TM.utils.palette.admin} from guestlist.`)
    },
    privilege: 2
  },
  {
    aliases: ['hm', 'hardmute'],
    help: 'Mute a player and disable their commands.',
    // TODO params
    callback: async (info: MessageInfo): Promise<void> => {
      const targetInfo: TMPlayer | undefined = TM.players.get(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}No login specified.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      else if (targetInfo.privilege < 1) {
        TM.setPrivilege(targetLogin, -1, info.login)
      }
      else {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}You cannot disable commands of a privileged person.`, callerLogin)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} ` +
            `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has disabled ` +
            `commands and muted ${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname, true)}${TM.utils.palette.admin}.`
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
    callback: async (info: MessageInfo): Promise<void> => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}No login specified.`, info.login)
        return
      }
      const targetInfo: TMPlayer | undefined = TM.players.get(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not on the server.`, info.login)
        return
      }
      if (hfsList.some(a => a === targetInfo.login)) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is already hardforced into specmode.`, info.login)
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
            string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
              + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has hardforced `
              + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin} into specmode.`
          }]
        }
      )
      TM.addListener('Controller.PlayerJoin', (i: JoinInfo): void => {
        if (hfsList.some(a => a === i.login)) {
          TM.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      TM.addListener('Controller.PlayerInfoChanged', async (i: InfoChangedInfo): Promise<void> => {
        if (hfsList.some(a => a === i.login)) {
          await new Promise((r) => setTimeout(r, (Math.random() * 6800) + 200))
          TM.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      await new Promise((r) => setTimeout(r, 5))
      TM.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.text }])
    },
    privilege: 2
  },
  {
    aliases: ['uhfs', 'undohardforcespec'],
    help: 'Undo hardforcespec.',
    // TODO params
    callback: async (info: MessageInfo): Promise<void> => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}No login specified.`, info.login)
        return
      }
      if (!hfsList.some(a => a === info.login)) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not hardforced into specmode.`, info.login)
        return
      }
      hfsList.splice(hfsList.indexOf(info.login), 1)
      const targetInfo: TMPlayer | undefined = TM.players.get(info.text)
      TM.multiCallNoRes(
        {
          method: 'ForceSpectator',
          params: [{ string: info.text }, { int: 0 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
              + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has released `
              + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo?.nickname || info.login)}${TM.utils.palette.admin} out of specmode.`
          }]
        }
      )
    },
    privilege: 2
  },
  {
    aliases: ['tmpl', 'teammaxpoints'],
    help: 'Set the maximum amount of points for team mode.',
    params: [{ name: 'limit', type: 'int' }],
    callback: async (info: MessageInfo, limit: number): Promise<void> => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} ` +
            `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has set the points limit ` +
            `to ${TM.utils.palette.highlight + limit}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetTeamPointsLimit',
          params: [{ int: limit }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['fpt', 'forceteam', 'forceplayerteam'],
    help: 'Force a player into a team.',
    params: [{ name: 'player' }, { name: 'team' }],
    callback: async (info: MessageInfo, player: string, team: string): Promise<void> => {
      if (TM.state.gameConfig.gameMode === 1 || TM.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      let teamInt: number
      let teamColour: string
      const playerinfo: TMPlayer | undefined = TM.players.get(player)
      if (playerinfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not on the server.`, info.login)
        return
      }
      switch (team.toLowerCase()) {
        case 'blue':
          teamInt = 0
          teamColour = `${TM.utils.colours.blue}`
          break
        case 'red':
          teamInt = 1
          teamColour = `${TM.utils.colours.red}`
          break
        default:
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Invalid team type.`, info.login)
          return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has put `
            + `player ${TM.utils.palette.highlight + TM.utils.strip(playerinfo.nickname)} ${TM.utils.palette.admin}to the ${teamColour + team.toUpperCase()}${TM.utils.palette.admin} team.`
        }]
      },
        {
          method: 'ForcePlayerTeam',
          params: [{ string: player }, { int: teamInt }]
        })
    },
    privilege: 2
  },
  {
    aliases: ['swu', 'setwarmup'],
    help: 'Set whether the server is in warmup mode.',
    params: [{ name: 'enabled', type: 'boolean' }],
    callback: (info: MessageInfo, enabled: boolean): void => {
      if (TM.state.gameConfig.gameMode === 1 || TM.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `${TM.utils.palette.highlight + (enabled ? 'enabled' : 'disabled')}${TM.utils.palette.admin} warm-up mode.`
        }]
      },
        {
          method: 'SetWarmUp',
          params: [{
            boolean: enabled
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['sla', 'setlapsamount'],
    help: 'Set the laps amount in laps mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 3) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in LAPS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 laps.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the laps amount to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetNbLaps',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['srla', 'setroundslapsamount'],
    help: 'Set the laps amount in rounds mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in ROUNDS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 laps.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the laps amount to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetRoundForcedLaps',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['srpl', 'setroundspointlimit'],
    help: 'Set the points limit for rounds mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in ROUNDS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the points limit to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetRoundPointsLimit',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['stpl', 'setteamspointlimit'],
    help: 'Set the points limit for teams mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 2) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in TEAMS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the points limit to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetTeamPointsLimit',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['stmp', 'setteamsmaxpoints'],
    help: 'Set the max obtainable points per round for teams mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 2) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in TEAMS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the max points per team to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetTeamMaxPoints',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['scpl', 'setcuppointlimit'],
    help: 'Set the points limit for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 5) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the points limit to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetCupPointsLimit',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['scrpm', 'setcuproundspermap'],
    help: 'Set the amount of rounds per map for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 5) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 rounds per map.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the amount of rounds per map to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetCupRoundsPerChallenge',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['scwt', 'setcupwarmuptime'],
    help: 'Set the amount of rounds in warmup for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 5) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the amount of rounds in warm-up to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetCupWarmUpDuration',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['scwa', 'setcupwinnersamount'],
    help: 'Set the amount of winners for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      if (TM.state.gameConfig.gameMode !== 5) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't have <= 0 winners.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
            + `set the amount of cup winners to ${TM.utils.palette.highlight + amount}${TM.utils.palette.admin}.`
        }]
      },
        {
          method: 'SetCupNbWinners',
          params: [{
            int: amount
          }],
        })
    },
    privilege: 2
  },
  {
    aliases: ['dr', 'delrec', 'deleterecord'],
    help: 'Remove a player\'s record on the ongoing map.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string): void => {
      // Can also be done with TM.getPlayerRecord, however we need the player nickname
      const playerRecord: TMLocalRecord | undefined = TM.records.local.find(a => a.login === login)
      if (playerRecord === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player ${login} has no record on this map.`, info.login)
        return
      }
      TM.records.remove(playerRecord.login, TM.maps.current.id, info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
        + `removed the record of ${TM.utils.palette.highlight + (TM.utils.strip(playerRecord.nickname, true))}${TM.utils.palette.admin} on the ongoing map.`)
    },
    privilege: 2
  },
  {
    aliases: ['shuf', 'shuffle'],
    help: 'Shuffle the map queue.',
    callback: async (info: MessageInfo): Promise<void> => {
      TM.jukebox.shuffle(info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has `
        + `shuffled the queue.`)
    },
    privilege: 2
  }
]

for (const command of commands) { TM.commands.add(command) }
