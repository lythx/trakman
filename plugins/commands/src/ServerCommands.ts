import config from '../config/ServerCommands.config.js'

const pauseTimer = (info: tm.Player) => {
  if (tm.getState() !== 'race') {
    tm.sendMessage(config.timelimit.notRaceMode, info.login)
    return
  }
  if (!tm.timer.isDynamic) {
    tm.sendMessage(config.timelimit.notDynamic, info.login)
    return
  }
  tm.timer.pause()
  tm.sendMessage(tm.utils.strVar(config.pauseTimer.text, {
    title: info.title,
    adminName: tm.utils.strip(info.nickname)
  }))
}

const resumeTimer = (info: tm.Player) => {
  if (tm.getState() !== 'race') {
    tm.sendMessage(config.timelimit.notRaceMode, info.login)
    return
  }
  if (!tm.timer.isDynamic) {
    tm.sendMessage(config.timelimit.notDynamic, info.login)
    return
  }
  tm.timer.resume()
  tm.sendMessage(tm.utils.strVar(config.resumeTimer.text, {
    title: info.title,
    adminName: tm.utils.strip(info.nickname)
  }))
}

const commands: tm.Command[] = [
  {
    aliases: config.timelimit.aliases,
    help: config.timelimit.help,
    params: [{ name: 'action' }],
    callback: (info, actionStr: string): void => {
      if (tm.getState() !== 'race') {
        tm.sendMessage(config.timelimit.notRaceMode, info.login)
        return
      }
      if (!tm.timer.isDynamic) {
        tm.sendMessage(config.timelimit.notDynamic, info.login)
        return
      }
      if (actionStr === 'pause' || actionStr === 'stop') {
        pauseTimer(info)
        return
      }
      if (actionStr === 'resume' || actionStr === 'unpause' || actionStr === 'start') {
        resumeTimer(info)
        return
      }
      let action: 'set' | 'add' | 'subtract'
      let time: number | Error
      if (actionStr.startsWith('+')) {
        action = 'add'
        time = tm.utils.parseTimeString(actionStr.slice(1))
      } else if (actionStr.startsWith('-')) {
        action = 'subtract'
        time = tm.utils.parseTimeString(actionStr.slice(1))
      } else {
        action = 'set'
        time = tm.utils.parseTimeString(actionStr)
      }
      if (time instanceof Error) {
        tm.sendMessage(config.timelimit.invalidParam, info.login)
        return
      }
      let wasSet = true
      if (action === 'set') {
        wasSet = tm.timer.setTime(time)
      } else if (action === 'add') {
        tm.timer.addTime(time) // can always add time
      } else if (action === 'subtract') {
        wasSet = tm.timer.subtractTime(time)
      }
      if (wasSet) {
        tm.sendMessage(tm.utils.strVar(config.timelimit.set, {
          title: info.title,
          adminName: tm.utils.strip(info.nickname),
          time: tm.utils.getVerboseTime(tm.timer.remainingRaceTime)
        }))
      } else {
        tm.sendMessage(config.timelimit.tooLow, info.login)
      }
    },
    privilege: config.timelimit.privilege
  },
  {
    aliases: config.pauseTimer.aliases,
    help: config.pauseTimer.help,
    callback: (info): void => pauseTimer(info),
    privilege: config.pauseTimer.privilege
  },
  {
    aliases: config.resumeTimer.aliases,
    help: config.resumeTimer.help,
    callback: (info): void => resumeTimer(info),
    privilege: config.resumeTimer.privilege
  },
  {
    aliases: config.enabledynamictimer.aliases,
    help: config.enabledynamictimer.help,
    callback: (info): void => {
      if (tm.timer.isDynamicOnNextRound) {
        tm.sendMessage(config.enabledynamictimer.alreadyEnabled, info.login)
        return
      }
      tm.timer.enableDynamic()
      tm.sendMessage(tm.utils.strVar(config.enabledynamictimer.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }))
    },
    privilege: config.enabledynamictimer.privilege
  },
  {
    aliases: config.disabledynamictimer.aliases,
    help: config.disabledynamictimer.help,
    callback: (info): void => {
      if (!tm.timer.isDynamicOnNextRound) {
        tm.sendMessage(config.disabledynamictimer.alreadyDisabled, info.login)
        return
      }
      tm.timer.disableDynamic()
      tm.sendMessage(tm.utils.strVar(config.disabledynamictimer.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }))
    },
    privilege: config.disabledynamictimer.privilege
  },
  {
    aliases: config.setrefpwd.aliases,
    help: config.setrefpwd.help,
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        tm.sendMessage(config.setrefpwd.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setrefpwd.text, { title: info.title, adminName: tm.utils.strip(info.nickname), password: password !== undefined ? password : 'none (disabled)' }), config.setrefpwd.public ? undefined : info.login)
      tm.client.callNoRes(`SetRefereePassword`, [{ string: password === undefined ? '' : password }])
    },
    privilege: config.setrefpwd.privilege
  },
  {
    aliases: config.setrefmode.aliases,
    help: config.setrefmode.help,
    params: [{ name: 'mode', type: 'boolean' }],
    callback: (info: tm.MessageInfo, mode: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.setrefmode.text, { title: info.title, adminName: tm.utils.strip(info.nickname), mode: mode ? 'ALL' : 'TOP3' }), config.setrefmode.public ? undefined : info.login)
      tm.client.call(`SetRefereeMode`, [{ int: mode ? 1 : 0 }])
    },
    privilege: config.setrefmode.privilege
  },
  {
    aliases: config.pay.aliases,
    help: config.pay.help,
    params: [{ name: 'amount', type: 'int' }, { name: 'login', optional: true }, { name: 'message', optional: true }],
    callback: async (info: tm.MessageInfo, amount: number, login?: string, message?: string): Promise<void> => {
      const status = await tm.utils.payCoppers(login ?? info.login, amount,
        message ?? tm.utils.strVar(config.pay.defaultMessage, { coppers: amount, server: tm.config.server.name }))
      if (status instanceof Error) {
        tm.sendMessage(tm.utils.strVar(config.pay.error, { login: login ?? info.login }), info.login)
      } else {
        if (login === undefined) {
          tm.sendMessage(tm.utils.strVar(config.pay.selfText, {
            coppers: amount,
          }), info.login)
        } else {
          const player: tm.OfflinePlayer | undefined = tm.players.get(login) ?? await tm.players.fetch(login)
          tm.sendMessage(tm.utils.strVar(config.pay.text, {
            title: info.title,
            adminName: tm.utils.strip(info.nickname, true),
            coppers: amount,
            target: tm.utils.strip(player?.nickname ?? login, true)
          }), config.pay.public ? undefined : info.login)
        }
      }
    },
    privilege: config.pay.privilege
  },
  {
    aliases: config.setservername.aliases,
    help: config.setservername.help,
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: tm.MessageInfo, name: string): void => {
      tm.sendMessage(tm.utils.strVar(config.setservername.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: name.length === 0 ? `the server login` : name }), config.setservername.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerName`, [{ string: name }])
    },
    privilege: config.setservername.privilege
  },
  {
    aliases: config.setcomment.aliases,
    help: config.setcomment.help,
    params: [{ name: 'comment', type: 'multiword' }],
    callback: (info: tm.MessageInfo, comment: string): void => {
      tm.sendMessage(tm.utils.strVar(config.setcomment.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: comment.length === 0 ? `absolutely nothing` : comment }), config.setcomment.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerComment`, [{ string: comment }])
    },
    privilege: config.setcomment.privilege
  },
  {
    aliases: config.setpassword.aliases,
    help: config.setpassword.help,
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        tm.sendMessage(config.setpassword.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setpassword.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: password !== undefined ? password : 'none (disabled)' }), config.setpassword.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerPassword`, [{ string: password === undefined ? '' : password }])
    },
    privilege: config.setpassword.privilege
  },
  {
    aliases: config.setspecpassword.aliases,
    help: config.setspecpassword.help,
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: tm.MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        tm.sendMessage(config.setspecpassword.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setspecpassword.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: password !== undefined ? password : 'none (disabled)' }), config.setspecpassword.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerPasswordForSpectator`, [{ string: password === undefined ? '' : password }])
    },
    privilege: config.setspecpassword.privilege
  },
  {
    aliases: config.setmaxplayers.aliases,
    help: config.setmaxplayers.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setmaxplayers.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxplayers.public ? undefined : info.login)
      tm.client.callNoRes(`SetMaxPlayers`, [{ int: amount }])
    },
    privilege: config.setmaxplayers.privilege
  },
  {
    aliases: config.setmaxspecs.aliases,
    help: config.setmaxspecs.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setmaxspecs.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxspecs.public ? undefined : info.login)
      tm.client.callNoRes(`SetMaxSpectators`, [{ int: amount }])
    },
    privilege: config.setmaxspecs.privilege
  },
  {
    aliases: config.sendnotice.aliases,
    help: config.sendnotice.help,
    params: [{ name: 'time', type: 'time' }, { name: 'notice', type: 'multiword' }],
    callback: (info: tm.MessageInfo, time: number, notice: string): void => {
      const s: string[] = notice.split(' ').filter(a => a !== '')
      const player = tm.players.get(s[s.length - 1])
      let loginAvatar: string = ''
      if (player !== undefined) {
        notice = s.slice(0, -1).join(' ')
        loginAvatar = player.login
      }
      tm.sendMessage(tm.utils.strVar(config.sendnotice.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), value: notice
      }), config.sendnotice.public ? undefined : info.login)
      tm.client.callNoRes(`SendNotice`, [{ string: notice }, { string: loginAvatar }, { int: time }])
    },
    privilege: config.sendnotice.privilege
  },
  {
    aliases: config.allowmapdownload.aliases,
    help: config.allowmapdownload.help,
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.allowmapdownload.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'allowed' : 'disallowed' }), config.allowmapdownload.public ? undefined : info.login)
      tm.client.callNoRes(`AllowChallengeDownload`, [{ boolean: status }])
    },
    privilege: config.allowmapdownload.privilege
  },
  {
    aliases: config.sethideserver.aliases,
    help: config.sethideserver.help,
    params: [{ name: 'value', validValues: ['hidden', 'visible', 'notmnf'] }],
    callback: (info: tm.MessageInfo, value: string): void => {
      let status: string = ''
      let hideInt: number = 0
      switch (value) {
        case 'visible':
          status = config.sethideserver.status.visible
          hideInt = 0
          break
        case 'hidden':
          status = config.sethideserver.status.hidden
          hideInt = 1
          break
        case 'notmnf':
          status = config.sethideserver.status.noTmnf
          hideInt = 2
      }
      tm.sendMessage(tm.utils.strVar(config.sethideserver.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), status: status
      }), config.sethideserver.public ? undefined : info.login)
      tm.client.callNoRes(`SetHideServer`, [{ int: hideInt }])
    },
    privilege: config.sethideserver.privilege
  },
  {
    aliases: config.autosavereplays.aliases,
    help: config.autosavereplays.help,
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.autosavereplays.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavereplays.public ? undefined : info.login)
      tm.client.callNoRes(`AutoSaveReplays`, [{ boolean: status }])
    },
    privilege: config.autosavereplays.privilege
  },
  {
    aliases: config.autosavevalreplays.aliases,
    help: config.autosavevalreplays.help,
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.autosavevalreplays.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavevalreplays.public ? undefined : info.login)
      tm.client.callNoRes(`AutoSaveValidationReplays`, [{ boolean: status }])
    },
    privilege: config.autosavevalreplays.privilege
  },
  {
    aliases: config.killcontroller.aliases,
    help: config.killcontroller.help,
    callback: (info: tm.MessageInfo): never => {
      tm.sendMessage(tm.utils.strVar(config.killcontroller.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.killcontroller.public ? undefined : info.login)
      process.exit(0)
    },
    privilege: config.killcontroller.privilege
  },
  {
    aliases: config.setbuddynotif.aliases,
    help: config.setbuddynotif.help,
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.setbuddynotif.text, { title: info.title, adminName: tm.utils.strip(info.nickname), status: status ? 'enabled' : 'disabled' }), config.setbuddynotif.public ? undefined : info.login)
      tm.client.callNoRes(`SetBuddyNotification`, [{ string: '' }, { boolean: status }])
    },
    privilege: config.setbuddynotif.privilege
  },
  {
    aliases: config.shutdown.aliases,
    help: config.shutdown.help,
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.shutdown.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.shutdown.public ? undefined : info.login)
      tm.client.callNoRes(`StopServer`)
    },
    privilege: config.shutdown.privilege
  },
  {
    aliases: config.call.aliases,
    help: config.call.help,
    params: [{ name: 'method' }, { name: 'params', type: 'multiword', optional: true }],
    callback: async (info: tm.MessageInfo, method: string, params?: string): Promise<void> => {
      if (params === undefined) { params = '' }
      const paramsArr = params.split(' ').map(a => a.trim()).filter(a => a !== '')
      let quot: [number, number] | undefined
      for (let i = 0; i < paramsArr.length; i++) {
        for (let j = 0; j < paramsArr[i].length; j++) {
          if (paramsArr[i][j] === '"' && paramsArr[i][j - 1] !== "\\") {
            if (quot === undefined) {
              quot = [i, j]
            } else {
              const str = paramsArr.slice(quot[0], i + 1).join('')
              const endIndex = str.length + j + 1 - paramsArr[i].length
              const sliced = str.slice(quot[1], endIndex)
              paramsArr.splice(quot[0], (i + 1) - quot[0], sliced)
              quot = undefined
              break
            }
          }
        }
      }
      const parsedParams: tm.CallParams[] = []
      for (const e of paramsArr) {
        if (e[0] === '"' && e[e.length - 1] === '"') {
          parsedParams.push({ string: e.slice(1, -1) })
          continue
        }
        try {
          const parsed = JSON.parse(e)
          if (Number.isInteger(parsed)) {
            parsedParams.push({ int: parsed })
          } else if (typeof parsed === 'number') {
            parsedParams.push({ double: parsed })
          } else if (typeof parsed === 'boolean') {
            parsedParams.push({ boolean: parsed })
          } else if (Array.isArray(parsed)) {
            parsedParams.push({ array: parsed })
          } else if (typeof parsed === 'object') {
            parsedParams.push({ struct: parsed })
          }
        } catch (err: any) {
          tm.sendMessage(`${tm.utils.palette.error}Parse error: ${err.message}`, info.login)
          return
        }
      }
      const response = await tm.client.call(method, parsedParams)
      if (response instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.error}Error: ${response.message}`, info.login)
      } else {
        tm.sendMessage(JSON.stringify(response), info.login)
      }
    },
    privilege: config.call.privilege
  }
]

tm.commands.add(...commands)