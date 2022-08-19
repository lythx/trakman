import { trakman as tm } from '../../src/Trakman.js'

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
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Invalid gamemode.`, info.login)
          return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has set `
            + `the gamemode to ${tm.utils.palette.highlight + mode.toUpperCase()}${tm.utils.palette.admin}.`
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
    callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
      const target: TMPlayer | undefined = tm.players.get(login)
      const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
      if (target === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player ${login} is not on the server.`, info.login)
        return
      }
      const result = await tm.admin.ban(target.ip, target.login, info, target.nickname, reason, expireDate)
      if (result instanceof Error) {
        tm.log.error(`Error while banning player ${tm.utils.strip(target.nickname)} (${target.login})`, result.message)
        tm.sendMessage(`Error while banning player ${tm.utils.strip(target.nickname)} (${target.login})`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${tm.utils.palette.highlight}: ${reason}${tm.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has banned `
        + `${tm.utils.palette.highlight + tm.utils.strip(target.nickname)}${tm.utils.palette.admin}${durationString}.${tm.utils.palette.admin}${reasonString}`)

    },
    privilege: 2
  },
  {
    aliases: ['ub', 'unban'],
    help: 'Unban a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      let target: TMOfflinePlayer | undefined = tm.players.get(login)
      if (target === undefined) {
        target = await tm.players.fetch(login)
      }
      const result = await tm.admin.unban(login, info)
      let logStr = target === undefined ? `(${login})` : `${tm.utils.strip(target.nickname)} (${target.login})`
      if (result instanceof Error) {
        tm.log.error(`Error while unbanning player ${logStr}`, result.message)
        tm.sendMessage(`Error while unbanning player ${logStr}`, info.login)
        return
      }
      if (result === false) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Specified player was not banned.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has unbanned `
        + `${tm.utils.palette.highlight + tm.utils.strip(target?.nickname ?? login)}${tm.utils.palette.admin}.`
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
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo == null) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      tm.admin.addToBlacklist(targetInfo.login, info, reason, targetInfo.nickname, expireDate)
      const reasonString: string = reason === undefined ? '' : ` Reason${tm.utils.palette.highlight}: ${reason}${tm.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has blacklisted `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}${durationString}.${tm.utils.palette.admin}${reasonString}`
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
      if (tm.blacklist.some(a => a.login === login) === false) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Specified player was not blacklisted.`, info.login)
        return
      }
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo == null) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      tm.admin.unblacklist(targetInfo.login, info)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has unblacklisted `
        + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}.`
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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has set `
            + `the referee password to ${tm.utils.palette.highlight + (password !== undefined ? password : 'none (disabled)')}$z$s${tm.utils.palette.admin}.`
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
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has set the referee mode to `
            + `${tm.utils.palette.highlight + (mode ? 'ALL' : 'TOP3')}${tm.utils.palette.admin}.`
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
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo == null) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      const res: boolean | Error = await tm.admin.addGuest(login, info)
      if (res instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server failed to add to guest list.`, info.login)
        return
      }
      if (res === false) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Specified player is already in the guestlist.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added `
        + `${tm.utils.palette.highlight + targetInfo.nickname}${tm.utils.palette.admin} to guestlist.`)
    },
    privilege: 2
  },
  {
    aliases: ['rg', 'rmguest', 'removeguest'],
    help: 'Remove a player from the guestlist',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo == null) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player or no login specified.`, info.login)
          return
        }
      }
      const res: boolean | Error = await tm.admin.removeGuest(login, info)
      if (res instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server failed to remove from guest list.`, info.login)
        return
      }
      if (res === false) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Specified player is not in the guestlist.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
        + `${tm.utils.palette.highlight + targetInfo.nickname}${tm.utils.palette.admin} from guestlist.`)
    },
    privilege: 2
  },
  {
    aliases: ['hm', 'hardmute'],
    help: 'Mute a player and disable their commands.',
    // TODO params
    callback: async (info: MessageInfo): Promise<void> => {
      const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
      if (targetInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player or no login specified.`, info.login)
        return
      }
      const targetLogin: string = info.text
      const callerLogin: string = info.login
      if (targetLogin == null) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, callerLogin)
        return
      }
      if (targetInfo.privilege === 4) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of the server owner.`, callerLogin)
        return
      }
      if (targetInfo.login === callerLogin) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control your own privileges.`, callerLogin)
        return
      }
      else if (targetInfo.privilege < 1) {
        tm.admin.setPrivilege(targetLogin, -1, info)
      }
      else {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot disable commands of a privileged person.`, callerLogin)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
            `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has disabled ` +
            `commands and muted ${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname, true)}${tm.utils.palette.admin}.`
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
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, info.login)
        return
      }
      const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
      if (targetInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server.`, info.login)
        return
      }
      if (hfsList.some(a => a === targetInfo.login)) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is already hardforced into specmode.`, info.login)
        return
      }
      hfsList.push(targetInfo.login)
      await tm.multiCall(
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 1 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
              + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has hardforced `
              + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin} into specmode.`
          }]
        }
      )
      tm.addListener('Controller.PlayerJoin', (i: JoinInfo): void => {
        if (hfsList.some(a => a === i.login)) {
          tm.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      tm.addListener('Controller.PlayerInfoChanged', async (i: InfoChangedInfo): Promise<void> => {
        if (hfsList.some(a => a === i.login)) {
          await new Promise((r) => setTimeout(r, (Math.random() * 6800) + 200))
          tm.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
        }
      })
      await new Promise((r) => setTimeout(r, 5))
      tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.text }])
    },
    privilege: 2
  },
  {
    aliases: ['uhfs', 'undohardforcespec'],
    help: 'Undo hardforcespec.',
    // TODO params
    callback: async (info: MessageInfo): Promise<void> => {
      if (info.text.length === 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, info.login)
        return
      }
      if (!hfsList.some(a => a === info.login)) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not hardforced into specmode.`, info.login)
        return
      }
      hfsList.splice(hfsList.indexOf(info.login), 1)
      const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
      tm.multiCallNoRes(
        {
          method: 'ForceSpectator',
          params: [{ string: info.text }, { int: 0 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
              + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has released `
              + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname || info.login)}${tm.utils.palette.admin} out of specmode.`
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
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
            `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has set the points limit ` +
            `to ${tm.utils.palette.highlight + limit}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      let teamInt: number
      let teamColour: string
      const playerinfo: TMPlayer | undefined = tm.players.get(player)
      if (playerinfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server.`, info.login)
        return
      }
      switch (team.toLowerCase()) {
        case 'blue':
          teamInt = 0
          teamColour = `${tm.utils.colours.blue}`
          break
        case 'red':
          teamInt = 1
          teamColour = `${tm.utils.colours.red}`
          break
        default:
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Invalid team type.`, info.login)
          return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has put `
            + `player ${tm.utils.palette.highlight + tm.utils.strip(playerinfo.nickname)} ${tm.utils.palette.admin}to the ${teamColour + team.toUpperCase()}${tm.utils.palette.admin} team.`
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
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `${tm.utils.palette.highlight + (enabled ? 'enabled' : 'disabled')}${tm.utils.palette.admin} warm-up mode.`
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
      if (tm.state.gameConfig.gameMode !== 3) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in LAPS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 laps.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the laps amount to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in ROUNDS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 laps.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the laps amount to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in ROUNDS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the points limit to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 2) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in TEAMS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the points limit to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 2) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in TEAMS gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the max points per team to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 points limit.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the points limit to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 rounds per map.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the amount of rounds per map to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the amount of rounds in warm-up to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Only available in CUP gamemode.`, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't have <= 0 winners.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
            + `set the amount of cup winners to ${tm.utils.palette.highlight + amount}${tm.utils.palette.admin}.`
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
      // Can also be done with tm.getPlayerRecord, however we need the player nickname
      const playerRecord: TMLocalRecord | undefined = tm.records.local.find(a => a.login === login)
      if (playerRecord === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player ${login} has no record on this map.`, info.login)
        return
      }
      tm.records.remove(playerRecord, tm.maps.current.id, info)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
        + `removed the record of ${tm.utils.palette.highlight + (tm.utils.strip(playerRecord.nickname, true))}${tm.utils.palette.admin} on the ongoing map.`)
    },
    privilege: 2
  },
  {
    aliases: ['shuf', 'shuffle'],
    help: 'Shuffle the map queue.',
    callback: async (info: MessageInfo): Promise<void> => {
      tm.jukebox.shuffle(info)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has `
        + `shuffled the queue.`)
    },
    privilege: 2
  }
]

for (const command of commands) { tm.commands.add(command) }
