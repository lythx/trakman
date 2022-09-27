
import config from '../config/ServerCommands.config.js'

const commands: TM.Command[] = [
  {
    aliases: ['srp', 'setrefpwd', 'setrefereepassword'],
    help: 'Set the referee password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: TM.MessageInfo, password?: string): void => {
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
    aliases: ['srm', 'setrefmode', 'setrefereemode'],
    help: 'Set the referee mode.',
    params: [{ name: 'mode', type: 'boolean' }],
    callback: (info: TM.MessageInfo, mode: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.setrefmode.text, { title: info.title, adminName: tm.utils.strip(info.nickname), mode: mode ? 'ALL' : 'TOP3' }), config.setrefmode.public ? undefined : info.login)
      tm.client.call(`SetRefereeMode`, [{ int: mode ? 1 : 0 }])
    },
    privilege: config.setrefmode.privilege
  },
  {
    aliases: ['pay'],
    help: 'Pay coppers from server account.',
    params: [{ name: 'amount', type: 'int' }, { name: 'login', optional: true }, { name: 'message', optional: true }],
    callback: async (info: TM.MessageInfo, amount: number, login?: string, message?: string): Promise<void> => {
      const status = await tm.utils.payCoppers(login ?? info.login, amount,
        message ?? tm.utils.strVar(config.pay.defaultMessage, { coppers: amount, server: tm.state.serverConfig.name }))
      if (status instanceof Error) {
        tm.sendMessage(tm.utils.strVar(config.pay.error, { login: login ?? info.login }), info.login)
      } else {
        if (login === undefined) {
          tm.sendMessage(tm.utils.strVar(config.pay.selfText, {
            coppers: amount,
          }), info.login)
        } else {
          let player: TM.Player | TM.OfflinePlayer | undefined = tm.players.get(login)
          if (player === undefined) {
            player = await tm.players.fetch(login)
          }
          tm.sendMessage(tm.utils.strVar(config.pay.text, {
            title: info.title,
            adminName: info.nickname,
            coppers: amount,
            target: player?.nickname ?? login
          }), config.pay.public === true ? undefined : info.login)
        }
      }
    },
    privilege: config.pay.privilege
  },
  {
    aliases: ['ssn', 'setservername'],
    help: 'Set the server name.',
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: TM.MessageInfo, name: string): void => {
      tm.sendMessage(tm.utils.strVar(config.setservername.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: name.length === 0 ? `the server login` : name }), config.setservername.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerName`, [{ string: name }])
    },
    privilege: config.setservername.privilege
  },
  {
    aliases: ['sc', 'setcomment'],
    help: 'Set the server comment.',
    params: [{ name: 'comment', type: 'multiword' }],
    callback: (info: TM.MessageInfo, comment: string): void => {
      tm.sendMessage(tm.utils.strVar(config.setcomment.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: comment.length === 0 ? `absolutely nothing` : comment }), config.setcomment.public ? undefined : info.login)
      tm.client.callNoRes(`SetServerComment`, [{ string: comment }])
    },
    privilege: config.setcomment.privilege
  },
  {
    aliases: ['sp', 'setpwd', 'setpassword'],
    help: 'Set the player password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: TM.MessageInfo, password?: string): void => {
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
    aliases: ['ssp', 'setspecpwd', 'setspecpassword'],
    help: 'Set the spectator password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: TM.MessageInfo, password?: string): void => {
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
    aliases: ['smp', 'setmaxplayers'],
    help: 'Set the max players amount.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: TM.MessageInfo, amount: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setmaxplayers.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxplayers.public ? undefined : info.login)
      tm.client.callNoRes(`SetMaxPlayers`, [{ int: amount }])
    },
    privilege: config.setmaxplayers.privilege
  },
  {
    aliases: ['sms', 'setmaxspecs'],
    help: 'Set the max spectators amount.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: TM.MessageInfo, amount: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setmaxspecs.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: amount }), config.setmaxspecs.public ? undefined : info.login)
      tm.client.callNoRes(`SetMaxSpectators`, [{ int: amount }])
    },
    privilege: config.setmaxspecs.privilege
  },
  {
    aliases: ['stl', 'settimelimit'],
    help: 'Set the time you spend gaming.',
    params: [{ name: 'time', type: 'int' }],
    callback: (info: TM.MessageInfo, time: number): void => {
      tm.sendMessage(tm.utils.strVar(config.settimelimit.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: time }), config.settimelimit.public ? undefined : info.login)
      tm.client.callNoRes(`SetTimeAttackLimit`, [{ int: time }])
    },
    privilege: config.settimelimit.privilege
  },
  {
    aliases: ['sn', 'sendnotice'],
    help: 'Send a notice. If the last word in notice is a login players avatar will be displayed.',
    params: [{ name: 'time', type: 'time' }, { name: 'notice', type: 'multiword' }],
    callback: (info: TM.MessageInfo, time: number, notice: string): void => {
      const s = notice.split(' ').filter(a => a !== '')
      const player = tm.players.get(s[s.length - 1])
      let loginAvatar = ''
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
    aliases: ['amdl', 'allowmapdownload'],
    help: 'Set whether map download is enabled.',
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: TM.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.allowmapdownload.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'allowed' : 'disallowed' }), config.allowmapdownload.public ? undefined : info.login)
      tm.client.callNoRes(`AllowChallengeDownload`, [{ boolean: status }])
    },
    privilege: config.allowmapdownload.privilege
  },
  {
    aliases: ['shs', 'sethideserver'],
    help: 'Set whether the server is hidden.',
    params: [{ name: 'value', validValues: ['hidden', 'visible', 'notmnf'] }],
    callback: (info: TM.MessageInfo, value: string): void => {
      let status = ''
      let hideInt = 0
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
    aliases: ['asr', 'autosavereplays'],
    help: 'Set whether replays should be autosaved by the server.',
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: TM.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.autosavereplays.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavereplays.public ? undefined : info.login)
      tm.client.callNoRes(`AutoSaveReplays`, [{ boolean: status }])
    },
    privilege: config.autosavereplays.privilege
  },
  {
    aliases: ['asvr', 'autosavevalreplays'],
    help: 'Set whether validation replays should be autosaved by the server.',
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: TM.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.autosavevalreplays.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.autosavevalreplays.public ? undefined : info.login)
      tm.client.callNoRes(`AutoSaveValidationReplays`, [{ boolean: status }])
    },
    privilege: config.autosavevalreplays.privilege
  },
  {
    aliases: ['kc', 'killcontroller'],
    help: 'Kill the server controller.',
    callback: (info: TM.MessageInfo): never => {
      tm.sendMessage(tm.utils.strVar(config.killcontroller.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.killcontroller.public ? undefined : info.login)
      process.exit(0)
    },
    privilege: config.killcontroller.privilege
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the dedicated server.',
    callback: (info: TM.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.shutdown.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.shutdown.public ? undefined : info.login)
      tm.client.callNoRes(`StopServer`)
    },
    privilege: config.shutdown.privilege
  },
]

tm.commands.add(...commands)