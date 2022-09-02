import { trakman as tm } from '../../src/Trakman.js'
import config from './AdminCommands.config.js'

const commands: TMCommand[] = [
    {
        aliases: ['s', 'skip'],
        help: 'Skip to the next map.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.skip.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.skip.public ? undefined : info.login)
            tm.client.callNoRes(`NextChallenge`)
        },
        privilege: config.skip.privilege
    },
    {
        aliases: ['r', 'res', 'restart'],
        help: 'Restart the current map.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.res.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.res.public ? undefined : info.login)
            tm.client.callNoRes(`RestartChallenge`)
        },
        privilege: config.res.privilege
    },
    {
        aliases: ['pt', 'prev', 'previous'],
        help: 'Requeue the previously played map.',
        callback: async (info: MessageInfo): Promise<void> => {
            if (tm.jukebox.history[0] === undefined) {
                tm.sendMessage(config.prev.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.prev.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.prev.public ? undefined : info.login)
            tm.jukebox.add(tm.jukebox.history[0].id, info)
            await new Promise((r) => setTimeout(r, 5)) // Let the server think first
            tm.client.callNoRes(`NextChallenge`)
        },
        privilege: config.prev.privilege
    },
    {
        aliases: ['rq', 'requeue', 'replay'],
        help: 'Requeue the ongoing map.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.replay.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.replay.public ? undefined : info.login)
            tm.jukebox.add(tm.maps.current.id, info)
        },
        privilege: config.replay.privilege
    },
    {
        aliases: ['k', 'kick'],
        help: 'Kick a specific player.',
        params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, login: string, reason?: string): void => {
            const targetInfo: TMPlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                tm.sendMessage(config.kick.error, info.login)
                return
            }
            const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.kick.reason, { reason: reason })}.`
            tm.sendMessage(tm.utils.strVar(config.kick.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo.nickname) }) + `${reasonString}`, config.kick.public ? undefined : info.login)
            tm.client.callNoRes(`Kick`, [{ string: login }, { string: reason === undefined ? 'No reason specified' : reason }])
        },
        privilege: config.kick.privilege
    },
    {
        aliases: ['m', 'mute'],
        help: 'Mute a specific player.',
        params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
        callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
            let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                targetInfo = await tm.players.fetch(login)
            }
            const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
            const result: true | Error = await tm.admin.mute(login, info, targetInfo?.nickname, reason, expireDate)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while muting player ${logStr}`, result.message)
                tm.sendMessage(tm.utils.strVar(config.mute.error, { login: login }), info.login)
                return
            }
            const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.mute.reason, { reason: reason })}.`
            const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
            tm.sendMessage(tm.utils.strVar(config.mute.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.mute.public ? undefined : info.login)
        },
        privilege: config.mute.privilege
    },
    {
        aliases: ['um', 'unmute'],
        help: 'Unmute a specific player.',
        params: [{ name: 'login' }],
        callback: async (info: MessageInfo, login: string): Promise<void> => {
            let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                targetInfo = await tm.players.fetch(login)
            }
            const result: boolean | Error = await tm.admin.unmute(login, info)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while unmuting player ${logStr}`, result.message)
                tm.sendMessage(tm.utils.strVar(config.unmute.error, { login: login }), info.login)
                return
            }
            if (result === false) {
                tm.sendMessage(tm.utils.strVar(config.unmute.notMuted, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.unmute.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unmute.public ? undefined : info.login)
        },
        privilege: config.unmute.privilege
    },
    {
        aliases: ['fs', 'forcespec'],
        help: 'Force a player into spectator mode.',
        params: [{ name: 'login' }],
        callback: (info: MessageInfo, login: string): void => {
            const targetInfo: TMPlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                tm.sendMessage(config.forcespec.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.forcespec.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.forcespec.public ? undefined : info.login)
            tm.multiCallNoRes(
                {
                    method: 'ForceSpectator',
                    params: [{ string: login }, { int: 1 }]
                },
                {
                    method: 'ForceSpectator',
                    params: [{ string: login }, { int: 0 }]
                }
            )
        },
        privilege: config.forcespec.privilege
    },
    {
        aliases: ['fp', 'forceplay'],
        help: 'Force a player into player mode.',
        params: [{ name: 'login' }],
        callback: (info: MessageInfo, login: string): void => {
            const targetInfo: TMPlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                tm.sendMessage(config.forceplay.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.forceplay.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.forceplay.public ? undefined : info.login)
            tm.multiCallNoRes(
                {
                    method: 'ForceSpectator',
                    params: [{ string: login }, { int: 2 }]
                },
                {
                    method: 'ForceSpectator',
                    params: [{ string: login }, { int: 0 }]
                }
            )
        },
        privilege: config.forceplay.privilege
    },
    {
        aliases: ['kg', 'gk', 'kickghost', 'ghostkick'],
        help: 'Manipulate every soul on the server that you kicked someone.',
        params: [{ name: 'login' }],
        callback: (info: MessageInfo, login: string): void => {
            tm.sendMessage(tm.utils.strVar(config.kickghost.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: login }), config.kickghost.public ? undefined : info.login)
            tm.client.callNoRes(`Kick`, [{ string: login }])
        },
        privilege: config.kickghost.privilege
    },
    {
        aliases: ['dq', 'djb', 'dropqueue', 'dropjukebox'],
        help: 'Drop the specified track from the map queue',
        params: [{ name: 'index', type: 'int' }],
        callback: (info: MessageInfo, index: number): void => {
            const map: TMMap | undefined = tm.jukebox.juked[index + 1]?.map
            if (map === undefined) {
                tm.sendMessage(config.dropjukebox.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.dropjukebox.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(map.name) }), config.dropjukebox.public ? undefined : info.login)
            tm.jukebox.remove(map.id, info)
        },
        privilege: config.dropjukebox.privilege
    },
    {
        aliases: ['cq', 'cjb', 'clearqueue', 'clearjukebox'],
        help: 'Clear the entirety of the current map queue',
        callback: (info: MessageInfo): void => {
            if (tm.jukebox.juked.length === 0) {
                tm.sendMessage(config.clearjukebox.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.clearjukebox.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.clearjukebox.public ? undefined : info.login)
            for (const map of tm.jukebox.juked) {
                tm.jukebox.remove(map.map.id, info)
            }
        },
        privilege: config.clearjukebox.privilege
    },
    {
        aliases: ['er', 'endround'],
        help: 'End the ongoing round in rounds-based gamemodes.',
        callback: (info: MessageInfo): void => {
            if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
                tm.sendMessage(config.endround.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.endround.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.endround.public ? undefined : info.login)
        },
        privilege: config.endround.privilege
    },
    {
        aliases: ['sgm', 'setgamemode'],
        help: 'Change the gamemode.',
        params: [{ name: 'mode' }],
        callback: (info: MessageInfo, mode: string): void => {
            let modeInt: number
            switch (mode.toLowerCase()) {
                case 'rounds': case 'round': modeInt = 0
                    break
                case 'timeattack': case 'ta': modeInt = 1
                    break
                case 'teams': case 'team': modeInt = 2
                    break
                case 'laps': case 'lap': modeInt = 3
                    break
                case 'stunts': case 'stunt': modeInt = 4
                    break
                case 'cup': modeInt = 5
                    break
                default: tm.sendMessage(config.setgamemode.error, info.login)
                    return
            }
            tm.sendMessage(tm.utils.strVar(config.setgamemode.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), mode: mode.toUpperCase() }), config.setgamemode.public ? undefined : info.login)
            tm.client.callNoRes(`SetGameMode`, [{ int: modeInt }])
        },
        privilege: config.setgamemode.privilege
    },
    {
        aliases: ['b', 'ban'],
        help: 'Ban a specific player.',
        params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
        callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
            const targetInfo: TMPlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                tm.sendMessage(config.ban.error, info.login)
                return
            }
            const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
            const result: true | Error = await tm.admin.ban(targetInfo.ip, targetInfo.login, info, targetInfo.nickname, reason, expireDate)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while banning player ${logStr}`, result.message)
                tm.sendMessage(tm.utils.strVar(config.ban.error, { login: login }), info.login)
                return
            }
            const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.ban.reason, { reason: reason })}.`
            const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
            tm.sendMessage(tm.utils.strVar(config.ban.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.ban.public ? undefined : info.login)
        },
        privilege: config.ban.privilege
    },
    {
        aliases: ['ub', 'unban'],
        help: 'Unban a specific player.',
        params: [{ name: 'login' }],
        callback: async (info: MessageInfo, login: string): Promise<void> => {
            const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(login)
            const result: boolean | Error = await tm.admin.unban(login, info)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while unmuting player ${logStr}`, result.message)
                tm.sendMessage(tm.utils.strVar(config.unmute.error, { login: login }), info.login)
                return
            }
            if (result === false) {
                tm.sendMessage(tm.utils.strVar(config.unban.notBanned, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.unban.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unban.public ? undefined : info.login)
        },
        privilege: config.unban.privilege
    },
    {
        aliases: ['bl', 'blacklist'],
        help: 'Blacklist a specific player.',
        params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
        callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
            let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                targetInfo = await tm.players.fetch(login)
            }
            const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
            const result: true | Error = await tm.admin.addToBlacklist(login, info, targetInfo?.nickname, reason, expireDate)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while blacklisting player ${logStr}`, result.message)
                tm.sendMessage(tm.utils.strVar(config.blacklist.error, { login: login }), info.login)
                return
            }
            const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.blacklist.reason, { reason: reason })}.`
            const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
            tm.sendMessage(tm.utils.strVar(config.blacklist.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.blacklist.public ? undefined : info.login)
        },
        privilege: config.blacklist.privilege
    },
    {
        aliases: ['ubl', 'unblacklist'],
        help: 'Remove a specific player from the blacklist.',
        params: [{ name: 'login' }],
        callback: async (info: MessageInfo, login: string): Promise<void> => {
            const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(login)
            const result: boolean | Error = await tm.admin.unblacklist(login, info)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while removing player ${logStr} from the blacklist`, result.message)
                tm.sendMessage(tm.utils.strVar(config.unblacklist.error, { login: login }), info.login)
                return
            }
            if (result === false) {
                tm.sendMessage(tm.utils.strVar(config.unblacklist.notBlacklisted, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.unblacklist.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unblacklist.public ? undefined : info.login)
        },
        privilege: config.unblacklist.privilege
    },
    {
        aliases: ['ag', 'addguest'],
        help: 'Add a player to the guestlist',
        params: [{ name: 'login' }],
        callback: async (info: MessageInfo, login: string): Promise<void> => {
            let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                targetInfo = await tm.players.fetch(login)
            }
            const result: boolean | Error = await tm.admin.addGuest(login, info, targetInfo?.nickname)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while adding player ${logStr} to the guestlist`, result.message)
                tm.sendMessage(tm.utils.strVar(config.addguest.error, { login: login }), info.login)
                return
            }
            if (result === false) {
                tm.sendMessage(tm.utils.strVar(config.addguest.alreadyGuest, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.addguest.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.addguest.public ? undefined : info.login)
        },
        privilege: config.addguest.privilege
    },
    {
        aliases: ['rg', 'rmguest', 'removeguest'],
        help: 'Remove a player from the guestlist',
        params: [{ name: 'login' }],
        callback: async (info: MessageInfo, login: string): Promise<void> => {
            let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
            if (targetInfo === undefined) {
                targetInfo = await tm.players.fetch(login)
            }
            const result: boolean | Error = await tm.admin.removeGuest(login, info)
            let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
            if (result instanceof Error) {
                tm.log.error(`Error while removing player ${logStr} from the guestlist`, result.message)
                tm.sendMessage(tm.utils.strVar(config.rmguest.error, { login: login }), info.login)
                return
            }
            if (result === false) {
                tm.sendMessage(tm.utils.strVar(config.rmguest.notGuest, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.rmguest.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.rmguest.public ? undefined : info.login)
        },
        privilege: config.rmguest.privilege
    },
    {
        aliases: ['srp', 'setrefpwd', 'setrefereepassword'],
        help: 'Set the referee password.',
        params: [{ name: 'password', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, password?: string): void => {
            const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
            if (password !== undefined && !regex.test(password)) {
                tm.sendMessage(config.setrefpwd.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setrefpwd.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), password: password !== undefined ? password : 'none (disabled)' }), config.setrefpwd.public ? undefined : info.login)
            tm.client.callNoRes(`SetRefereePassword`, [{ string: password === undefined ? '' : password }])
        },
        privilege: config.setrefpwd.privilege
    },
    {
        aliases: ['srm', 'setrefmode', 'setrefereemode'],
        help: 'Set the referee mode.',
        params: [{ name: 'mode', type: 'boolean' }],
        callback: (info: MessageInfo, mode: boolean): void => {
            tm.sendMessage(tm.utils.strVar(config.setrefmode.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), mode: mode ? 'ALL' : 'TOP3' }), config.setrefmode.public ? undefined : info.login)
            tm.client.call(`SetRefereeMode`, [{ int: mode ? 1 : 0 }])
        },
        privilege: config.setrefmode.privilege
    },
    {
        aliases: ['fpt', 'forceteam', 'forceplayerteam'],
        help: 'Force a player into the specified team.',
        params: [{ name: 'player' }, { name: 'team' }],
        callback: async (info: MessageInfo, player: string, team: string): Promise<void> => {
            if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
                tm.sendMessage(config.forceteam.notRounds, info.login)
                return
            }
            const playerInfo: TMPlayer | undefined = tm.players.get(player)
            if (playerInfo === undefined) {
                tm.sendMessage(config.forceteam.playerOffline, info.login)
                return
            }
            let teamInt: number
            let teamColour: string
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
                    tm.sendMessage(config.forceteam.error, info.login)
                    return
            }
            tm.sendMessage(tm.utils.strVar(config.forceteam.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(playerInfo.nickname), team: (teamColour + team.toUpperCase()) }), config.forceteam.public ? undefined : info.login)
            tm.client.callNoRes(`ForcePlayerTeam`, [{ string: player }, { int: teamInt }])
        },
        privilege: config.forceteam.privilege
    },
    {
        aliases: ['swu', 'setwarmup'],
        help: 'Set whether the server is in warmup mode.',
        params: [{ name: 'enabled', type: 'boolean' }],
        callback: (info: MessageInfo, enabled: boolean): void => {
            if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
                tm.sendMessage(config.setwarmup.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setwarmup.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), state: enabled ? 'enabled' : 'disabled' }), config.setwarmup.public ? undefined : info.login)
            tm.client.callNoRes(`SetWarmUp`, [{ boolean: enabled }])
        },
        privilege: config.setwarmup.privilege
    },
    {
        aliases: ['sla', 'setlapsamount'],
        help: 'Set the laps amount in laps mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 3) {
                tm.sendMessage(config.setlapsamount.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setlapsamount.insufficientLaps, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setlapsamount.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setlapsamount.public ? undefined : info.login)
            tm.client.callNoRes(`SetNbLaps`, [{ int: amount }])
        },
        privilege: config.setlapsamount.privilege
    },
    {
        aliases: ['srla', 'setroundslapsamount'],
        help: 'Set the laps amount in rounds mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 0) {
                tm.sendMessage(config.setroundslapsamount.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setroundslapsamount.insufficientLaps, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setroundslapsamount.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setroundslapsamount.public ? undefined : info.login)
            tm.client.callNoRes(`SetRoundForcedLaps`, [{ int: amount }])
        },
        privilege: config.setroundslapsamount.privilege
    },
    {
        aliases: ['srpl', 'setroundspointlimit'],
        help: 'Set the points limit for rounds mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 0) {
                tm.sendMessage(config.setroundspointlimit.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setroundspointlimit.insufficientPoints, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setroundspointlimit.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setroundspointlimit.public ? undefined : info.login)
            tm.client.callNoRes(`SetRoundPointsLimit`, [{ int: amount }])
        },
        privilege: config.setroundspointlimit.privilege
    },
    {
        aliases: ['stpl', 'setteamspointlimit'],
        help: 'Set the points limit for teams mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 2) {
                tm.sendMessage(config.setteamspointlimit.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setteamspointlimit.insufficientPoints, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setteamspointlimit.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setteamspointlimit.public ? undefined : info.login)
            tm.client.callNoRes(`SetTeamPointsLimit`, [{ int: amount }])
        },
        privilege: config.setteamspointlimit.privilege
    },
    {
        aliases: ['stmp', 'setteamsmaxpoints'],
        help: 'Set the max obtainable points per round for teams mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 2) {
                tm.sendMessage(config.setteamsmaxpoints.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setteamsmaxpoints.insufficientPoints, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setteamsmaxpoints.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setteamsmaxpoints.public ? undefined : info.login)
            tm.client.callNoRes(`SetTeamMaxPoints`, [{ int: amount }])
        },
        privilege: config.setteamsmaxpoints.privilege
    },
    {
        aliases: ['scpl', 'setcuppointlimit'],
        help: 'Set the points limit for cup mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 5) {
                tm.sendMessage(config.setcuppointlimit.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setcuppointlimit.insufficientPoints, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setcuppointlimit.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setcuppointlimit.public ? undefined : info.login)
            tm.client.callNoRes(`SetCupPointsLimit`, [{ int: amount }])
        },
        privilege: config.setcuppointlimit.privilege
    },
    {
        aliases: ['scrpm', 'setcuproundspermap'],
        help: 'Set the amount of rounds per map for cup mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 5) {
                tm.sendMessage(config.setcuproundspermap.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setcuproundspermap.insufficientRounds, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setcuproundspermap.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setcuproundspermap.public ? undefined : info.login)
            tm.client.callNoRes(`SetCupRoundsPerChallenge`, [{ int: amount }])
        },
        privilege: config.setcuproundspermap.privilege
    },
    {
        aliases: ['scwt', 'setcupwarmuptime'],
        help: 'Set the amount of rounds in warmup for cup mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 5) {
                tm.sendMessage(config.setcupwarmuptime.error, info.login)
                return
            }
            if (amount < 0) {
                tm.sendMessage(config.setcupwarmuptime.insufficientRounds, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setcupwarmuptime.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setcupwarmuptime.public ? undefined : info.login)
            tm.client.callNoRes(`SetCupWarmUpDuration`, [{ int: amount }])
        },
        privilege: config.setcupwarmuptime.privilege
    },
    {
        aliases: ['scwa', 'setcupwinnersamount'],
        help: 'Set the amount of winners for cup mode.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            if (tm.state.gameConfig.gameMode !== 5) {
                tm.sendMessage(config.setcupwinnersamount.error, info.login)
                return
            }
            if (amount <= 0) {
                tm.sendMessage(config.setcupwinnersamount.insufficientWinners, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setcupwinnersamount.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), amount: amount }), config.setcupwinnersamount.public ? undefined : info.login)
            tm.client.callNoRes(`SetCupNbWinners`, [{ int: amount }])
        },
        privilege: config.setcupwinnersamount.privilege
    },
    {
        aliases: ['dr', 'delrec', 'deleterecord'],
        help: 'Remove a player\'s record on the ongoing map.',
        params: [{ name: 'login' }],
        callback: (info: MessageInfo, login: string): void => {
            // Can also be done with tm.getPlayerRecord, however we need the player nickname
            const playerRecord: TMLocalRecord | undefined = tm.records.getLocal(login)
            if (playerRecord === undefined) {
                tm.sendMessage(tm.utils.strVar(config.delrec.error, { login: login }), info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.delrec.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), nickname: tm.utils.strip(playerRecord.nickname) }), config.delrec.public ? undefined : info.login)
            tm.records.remove(playerRecord, tm.maps.current.id, info)
        },
        privilege: config.delrec.privilege
    },
    {
        aliases: ['shuf', 'shuffle'],
        help: 'Shuffle the map queue.',
        callback: async (info: MessageInfo): Promise<void> => {
            tm.sendMessage(tm.utils.strVar(config.shuffle.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.shuffle.public ? undefined : info.login)
            tm.jukebox.shuffle(info)
        },
        privilege: config.shuffle.privilege
    },
    {
        aliases: ['ssn', 'setservername'],
        help: 'Set the server name.',
        params: [{ name: 'name', type: 'multiword' }],
        callback: (info: MessageInfo, name: string): void => {
            tm.sendMessage(tm.utils.strVar(config.setservername.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: name.length === 0 ? `the server login` : name }), config.setservername.public ? undefined : info.login)
            tm.client.callNoRes(`SetServerName`, [{ string: name }])
        },
        privilege: config.setservername.privilege
    },
    {
        aliases: ['sc', 'setcomment'],
        help: 'Set the server comment.',
        params: [{ name: 'comment', type: 'multiword' }],
        callback: (info: MessageInfo, comment: string): void => {
            tm.sendMessage(tm.utils.strVar(config.setcomment.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: comment.length === 0 ? `absolutely nothing` : comment }), config.setcomment.public ? undefined : info.login)
            tm.client.callNoRes(`SetServerComment`, [{ string: comment }])
        },
        privilege: config.setcomment.privilege
    },
    {
        aliases: ['sp', 'setpwd', 'setpassword'],
        help: 'Set the player password.',
        params: [{ name: 'password', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, password?: string): void => {
            const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
            if (password !== undefined && !regex.test(password)) {
                tm.sendMessage(config.setpassword.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setpassword.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: password !== undefined ? password : 'none (disabled)' }), config.setpassword.public ? undefined : info.login)
            tm.client.callNoRes(`SetServerPassword`, [{ string: password === undefined ? '' : password }])
        },
        privilege: config.setpassword.privilege
    },
    {
        aliases: ['ssp', 'setspecpwd', 'setspecpassword'],
        help: 'Set the spectator password.',
        params: [{ name: 'password', type: 'multiword', optional: true }],
        callback: (info: MessageInfo, password?: string): void => {
            const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
            if (password !== undefined && !regex.test(password)) {
                tm.sendMessage(config.setspecpassword.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.setspecpassword.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: password !== undefined ? password : 'none (disabled)' }), config.setspecpassword.public ? undefined : info.login)
            tm.client.callNoRes(`SetServerPasswordForSpectator`, [{ string: password === undefined ? '' : password }])
        },
        privilege: config.setspecpassword.privilege
    },
    {
        aliases: ['smp', 'setmaxplayers'],
        help: 'Set the max players amount.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            tm.sendMessage(tm.utils.strVar(config.setmaxplayers.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxplayers.public ? undefined : info.login)
            tm.client.callNoRes(`SetMaxPlayers`, [{ int: amount }])
        },
        privilege: config.setmaxplayers.privilege
    },
    {
        aliases: ['sms', 'setmaxspecs'],
        help: 'Set the max spectators amount.',
        params: [{ name: 'amount', type: 'int' }],
        callback: (info: MessageInfo, amount: number): void => {
            tm.sendMessage(tm.utils.strVar(config.setmaxspecs.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxspecs.public ? undefined : info.login)
            tm.client.callNoRes(`SetMaxSpectators`, [{ int: amount }])
        },
        privilege: config.setmaxspecs.privilege
    },
    {
        aliases: ['sct', 'setchattime'],
        help: 'Set the time you spend on the podium screen.',
        params: [{ name: 'time', type: 'int' }],
        callback: (info: MessageInfo, time: number): void => {
            tm.sendMessage(tm.utils.strVar(config.setchattime.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: time }), config.setchattime.public ? undefined : info.login)
            tm.client.callNoRes(`SetChatTime`, [{ int: time }])
        },
        privilege: config.setchattime.privilege
    },
    {
        aliases: ['stl', 'settimelimit'],
        help: 'Set the time you spend gaming.',
        params: [{ name: 'time', type: 'int' }],
        callback: (info: MessageInfo, time: number): void => {
            tm.sendMessage(tm.utils.strVar(config.settimelimit.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: time }), config.settimelimit.public ? undefined : info.login)
            tm.client.callNoRes(`SetTimeAttackLimit`, [{ int: time }])
        },
        privilege: config.settimelimit.privilege
    },
    {
        aliases: ['sn', 'sendnotice'],
        help: 'Send a notice.',
        // TODO: FiX tHiS THiNgY XxX
        params: [{ name: 'time', type: 'time' }, /*{name: 'loginAvatar', optional: true},*/ { name: 'notice', type: 'multiword' }],
        callback: (info: MessageInfo, time: number, /*loginAvatar?: string,*/  notice: string): void => {
            tm.sendMessage(tm.utils.strVar(config.sendnotice.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: notice }), config.sendnotice.public ? undefined : info.login)
            tm.client.callNoRes(`SendNotice`, [{ string: notice }, { string: /*loginAvatar*/ '' }, { int: time }])
        },
        privilege: config.sendnotice.privilege
    },
    {
        aliases: ['amdl', 'allowmapdownload'],
        help: 'Set whether map download is enabled.',
        params: [{ name: 'status', type: 'boolean' }],
        callback: (info: MessageInfo, status: boolean): void => {
            tm.sendMessage(tm.utils.strVar(config.allowmapdownload.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: status ? 'allowed' : 'disallowed' }), config.allowmapdownload.public ? undefined : info.login)
            tm.client.callNoRes(`AllowChallengeDownload`, [{ boolean: status }])
        },
        privilege: config.allowmapdownload.privilege
    },
    {
        aliases: ['fso', 'forceshowopp', 'forceshowopponents'],
        help: 'Set whether forced opponent display is enabled.',
        params: [{ name: 'status', type: 'boolean' }, { name: 'amount', type: 'int', optional: true }],
        callback: (info: MessageInfo, status: boolean, amount?: number): void => {
            let n: number
            if (!status) { n = 0 } else if (amount !== undefined) { n = amount } else { n = 1 }
            tm.sendMessage(tm.utils.strVar(config.forceshowopp.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.forceshowopp.public ? undefined : info.login)
            tm.client.callNoRes(`SetForceShowAllOpponents`, [{ int: n }])
        },
        privilege: config.forceshowopp.privilege
    },
    {
        aliases: ['drp', 'disablerespawn'],
        help: 'Set whether checkpoint respawning is enabled.',
        params: [{ name: 'status', type: 'boolean' }],
        callback: (info: MessageInfo, status: boolean): void => {
            tm.sendMessage(tm.utils.strVar(config.disablerespawn.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: status ? 'disabled' : 'enabled' }), config.disablerespawn.public ? undefined : info.login)
            tm.client.callNoRes(`SetDisableRespawn`, [{ boolean: status }])
        },
        privilege: config.disablerespawn.privilege
    },
    {
        aliases: ['ccs', 'coppers', 'checkcoppers'],
        help: 'Check the amount of coppers the server account currently has.',
        callback: async (info: MessageInfo): Promise<void> => {
            // TODO: Return immediately if the server isn't united.
            // TODO: Put isUnited to ServerConfig since we do DetailedPlayerInfo for server login on init
            const coppers: any[] | Error = await tm.client.call('GetServerCoppers')
            if (coppers instanceof Error) {
                tm.log.error(`Couldn't retrieve the coppers amount.`, coppers.message)
                tm.sendMessage(config.coppers.error, info.login)
                return
            }
            tm.sendMessage(tm.utils.strVar(config.coppers.text, { value: coppers[0] }), config.coppers.public ? undefined : info.login)
        },
        privilege: config.coppers.privilege
    },
    {
        aliases: ['shs', 'sethideserver'],
        help: 'Set whether the server is hidden.',
        params: [{ name: 'value', type: 'int' }],
        callback: (info: MessageInfo, value: number): void => {
            if (![0, 1, 2].includes(value)) {
                tm.sendMessage(config.sethideserver.error, info.login)
                return
            }
            let status: string
            switch (value) {
                case 1: status = 'hidden'
                    break
                case 2: status = 'hidden for TMNF players'
                    break
                default: status = 'visible'
            }
            tm.sendMessage(tm.utils.strVar(config.sethideserver.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), status: status }), config.sethideserver.public ? undefined : info.login)
            tm.client.callNoRes(`SetHideServer`, [{ int: value }])
        },
        privilege: config.sethideserver.privilege
    },
    {
        aliases: ['asr', 'autosavereplays'],
        help: 'Set whether replays should be autosaved by the server.',
        params: [{ name: 'status', type: 'boolean' }],
        callback: (info: MessageInfo, status: boolean): void => {
            tm.sendMessage(tm.utils.strVar(config.autosavereplays.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavereplays.public ? undefined : info.login)
            tm.client.callNoRes(`AutoSaveReplays`, [{ boolean: status }])
        },
        privilege: config.autosavereplays.privilege
    },
    {
        aliases: ['asvr', 'autosavevalreplays'],
        help: 'Set whether validation replays should be autosaved by the server.',
        params: [{ name: 'status', type: 'boolean' }],
        callback: (info: MessageInfo, status: boolean): void => {
            tm.sendMessage(tm.utils.strVar(config.autosavevalreplays.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavevalreplays.public ? undefined : info.login)
            tm.client.callNoRes(`AutoSaveValidationReplays`, [{ boolean: status }])
        },
        privilege: config.autosavevalreplays.privilege
    },
    {
        aliases: ['pr', 'prunerecs', 'prunerecords'],
        help: 'Remove all records on the ongoing map.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.prunerecs.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.prunerecs.public ? undefined : info.login)
            tm.records.removeAll(tm.maps.current.id, info)
        },
        privilege: config.prunerecs.privilege
    },
    {
        aliases: ['kc', 'killcontroller'],
        help: 'Kill the server controller.',
        callback: (info: MessageInfo): never => {
            tm.sendMessage(tm.utils.strVar(config.killcontroller.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.killcontroller.public ? undefined : info.login)
            process.exit(0)
        },
        privilege: config.killcontroller.privilege
    },
    {
        aliases: ['sd', 'shutdown'],
        help: 'Stop the dedicated server.',
        callback: (info: MessageInfo): void => {
            tm.sendMessage(tm.utils.strVar(config.shutdown.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.shutdown.public ? undefined : info.login)
            tm.client.callNoRes(`StopServer`)
        },
        privilege: config.shutdown.privilege
    },
    {
        aliases: ['ffdb', 'fetchallfromdb'],
        help: 'Adds all the maps present in database if they are on TMX based on id',
        callback: async (info: MessageInfo): Promise<void> => {
            const res: { uid: string, id: number }[] | Error = await tm.db.query(`SELECT uid, id FROM map_ids`)
            const filenames: { filename: string }[] | Error = await tm.db.query(`SELECT filename FROM maps`)
            if (res instanceof Error || filenames instanceof Error) {
                tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to get maps from the database.`, info.login)
                return
            }
            for (const map of res) {
                if (tm.maps.list.some(a => a.id === map.uid))
                    continue
                const file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(map.uid)
                if (file instanceof Error) {
                    continue
                }
                while (filenames.some(a => a.filename === file.name)) { //yes
                    file.name = [...file.name.split('').slice(0, file.name.length - 15), (Math.random() + 1).toString(36).slice(-1), '.Challenge.Gbx'].join('')
                }
                const write: any[] | Error = await tm.client.call('WriteFile', [{ string: file.name }, { base64: file.content.toString('base64') }])
                if (write instanceof Error) {
                    tm.log.error('Failed to write file', write.message)
                    tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to write the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}file to the server.`, info.login)
                    continue
                }
                const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: file.name }])
                if (insert instanceof Error) {
                    tm.log.error('Failed to insert map to jukebox', insert.message)
                    tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}into queue.`, info.login)
                    continue
                }
                tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
                    + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
                    + `${tm.utils.palette.highlight + tm.utils.strip(map.uid, true)}${tm.utils.palette.admin} from TMX.`)
            }
        },
        privilege: 4
    },
    {
        aliases: ['aadb', 'addallfromdb'],
        help: 'Adds all the maps present in database if they are on the server based on filename.',
        callback: async (info: MessageInfo): Promise<void> => {
            const res: any[] | Error = await tm.db.query('SELECT * FROM maps;')
            if (res instanceof Error) {
                tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to get maps from the database.`, info.login)
                return
            }
            for (const map of res) {
                if (tm.maps.list.some(a => a.id === map.id))
                    continue
                const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: map.filename }])
                if (insert instanceof Error) {
                    tm.log.error('Failed to insert map to jukebox', insert.message)
                    tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map ${tm.utils.palette.highlight + tm.utils.strip(map.name, false)}$z$s ${tm.utils.palette.error}into queue.`, info.login)
                    continue
                }
                tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
                    + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
                    + `${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.admin} from server files.`)
            }
        },
        privilege: 4
    },
    // TODO MOVE IT INTO ANOTHER PLUGIN OUT OF SRC
    /*
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
    */
    // TODO MOVE THIS FROM HERE
    {
        aliases: ['players', 'playerlist'],
        help: 'Display list of players.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.playerList, info.login)
        },
        privilege: 1
    },
    {
        aliases: ['banlist'],
        help: 'Display list of banned players.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.banList, info.login)
        },
        privilege: 1
    },
    {
        aliases: ['bll, blacklists'],
        help: 'Display list of blackisted players.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.blacklistList, info.login)
        },
        privilege: 1
    },
    {
        aliases: ['gl', 'guestlist'],
        help: 'Display list of players in the guestlist.',
        callback: (info: MessageInfo): void => {
            tm.openManialink(tm.UIIDS.guestlistList, info.login)
        },
        privilege: 1
    },
]

for (const c of commands) { tm.commands.add(c) }
