import config from '../config/GameCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: config.setgamemode.aliases,
    help: config.setgamemode.help,
    params: [{
      name: 'mode', validValues: ['round', 'ta', 'team', 'lap', 'stunt', 'cup',
        'rounds', 'timeattack', 'teams', 'laps', 'stunts']
    }],
    callback: (info: tm.MessageInfo, mode: string): void => {
      let modeInt = 1
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
      }
      tm.sendMessage(tm.utils.strVar(config.setgamemode.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), mode: mode.toUpperCase()
      }),
        config.setgamemode.public ? undefined : info.login)
      tm.client.callNoRes(`SetGameMode`, [{ int: modeInt }])
    },
    privilege: config.setgamemode.privilege
  },
  {
    aliases: config.settimelimit.aliases,
    help: config.settimelimit.help,
    params: [{ name: 'time', type: 'time' }],
    callback: (info: tm.MessageInfo, time: number): void => {
      tm.sendMessage(tm.utils.strVar(config.settimelimit.text,
        {
          title: info.title, adminName: tm.utils.strip(info.nickname),
          time: tm.utils.getVerboseTime(time)
        }),
        config.settimelimit.public ? undefined : info.login)
      tm.timer.setTimeLimit(time)
      //tm.client.callNoRes(`SetTimeAttackLimit`, [{ int: time }])
    },
    privilege: config.settimelimit.privilege
  },
  {
    aliases: config.setchattime.aliases,
    help: config.setchattime.help,
    params: [{ name: 'time', type: 'time' }],
    callback: (info: tm.MessageInfo, time: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setchattime.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), time: tm.utils.getVerboseTime(time)
      }), config.setchattime.public ? undefined : info.login)
      tm.client.callNoRes(`SetChatTime`, [{ int: time }])
    },
    privilege: config.setchattime.privilege
  },
  {
    aliases: config.setwarmup.aliases,
    help: config.setwarmup.help,
    params: [{ name: 'enabled', type: 'boolean' }],
    callback: (info: tm.MessageInfo, enabled: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.setwarmup.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), state: enabled ? 'enabled' : 'disabled'
      }),
        config.setwarmup.public ? undefined : info.login)
      tm.client.callNoRes(`SetWarmUp`, [{ boolean: enabled }])
    },
    privilege: config.setwarmup.privilege
  },
  {
    aliases: config.setlapsamount.aliases,
    help: config.setlapsamount.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount <= 0) {
        tm.sendMessage(config.setlapsamount.insufficientLaps, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setlapsamount.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setlapsamount.public ? undefined : info.login)
      tm.client.callNoRes(`SetNbLaps`, [{ int: amount }])
    },
    privilege: config.setlapsamount.privilege
  },
  {
    aliases: config.setroundslapsamount.aliases,
    help: config.setroundslapsamount.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount < 0) {
        tm.sendMessage(config.setroundslapsamount.insufficientLaps, info.login)
        return
      }
      if (amount === 0) {
        tm.sendMessage(tm.utils.strVar(config.setroundslapsamount.resetText, {
          title: info.title,
          adminName: tm.utils.strip(info.nickname), amount: amount
        }), config.setroundslapsamount.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(config.setroundslapsamount.text, {
          title: info.title,
          adminName: tm.utils.strip(info.nickname), amount: amount
        }), config.setroundslapsamount.public ? undefined : info.login)
      }
      tm.client.callNoRes(`SetRoundForcedLaps`, [{ int: amount }])
    },
    privilege: config.setroundslapsamount.privilege
  },
  {
    aliases: config.setroundspointlimit.aliases,
    help: config.setroundspointlimit.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount <= 0) {
        tm.sendMessage(config.setroundspointlimit.insufficientPoints, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setroundspointlimit.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setroundspointlimit.public ? undefined : info.login)
      tm.client.callNoRes(`SetRoundPointsLimit`, [{ int: amount }])
    },
    privilege: config.setroundspointlimit.privilege
  },
  {
    aliases: config.setteamspointlimit.aliases,
    help: config.setteamspointlimit.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount < 0) {
        tm.sendMessage(config.setteamspointlimit.insufficientPoints, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setteamspointlimit.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setteamspointlimit.public ? undefined : info.login)
      tm.client.callNoRes(`SetTeamPointsLimit`, [{ int: amount }])
    },
    privilege: config.setteamspointlimit.privilege
  },
  {
    aliases: config.setteamsmaxpoints.aliases,
    help: config.setteamsmaxpoints.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount < 0) {
        tm.sendMessage(config.setteamsmaxpoints.insufficientPoints, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setteamsmaxpoints.text,
        { title: info.title, adminName: tm.utils.strip(info.nickname), amount: amount }),
        config.setteamsmaxpoints.public ? undefined : info.login)
      tm.client.callNoRes(`SetTeamMaxPoints`, [{ int: amount }])
    },
    privilege: config.setteamsmaxpoints.privilege
  },
  {
    aliases: config.setcuppointlimit.aliases,
    help: config.setcuppointlimit.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount <= 0) {
        tm.sendMessage(config.setcuppointlimit.insufficientPoints, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcuppointlimit.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setcuppointlimit.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupPointsLimit`, [{ int: amount }])
    },
    privilege: config.setcuppointlimit.privilege
  },
  {
    aliases: config.setcuproundspermap.aliases,
    help: config.setcuproundspermap.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount < 0) {
        tm.sendMessage(config.setcuproundspermap.insufficientRounds, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcuproundspermap.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }), config.setcuproundspermap.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupRoundsPerChallenge`, [{ int: amount }])
    },
    privilege: config.setcuproundspermap.privilege
  },
  {
    aliases: config.setcupwarmuprounds.aliases,
    help: config.setcupwarmuprounds.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount < 0) {
        tm.sendMessage(config.setcupwarmuprounds.insufficientRounds, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcupwarmuprounds.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }), config.setcupwarmuprounds.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupWarmUpDuration`, [{ int: amount }])
    },
    privilege: config.setcupwarmuprounds.privilege
  },
  {
    aliases: config.setcupwinnersamount.aliases,
    help: config.setcupwinnersamount.help,
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (amount <= 0) {
        tm.sendMessage(config.setcupwinnersamount.insufficientWinners, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcupwinnersamount.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setcupwinnersamount.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupNbWinners`, [{ int: amount }])
    },
    privilege: config.setcupwinnersamount.privilege
  },
  {
    aliases: config.forceshowopp.aliases,
    help: config.forceshowopp.help,
    params: [{ name: 'status', type: 'boolean' }, { name: 'amount', type: 'int', optional: true }],
    callback: (info: tm.MessageInfo, status: boolean, amount?: number): void => {
      let n: number
      if (!status) { n = 0 } else if (amount !== undefined) { n = amount } else { n = 1 }
      tm.sendMessage(tm.utils.strVar(config.forceshowopp.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'enabled' : 'disabled' }), config.forceshowopp.public ? undefined : info.login)
      tm.client.callNoRes(`SetForceShowAllOpponents`, [{ int: n }])
    },
    privilege: config.forceshowopp.privilege
  },
  {
    aliases: config.disablerespawn.aliases,
    help: config.disablerespawn.help,
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.disablerespawn.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'disabled' : 'enabled' }), config.disablerespawn.public ? undefined : info.login)
      tm.client.callNoRes(`SetDisableRespawn`, [{ boolean: status }])
    },
    privilege: config.disablerespawn.privilege
  }
]

tm.commands.add(...commands)