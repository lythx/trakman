
import config from '../config/RaceCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.skip.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.skip.public ? undefined : info.login)
      tm.client.callNoRes(`NextChallenge`)
    },
    privilege: config.skip.privilege
  },
  {
    aliases: ['r', 'res', 'restart'],
    help: 'Restart the current map.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.res.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.res.public ? undefined : info.login)
      tm.client.callNoRes(`RestartChallenge`)
    },
    privilege: config.res.privilege
  },
  {
    aliases: ['pt', 'prev', 'previous'],
    help: 'Requeue the previously played map.',
    callback: async (info: tm.MessageInfo): Promise<void> => {
      if (tm.jukebox.history[0] === undefined) {
        tm.sendMessage(config.prev.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.prev.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.prev.public ? undefined : info.login)
      await tm.jukebox.add(tm.jukebox.history[0].id, info)
      tm.client.callNoRes(`NextChallenge`)
    },
    privilege: config.prev.privilege
  },
  {
    aliases: ['rq', 'requeue', 'replay'],
    help: 'Requeue the ongoing map.',
    callback: (info: tm.MessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.replay.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.replay.public ? undefined : info.login)
      tm.jukebox.add(tm.maps.current.id, info)
    },
    privilege: config.replay.privilege
  },
  {
    aliases: ['er', 'endround'],
    help: 'End the ongoing round in rounds-based gamemodes.',
    callback: (info: tm.MessageInfo): void => {
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.endround.error, info.login)
        return
      }
      tm.client.callNoRes('ForceEndRound')
      tm.sendMessage(tm.utils.strVar(config.endround.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.endround.public ? undefined : info.login)
    },
    privilege: config.endround.privilege
  },
  {
    aliases: ['fpt', 'forceteam', 'forceplayerteam'],
    help: 'Force a player into the specified team.',
    params: [{ name: 'player' }, { name: 'team', validValues: ['blue', 'red'] }],
    callback: async (info: tm.MessageInfo, player: string, team: string): Promise<void> => {
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.forceteam.notRounds, info.login)
        return
      }
      const playerInfo: tm.Player | undefined = tm.players.get(player)
      if (playerInfo === undefined) {
        tm.sendMessage(config.forceteam.playerOffline, info.login)
        return
      }
      let teamInt = 0
      let teamColour = ''
      switch (team.toLowerCase()) {
        case 'blue':
          teamInt = 0
          teamColour = `${tm.utils.colours.blue}`
          break
        case 'red':
          teamInt = 1
          teamColour = `${tm.utils.colours.red}`
      }
      tm.sendMessage(tm.utils.strVar(config.forceteam.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname), name: tm.utils.strip(playerInfo.nickname),
        team: (teamColour + team.toUpperCase())
      }), config.forceteam.public ? undefined : info.login)
      tm.client.callNoRes(`ForcePlayerTeam`, [{ string: player }, { int: teamInt }])
    },
    privilege: config.forceteam.privilege
  }
]

tm.commands.add(...commands)