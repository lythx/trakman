import config from './Config.js'
import { VoteWindow } from '../ui/UI.js'
import { titles } from '../../config/Titles.js'

interface CallerInfo { login: string, nickname: string, title: string, privilege: number }

const sendNoPrivilegeMessage = (info: CallerInfo): void => tm.sendMessage(config.noPermission, info.login)

let eraseObject: { id: string, admin: { login: string, nickname: string } } | undefined
tm.addListener('BeginMap', (info): void => {
  if (info.isRestart) { return }
  if (eraseObject !== undefined) {
    void tm.maps.remove(eraseObject.id, eraseObject.admin)
    eraseObject = undefined
  }
})

/**
 * Provides utilities for various actions.
 * @author lythx & wiseraven
 * @since 1.3
 */
export const actions = {
  /**
   * Adds a vote for the current map and sends a chat message
   * @param info Player information
   * @param voteValue Vote value
   */
  addVote: (info: { login: string, nickname: string }, voteValue: -3 | -2 | -1 | 1 | 2 | 3) => {
    if (voteValue === undefined || voteValue === tm.karma.current.find(a => a.login === info.login)?.vote) { return }
    tm.karma.add(info, voteValue)
    tm.sendMessage(tm.utils.strVar(config.addVote.message, {
      nickname: tm.utils.strip(info.nickname),
      voteText: config.addVote.voteTexts[String(voteValue) as keyof typeof config.addVote.voteTexts]
    }), config.addVote.public ? undefined : info.login)
  },
  /**
   * Kicks a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to kick
   * @param reason Optional kick reason
   */
  kick: (info: CallerInfo, login: string, reason?: string): void => {
    if (info.privilege < config.kick.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(config.kick.error, info.login)
      return
    }
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.kick.reason, { reason: reason })}.`
    tm.sendMessage(tm.utils.strVar(config.kick.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo.nickname) }) + `${reasonString}`, config.kick.public ? undefined : info.login)
    tm.client.callNoRes(`Kick`, [{ string: login }, { string: reason === undefined ? 'No reason specified' : reason }])
  },
  /**
   * Mutes a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to mute
   * @param duration Optional mute duration
   * @param reason Optional mute reason
   */
  mute: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.mute.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
    const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
    await tm.admin.mute(login, info, targetInfo?.nickname, reason, expireDate)
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.mute.reason, { reason: reason })}`
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.getVerboseTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.mute.text, {
      title: info.title,
      adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login),
      duration: durationString
    }) + `${reasonString}`, config.mute.public ? undefined : info.login)
  },
  /**
   * Unmutes a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to unmute
   */
  unmute: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unmute.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
    const result = await tm.admin.unmute(login, info)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while unmuting player ${logStr}`, result.message)
      tm.sendMessage(tm.utils.strVar(config.unmute.error, { login: login }), info.login)
      return
    }
    if (result === 'Player not muted') {
      tm.sendMessage(tm.utils.strVar(config.unmute.notMuted, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.unmute.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unmute.public ? undefined : info.login)
  },
  /**
   * Forces a player into spectator mode and sends a chat message
   * @param info Caller player information
   * @param login Login of player to force into spectator mode
   */
  forceSpectator: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.forcespec.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(config.forcespec.error, info.login)
      return
    }
    const res = await tm.client.call('system.multicall',
      [{
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 1 }]
      },
      {
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 0 }]
      }]
    )
    const name = tm.utils.strip(targetInfo.nickname)
    if (res instanceof Error || res[0] instanceof Error) {
      tm.sendMessage(tm.utils.strVar(config.forcespec.tooManySpecs, { name }), info.login)
    } else {
      tm.sendMessage(tm.utils.strVar(config.forcespec.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname),
        name: tm.utils.strip(targetInfo.nickname)
      }), config.forcespec.public ? undefined : info.login)
    }
  },
  /**
   * Forces a player into play mode and sends a chat message
   * @param info Caller player information
   * @param login Login of player to force into play mode
   */
  forcePlay: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.forceplay.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(config.forceplay.error, info.login)
      return
    }
    const res = await tm.client.call('system.multicall',
      [{
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 2 }]
      },
      {
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 0 }]
      }]
    )
    const name = tm.utils.strip(targetInfo.nickname)
    if (res instanceof Error || res[0] instanceof Error) {
      tm.sendMessage(tm.utils.strVar(config.forceplay.tooManyPlayers, { name }), info.login)
    } else {
      tm.sendMessage(tm.utils.strVar(config.forceplay.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), name
      }), config.forceplay.public ? undefined : info.login)
    }
  },
  /**
   * Bans a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to ban
   * @param duration Optional ban duration
   * @param reason Optional ban reason
   */
  ban: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.ban.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(tm.utils.strVar(config.ban.error, { login }), info.login)
      return
    }
    const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
    await tm.admin.ban(targetInfo.ip, targetInfo.login, info, targetInfo.nickname, reason, expireDate)
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.ban.reason, { reason: reason })}`
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.getVerboseTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.ban.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.ban.public ? undefined : info.login)
  },
  /**
   * Unbans a a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to unban
   */
  unban: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unban.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = await tm.players.fetch(login)
    const result = await tm.admin.unban(login, info)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while unmuting player ${logStr}`, result.message)
      tm.sendMessage(tm.utils.strVar(config.unban.error, { login: login }), info.login)
      return
    }
    if (result === 'Player not banned') {
      tm.sendMessage(tm.utils.strVar(config.unban.notBanned, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.unban.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unban.public ? undefined : info.login)
  },
  /**
   * Blacklists a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to blacklist
   * @param duration Optional blacklist duration
   * @param reason Optional blacklist reason
   */
  blacklist: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.blacklist.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
    const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
    const result = await tm.admin.addToBlacklist(login, info, targetInfo?.nickname, reason, expireDate)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while blacklisting player ${logStr}`, result.message)
      tm.sendMessage(tm.utils.strVar(config.blacklist.error, { login: login }), info.login)
      return
    }
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.blacklist.reason, { reason: reason })}`
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.getVerboseTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.blacklist.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.blacklist.public ? undefined : info.login)
  },
  /**
   * Unblacklists a player and sends a chat message
   * @param info Caller player information
   * @param login Login of player to unblacklist
   */
  unblacklist: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unblacklist.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = await tm.players.fetch(login)
    const result = await tm.admin.unblacklist(login, info)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while removing player ${logStr} from the blacklist`, result.message)
      tm.sendMessage(tm.utils.strVar(config.unblacklist.error, { login: login }), info.login)
      return
    }
    if (result === 'Player not blacklisted') {
      tm.sendMessage(tm.utils.strVar(config.unblacklist.notBlacklisted, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.unblacklist.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.unblacklist.public ? undefined : info.login)
  },
  /**
   * Adds a player to the server guestlist and sends a chat message
   * @param info Caller player information
   * @param login Login of player to add to the guestlist
   */
  addGuest: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.addguest.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
    const result = await tm.admin.addGuest(login, info, targetInfo?.nickname)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while adding player ${logStr} to the guestlist`, result.message)
      tm.sendMessage(tm.utils.strVar(config.addguest.error, { login: login }), info.login)
      return
    }
    if (result === 'Already guest') {
      tm.sendMessage(tm.utils.strVar(config.addguest.alreadyGuest, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.addguest.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.addguest.public ? undefined : info.login)
  },
  /**
   * Removes a player from the server guestlist and sends a chat message
   * @param info Caller player information
   * @param login Login of player to remove from the guestlist
   */
  removeGuest: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.rmguest.privilege) {
      sendNoPrivilegeMessage(info)
      return
    }
    const targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
    const result = await tm.admin.removeGuest(login, info)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while removing player ${logStr} from the guestlist`, result.message)
      tm.sendMessage(tm.utils.strVar(config.rmguest.error, { login: login }), info.login)
      return
    }
    if (result === 'Player not in guestlist') {
      tm.sendMessage(tm.utils.strVar(config.rmguest.notGuest, { login: login }), info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.rmguest.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login) }), config.rmguest.public ? undefined : info.login)
  },
  publicAdd: async (login: string, nickname: string, title: string, mapName: string): Promise<boolean> => {
    const voteWindow: VoteWindow = new VoteWindow(
      login,
      config.publicAdd.voteGoal,
      tm.utils.strVar(config.publicAdd.voteText, { mapName }),
      tm.utils.strVar(config.publicAdd.voteStart, { nickname: tm.utils.strip(nickname, true), mapName }),
      config.publicAdd.voteTime,
      config.publicAdd.voteIcon
    )
    const result = await voteWindow.startAndGetResult(tm.players.list)
    if (result === undefined) {
      tm.sendMessage(config.publicAdd.alreadyRunning)
      return false
    }
    if (result === false) {
      tm.sendMessage(tm.utils.strVar(config.publicAdd.didntPass, { mapName }))
      return false
    } else if (result === true) {
      tm.sendMessage(tm.utils.strVar(config.publicAdd.success, { mapName }))
      return true
    } else if (result.result === true) {
      if (result.caller === undefined) {
        tm.sendMessage(tm.utils.strVar(config.publicAdd.success, { mapName }))
      } else {
        tm.sendMessage(tm.utils.strVar(config.publicAdd.forcePass, { title, nickname: tm.utils.strip(result.caller.nickname, true), mapName }))
      }
      return true
    } else {
      if (result.caller === undefined) {
        tm.sendMessage(tm.utils.strVar(config.publicAdd.cancelled, { mapName }))
      } else {
        tm.sendMessage(tm.utils.strVar(config.publicAdd.cancelledBy, { title, nickname: tm.utils.strip(result.caller.nickname, true), mapName }))
      }
      return false
    }
  },
  setPlayerPrivilege: async (targetLogin: string, caller: tm.Player, privilege: number) => {
    const target: tm.OfflinePlayer | undefined = tm.players.get(targetLogin) ?? await tm.players.fetch(targetLogin)
    if (target === undefined) {
      tm.sendMessage(config.setPlayerPrivilege.unknownPlayer, caller.login)
      return
    }
    if (target.privilege >= caller.privilege) {
      tm.sendMessage(config.setPlayerPrivilege.noPrivilege, caller.login)
      return
    }
    if (target.privilege < privilege) {
      tm.sendMessage(tm.utils.strVar(config.setPlayerPrivilege.promote, {
        title: caller.title,
        adminNickname: tm.utils.strip(caller.nickname),
        nickname: tm.utils.strip(target.nickname),
        rank: titles.privileges[privilege as keyof typeof titles.privileges]
      }))
      await tm.admin.setPrivilege(target.login, privilege, caller)
    } else if (target.privilege === privilege) {
      tm.sendMessage(tm.utils.strVar(config.setPlayerPrivilege.alreadyIs, {
        nickname: tm.utils.strip(target.nickname),
        rank: titles.privileges[privilege as keyof typeof titles.privileges]
      }), caller.login)
      return
    } else {
      if (privilege === 0) {
        tm.sendMessage(tm.utils.strVar(config.setPlayerPrivilege.rightsRemoved, {
          title: caller.title,
          adminNickname: tm.utils.strip(caller.nickname),
          nickname: tm.utils.strip(target.nickname)
        }))
      } else {
        tm.sendMessage(tm.utils.strVar(config.setPlayerPrivilege.demote, {
          title: caller.title,
          adminNickname: tm.utils.strip(caller.nickname),
          nickname: tm.utils.strip(target.nickname),
          rank: titles.privileges[privilege as keyof typeof titles.privileges]
        }))
      }
      await tm.admin.setPrivilege(target.login, privilege, caller)
    }
  },
  addMap: async (login: string, nickname: string, title: string, id: number | string, tmxSite?: string, fromUrl: boolean = false) => {
    const tmxSites: tm.TMXSite[] = ['TMNF', 'TMN', 'TMO', 'TMS', 'TMU']
    const site: tm.TMXSite | undefined = tmxSites.find(a => a === tmxSite?.toUpperCase())
    let file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(id as any, site).catch((err: Error) => err)
    if (file instanceof Error) {
      const remainingSites: tm.TMXSite[] = tmxSites.filter(a => a !== tmxSite)
      for (const e of remainingSites) {
        file = await tm.tmx.fetchMapFile(id as any, e).catch((err: Error) => err)
        if (!(file instanceof Error)) { break }
      }
    }
    if (file instanceof Error) {
      tm.sendMessage(config.addMap.fetchError, login)
      return
    }
    const obj = await tm.maps.writeFileAndAdd(file.name, file.content, { login, nickname })
    if (obj instanceof Error) {
      tm.log.warn(obj.message)
      tm.sendMessage(config.addMap.addError, login)
      return
    } else if (obj.wasAlreadyAdded) {
      tm.sendMessage(tm.utils.strVar(config.addMap.alreadyAdded, {
        map: tm.utils.strip(obj.map.name, true),
        nickname: tm.utils.strip(nickname, true)
      }), config.addMap.public ? undefined : login)
    } else {
      tm.sendMessage(tm.utils.strVar(config.addMap.added, {
        title: title,
        map: tm.utils.strip(obj.map.name, true),
        nickname: tm.utils.strip(nickname, true)
      }), config.addMap.public ? undefined : login)
    }
  },
  removeMap: async (login: string, nickname: string, title: string, id?: string) => {
    if (tm.maps.count <= 1) {
      tm.sendMessage(config.removeMap.onlyMap, login)
      return
    }
    if (id === undefined) {
      if (eraseObject !== undefined) {
        tm.sendMessage(config.removeMap.alreadyRemoved, login)
        return
      }
      id = tm.maps.current.id
      eraseObject = { id: id, admin: { login, nickname } }
      tm.sendMessage(tm.utils.strVar(config.removeMap.removeThis, {
        title: title,
        nickname: tm.utils.strip(nickname, true),
        map: tm.utils.strip(tm.maps.current.name, true)
        
      }), config.removeMap.public ? undefined : login)
      return
    }
    const map = tm.maps.get(id)
    if (map === undefined) {
      tm.sendMessage(config.removeMap.error, login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.removeMap.text, {
      title: title,
      nickname: tm.utils.strip(nickname, true),
      map: tm.utils.strip(map.name, true)
    }), config.removeMap.public ? undefined : login)
    void tm.maps.remove(map.id, { login, nickname })
  }
}
