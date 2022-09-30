
import config from '../config/GameCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
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
    aliases: ['sct', 'setchattime'],
    help: 'Set the time you spend on the podium screen.',
    params: [{ name: 'time', type: 'int' }],
    callback: (info: tm.MessageInfo, time: number): void => {
      tm.sendMessage(tm.utils.strVar(config.setchattime.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), value: time
      }), config.setchattime.public ? undefined : info.login)
      tm.client.callNoRes(`SetChatTime`, [{ int: time }])
    },
    privilege: config.setchattime.privilege
  },
  {
    aliases: ['swu', 'setwarmup'],
    help: 'Set whether the server is in warmup mode.',
    params: [{ name: 'enabled', type: 'boolean' }],
    callback: (info: tm.MessageInfo, enabled: boolean): void => {
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.setwarmup.error, info.login)
        return
      }
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
    aliases: ['sla', 'setlapsamount'],
    help: 'Set the laps amount in laps mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 3) {
        tm.sendMessage(config.setlapsamount.error, info.login)
        return
      }
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
    aliases: ['srla', 'setroundslapsamount'],
    help: 'Set the laps amount in rounds mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 0) {
        tm.sendMessage(config.setroundslapsamount.error, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(config.setroundslapsamount.insufficientLaps, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setroundslapsamount.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setroundslapsamount.public ? undefined : info.login)
      tm.client.callNoRes(`SetRoundForcedLaps`, [{ int: amount }])
    },
    privilege: config.setroundslapsamount.privilege
  },
  {
    aliases: ['srpl', 'setroundspointlimit'],
    help: 'Set the points limit for rounds mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 0) {
        tm.sendMessage(config.setroundspointlimit.error, info.login)
        return
      }
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
    aliases: ['stpl', 'setteamspointlimit'],
    help: 'Set the points limit for teams mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 2) {
        tm.sendMessage(config.setteamspointlimit.error, info.login)
        return
      }
      if (amount <= 0) {
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
    aliases: ['stmp', 'setteamsmaxpoints'],
    help: 'Set the max obtainable points per round for teams mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 2) {
        tm.sendMessage(config.setteamsmaxpoints.error, info.login)
        return
      }
      if (amount <= 0) {
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
    aliases: ['scpl', 'setcuppointlimit'],
    help: 'Set the points limit for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(config.setcuppointlimit.error, info.login)
        return
      }
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
    aliases: ['scrpm', 'setcuproundspermap'],
    help: 'Set the amount of rounds per map for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(config.setcuproundspermap.error, info.login)
        return
      }
      if (amount <= 0) {
        tm.sendMessage(config.setcuproundspermap.insufficientRounds, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcuproundspermap.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setcuproundspermap.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupRoundsPerChallenge`, [{ int: amount }])
    },
    privilege: config.setcuproundspermap.privilege
  },
  {
    aliases: ['scwt', 'setcupwarmuptime'],
    help: 'Set the amount of rounds in warmup for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(config.setcupwarmuptime.error, info.login)
        return
      }
      if (amount < 0) {
        tm.sendMessage(config.setcupwarmuptime.insufficientRounds, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.setcupwarmuptime.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), amount: amount
      }),
        config.setcupwarmuptime.public ? undefined : info.login)
      tm.client.callNoRes(`SetCupWarmUpDuration`, [{ int: amount }])
    },
    privilege: config.setcupwarmuptime.privilege
  },
  {
    aliases: ['scwa', 'setcupwinnersamount'],
    help: 'Set the amount of winners for cup mode.',
    params: [{ name: 'amount', type: 'int' }],
    callback: (info: tm.MessageInfo, amount: number): void => {
      if (tm.state.gameConfig.gameMode !== 5) {
        tm.sendMessage(config.setcupwinnersamount.error, info.login)
        return
      }
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
    aliases: ['fso', 'forceshowopp', 'forceshowopponents'],
    help: 'Set whether forced opponent display is enabled.',
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
    aliases: ['drp', 'disablerespawn'],
    help: 'Set whether checkpoint respawning is enabled.',
    params: [{ name: 'status', type: 'boolean' }],
    callback: (info: tm.MessageInfo, status: boolean): void => {
      tm.sendMessage(tm.utils.strVar(config.disablerespawn.text, { title: info.title, adminName: tm.utils.strip(info.nickname), value: status ? 'disabled' : 'enabled' }), config.disablerespawn.public ? undefined : info.login)
      tm.client.callNoRes(`SetDisableRespawn`, [{ boolean: status }])
    },
    privilege: config.disablerespawn.privilege
  }
]

tm.commands.add(...commands)