import config from '../config/RaceCommands.config.js'

const commands: tm.Command[] = [
  {
    aliases: config.skip.aliases,
    help: config.skip.help,
    callback: (info: tm.MessageInfo): void => {
      if (tm.getState() === 'result') { return }
      tm.sendMessage(tm.utils.strVar(config.skip.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.skip.public ? undefined : info.login)
      tm.client.callNoRes(`NextChallenge`, tm.getGameMode() === 'Cup' ? [{ boolean: true }] : undefined)
    },
    privilege: config.skip.privilege
  },
  {
    aliases: config.res.aliases,
    help: config.res.help,
    callback: (info: tm.MessageInfo): void => {
      if (tm.getState() === 'result') { return }
      tm.sendMessage(tm.utils.strVar(config.res.text, {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }), config.res.public ? undefined : info.login)
      tm.client.callNoRes(`RestartChallenge`, tm.getGameMode() === 'Cup' ? [{ boolean: true }] : undefined)
    },
    privilege: config.res.privilege
  },
  {
    aliases: config.prev.aliases,
    help: config.prev.help,
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
    },
    privilege: config.prev.privilege
  },
  {
    aliases: config.replay.aliases,
    help: config.replay.help,
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
    aliases: config.endround.aliases,
    help: config.endround.help,
    callback: (info: tm.MessageInfo): void => {
      if (tm.config.game.gameMode === 1 || tm.config.game.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.endround.error, info.login)
        return
      }
      tm.client.callNoRes('ForceEndRound')
      tm.sendMessage(tm.utils.strVar(config.endround.text, { title: info.title, adminName: tm.utils.strip(info.nickname) }), config.endround.public ? undefined : info.login)
    },
    privilege: config.endround.privilege
  },
  {
    aliases: config.forceteam.aliases,
    help: config.forceteam.help,
    params: [{ name: 'player' }, { name: 'team', validValues: ['blue', 'red'] }],
    callback: async (info: tm.MessageInfo, player: string, team: string): Promise<void> => {
      if (tm.config.game.gameMode === 1 || tm.config.game.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(config.forceteam.notRounds, info.login)
        return
      }
      const playerInfo: tm.Player | undefined = tm.players.get(player)
      if (playerInfo === undefined) {
        tm.sendMessage(config.forceteam.playerOffline, info.login)
        return
      }
      let teamInt: number = 0
      let teamColour: string = ''
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