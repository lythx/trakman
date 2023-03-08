import config from './Config.js'

interface CallerInfo { login: string, nickname: string, title: string, privilege: number }

const sendNoPrivilegeMessage = (): void =>
  tm.sendMessage(config.noPermission)

export const adminActions = {
  kick: (info: CallerInfo, login: string, reason?: string): void => {
    if (info.privilege < config.kick.privilege) {
      sendNoPrivilegeMessage()
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
  mute: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.mute.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    let targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      targetInfo = await tm.players.fetch(login)
    }
    const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
    await tm.admin.mute(login, info, targetInfo?.nickname, reason, expireDate)
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.mute.reason, { reason: reason })}`
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.mute.text, {
      title: info.title,
      adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login),
      duration: durationString
    }) + `${reasonString}`, config.mute.public ? undefined : info.login)
  },
  unmute: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unmute.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    let targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      targetInfo = await tm.players.fetch(login)
    }
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
  forceSpectator: (info: CallerInfo, login: string): void => {
    if (info.privilege < config.forcespec.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(config.forcespec.error, info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.forcespec.text, {
      title: info.title,
      adminName: tm.utils.strip(info.nickname),
      name: tm.utils.strip(targetInfo.nickname)
    }), config.forcespec.public ? undefined : info.login)
    tm.client.callNoRes('system.multicall',
      [{
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 1 }]
      },
      {
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 0 }]
      }]
    )
  },
  forcePlay: (info: CallerInfo, login: string): void => {
    if (info.privilege < config.forceplay.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    const targetInfo: tm.Player | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      tm.sendMessage(config.forceplay.error, info.login)
      return
    }
    tm.sendMessage(tm.utils.strVar(config.forceplay.text, {
      title: info.title,
      adminName: tm.utils.strip(info.nickname),
      name: tm.utils.strip(targetInfo.nickname)
    }), config.forceplay.public ? undefined : info.login)
    tm.client.callNoRes('system.multicall',
      [{
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 2 }]
      },
      {
        method: 'ForceSpectator',
        params: [{ string: login }, { int: 0 }]
      }]
    )
  },
  ban: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.ban.privilege) {
      sendNoPrivilegeMessage()
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
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.ban.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.ban.public ? undefined : info.login)
  },
  unban: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unban.privilege) {
      sendNoPrivilegeMessage()
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
  blacklist: async (info: CallerInfo, login: string, duration?: number, reason?: string): Promise<void> => {
    if (info.privilege < config.blacklist.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    let targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      targetInfo = await tm.players.fetch(login)
    }
    const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
    const result = await tm.admin.addToBlacklist(login, info, targetInfo?.nickname, reason, expireDate)
    let logStr: string = targetInfo === undefined ? `(${login})` : `${tm.utils.strip(targetInfo.nickname)} (${targetInfo.login})`
    if (result instanceof Error) {
      tm.log.error(`Error while blacklisting player ${logStr}`, result.message)
      tm.sendMessage(tm.utils.strVar(config.blacklist.error, { login: login }), info.login)
      return
    }
    const reasonString: string = reason === undefined ? '' : ` ${tm.utils.strVar(config.blacklist.reason, { reason: reason })}`
    const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
    tm.sendMessage(tm.utils.strVar(config.blacklist.text, { title: info.title, adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(targetInfo?.nickname ?? login), duration: durationString }) + `${reasonString}`, config.blacklist.public ? undefined : info.login)
  },
  unblacklist: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.unblacklist.privilege) {
      sendNoPrivilegeMessage()
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
  addGuest: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.addguest.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    let targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      targetInfo = await tm.players.fetch(login)
    }
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
  removeGuest: async (info: CallerInfo, login: string): Promise<void> => {
    if (info.privilege < config.rmguest.privilege) {
      sendNoPrivilegeMessage()
      return
    }
    let targetInfo: tm.OfflinePlayer | undefined = tm.players.get(login)
    if (targetInfo === undefined) {
      targetInfo = await tm.players.fetch(login)
    }
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
}
