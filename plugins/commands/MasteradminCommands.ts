import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ssn', 'setservername'],
    help: 'Change the server name.',
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: MessageInfo, name: string): void => {
      if (name.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No name specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the server name to ${TM.palette.highlight + name}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetServerName',
          params: [{ string: name }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sc', 'setcomment'],
    help: 'Change the server comment.',
    params: [{ name: 'comment', type: 'multiword' }],
    callback: (info: MessageInfo, comment: string): void => {
      if (comment.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No comment specified.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the server comment to ${TM.palette.highlight + comment}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetServerComment',
          params: [{ string: comment }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sp', 'setpwd', 'setpassword'],
    help: 'Change the player password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the player password to ${TM.palette.highlight + (password !== undefined ? password : 'none (disabled)')}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetServerPassword',
          params: [{ string: password === undefined ? '' : password }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['ssp', 'setspecpwd', 'setspecpassword'],
    help: 'Change the spectator password.',
    params: [{ name: 'password', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, password?: string): void => {
      const regex: RegExp = /[\p{ASCII}]+/u // Passwords outside of ASCII range cannot be entered in the field
      if (password !== undefined && !regex.test(password)) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Invalid password (ASCII mismatch).`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the spectator password to ${TM.palette.highlight + (password !== undefined ? password : 'none (disabled)')}$z$s${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetServerPasswordForSpectator',
          params: [{ string: password === undefined ? '' : password }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['smp', 'setmaxplayers'],
    help: 'Change the max players amount.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the max players amount to ${TM.palette.highlight + amount}${TM.palette.admin}.`
        }],
      },
        {
          method: 'SetMaxPlayers',
          params: [{ int: amount }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sms', 'setmaxspecs'],
    help: 'Change the max spectators amount.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: MessageInfo, amount: number): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the max spectators amount to ${TM.palette.highlight + amount}${TM.palette.admin}.`
        }],
      },
        {
          method: 'SetMaxSpectators',
          params: [{ int: amount }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sct', 'setchattime'],
    help: 'Change the time you spend on the podium screen.',
    params: [{ name: 'time', type: 'time' }],
    callback: (info: MessageInfo, time: number): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the podium time to ${TM.palette.highlight + Math.round(time / 1000)}${TM.palette.admin} seconds.`
        }],
      },
        {
          method: 'SetChatTime',
          params: [{ int: time }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['stl', 'settimelimit'],
    help: 'Change the time you spend gaming.',
    params: [{ name: 'time', type: 'time' }],
    callback: (info: MessageInfo, time: number): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the time limit to ${TM.palette.highlight + Math.round(time / 1000)}${TM.palette.admin} seconds.`
        }],
      },
        {
          method: 'SetTimeAttackLimit',
          params: [{ int: time }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['sn', 'sendnotice'],
    help: 'Send a notice.',
    params: [{ name: 'time', type: 'time' }, /*{name: 'loginAvatar', optional: true},*/ { name: 'notice', type: 'multiword' }],
    callback: (info: MessageInfo, time: number, notice: string): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has set `
            + `the notice to ${TM.palette.highlight + TM.strip(notice, true)}${TM.palette.admin}.`
        }],
      },
        {
          method: 'SendNotice',
          params: [{ string: notice }, { string: '' }, { int: time }]
        })
    },
    privilege: 3
  },
  {
    aliases: ['amdl', 'allowmapdownload'],
    help: 'Set whether map download is enabled.',
    params: [{ name: 'allowed', type: 'boolean' }],
    callback: (info: MessageInfo, allowed: boolean): void => {
      TM.multiCall({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (allowed ? 'allowed' : 'disallowed')}${TM.palette.admin} the map download.`
        }]
      },
        {
          method: 'AllowChallengeDownload',
          params: [{
            boolean: allowed
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['drp', 'disablerespawn'],
    help: 'Set whether checkpoint respawning is enabled.',
    params: [{ name: 'disabled', type: 'boolean' }],
    callback: (info: MessageInfo, disabled: boolean): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (disabled ? 'disabled' : 'enabled')}${TM.palette.admin} checkpoint respawning.`
        }]
      },
        {
          method: 'SetDisableRespawn',
          params: [{
            boolean: disabled
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['fso', 'forceshowopp', 'forceshowopponents'],
    help: 'Set whether forced opponent display is enabled.',
    params: [{ name: 'enabled', type: 'boolean' }, { name: 'amount', type: 'int', optional: true }],
    callback: (info: MessageInfo, enabled: boolean, amount?: number): void => {
      let n: number
      if (!enabled) {
        n = 0
      } else if (amount !== undefined) {
        n = amount
      } else {
        n = 1
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (enabled ? 'enabled' : 'disabled')}${TM.palette.admin} forced opponent display.`
        }]
      },
        {
          method: 'SetForceShowAllOpponents',
          params: [{
            // 0 = No change, 1 = Show all, n = Show n
            int: n
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['ccs', 'coppers', 'checkcoppers'],
    help: 'Check the amount of coppers the server owns.',
    callback: async (info: MessageInfo): Promise<void> => {
      // TODO: Return immediately if the server isn't united. How to check tho..?
      const coppers: any[] | Error = await TM.call('GetServerCoppers')
      if (coppers instanceof Error) {
        TM.error(`Couldn't retrieve the coppers amount.`, coppers.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Couldn't retrieve the coppers amount.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.admin}Current server coppers amount${TM.palette.highlight}: ${coppers[0]}${TM.palette.admin}.`, info.login)
    },
    privilege: 3
  },
  {
    aliases: ['shs', 'sethideserver'],
    help: 'Set whether the server is hidden.',
    params: [{ name: 'value', type: 'int' }],
    callback: (info: MessageInfo, value: number): void => {
      if (![0, 1, 2].includes(value)) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Possible values are ${TM.palette.highlight}0, 1 & 2${TM.palette.error}.`, info.login)
        return
      }
      let status: string
      switch (value) {
        case 1:
          status = 'hidden'
          break
        case 2:
          status = 'hidden for TMNF players'
          break
        default:
          status = 'visible'
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `updated server visibility to${TM.palette.highlight + ':' + status}${TM.palette.admin}.`
        }]
      },
        {
          method: 'SetHideServer',
          params: [{
            // 0 = Visible, 1 = Hidden, 2 = Hidden for TMNF players
            int: value
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['asr', 'autosavereplays'],
    help: 'Set whether replays should be autosaved by the server.',
    params: [{ name: 'enabled', type: 'boolean' }],
    callback: (info: MessageInfo, enabled: boolean): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (enabled ? 'enabled' : 'disabled')}${TM.palette.admin} server replay autosaving.`
        }]
      },
        {
          method: 'AutoSaveReplays',
          params: [{
            boolean: enabled
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['asvr', 'autosavevalreplays'],
    help: 'Set whether validation replays should be autosaved by the server.',
    params: [{ name: 'enabled', type: 'boolean' }],
    callback: (info: MessageInfo, enabled: boolean): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has `
            + `${TM.palette.highlight + (enabled ? 'enabled' : 'disabled')}${TM.palette.admin} server validation replay autosaving.`
        }]
      },
        {
          method: 'AutoSaveValidationReplays',
          params: [{
            boolean: enabled
          }],
        })
    },
    privilege: 3
  },
  {
    aliases: ['kc', 'killcontroller'],
    help: 'Kill the controller.',
    callback: (info: MessageInfo): never => {
      TM.callNoRes('ChatSendServerMessage', [{
        string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
          + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has killed the controller :,(`
      }])
      process.exit(0)
    },
    privilege: 3
  },
  {
    aliases: ['sd', 'shutdown'],
    help: 'Stop the server.',
    callback: async (info: MessageInfo): Promise<void> => {
      await TM.call('ChatSendServerMessage', [{
        string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
          + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has killed the server :,(`
      }])
      TM.call('StopServer')
    },
    privilege: 3
  }
]

for (const command of commands) { TM.addCommand(command) }
