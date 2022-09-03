import { trakman as tm } from '../../../src/Trakman.js'
import config from '../config/RaceCommands.config.js'

const commands: TMCommand[] = [
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: (info: TMMessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.skip.text, {
        title: tm.utils.getTitle(info),
        adminName: tm.utils.strip(info.nickname)
      }), config.skip.public ? undefined : info.login)
      tm.client.callNoRes(`NextChallenge`)
    },
    privilege: config.skip.privilege
  },
  {
    aliases: ['r', 'res', 'restart'],
    help: 'Restart the current map.',
    callback: (info: TMMessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.res.text, {
        title: tm.utils.getTitle(info),
        adminName: tm.utils.strip(info.nickname)
      }), config.res.public ? undefined : info.login)
      tm.client.callNoRes(`RestartChallenge`)
    },
    privilege: config.res.privilege
  },
  {
    aliases: ['pt', 'prev', 'previous'],
    help: 'Requeue the previously played map.',
    callback: async (info: TMMessageInfo): Promise<void> => {
      if (tm.jukebox.history[0] === undefined) {
        tm.sendMessage(config.prev.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.prev.text, {
        title: tm.utils.getTitle(info),
        adminName: tm.utils.strip(info.nickname)
      }), config.prev.public ? undefined : info.login)
      tm.jukebox.add(tm.jukebox.history[0].id, info)
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first // TODO test if needed
      tm.client.callNoRes(`NextChallenge`)
    },
    privilege: config.prev.privilege
  },
  {
    aliases: ['rq', 'requeue', 'replay'],
    help: 'Requeue the ongoing map.',
    callback: (info: TMMessageInfo): void => {
      tm.sendMessage(tm.utils.strVar(config.replay.text, {
        title: tm.utils.getTitle(info),
        adminName: tm.utils.strip(info.nickname)
      }), config.replay.public ? undefined : info.login)
      tm.jukebox.add(tm.maps.current.id, info)
    },
    privilege: config.replay.privilege
  },
  {
    aliases: ['er', 'endround'],
    help: 'End the ongoing round in rounds-based gamemodes.',
    callback: (info: TMMessageInfo): void => {
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.endround.error, info.login)
        return
      }
      tm.sendMessage(tm.utils.strVar(config.endround.text, { title: tm.utils.getTitle(info), adminName: tm.utils.strip(info.nickname) }), config.endround.public ? undefined : info.login)
    },
    privilege: config.endround.privilege
  },
  {
    aliases: ['fpt', 'forceteam', 'forceplayerteam'],
    help: 'Force a player into the specified team.',
    params: [{ name: 'player' }, { name: 'team' }],
    callback: async (info: TMMessageInfo, player: string, team: string): Promise<void> => {
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
  }
]

tm.commands.add(...commands)