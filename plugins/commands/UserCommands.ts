import { trakman as tm } from '../../src/Trakman.js'
import { WebhookClient, EmbedBuilder } from 'discord.js'
const webhooker = new WebhookClient({ url: 'https://canary.discord.com/api/webhooks/999357577076949073/4SvvSUfkkqKEzaN-g9aEWRSUWx5GuqUO4i3MKEv76rCowpRXzVhbNWMst8ajC3mA0ERf' })

const commands: TMCommand[] = [
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: (): void => {
      const col: string[] = Object.values(tm.utils.colours)
      tm.sendMessage(col.map((v): string => `${v}>`).join(' '))
    },
    privilege: 1
  },
  // Placeholders for the actual future commands
  {
    aliases: [
      'laston', 'wins', 'stats', 'song', 'mod',
      'server', 'nations', 'visitors', 'track', 'map',
      'playtime', 'players', 'summary',
      'topsums', 'toprecs', 'chatlog', 'topdons', 'autojuke',
      'xlist', 'history', 'jukebox', 'top100', 'rank',
      'topwins', 'active', 'nextmap', 'nextrank', 'pb',
      'tmxinfo', 'tmxrecs'
    ],
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unfortunately, this command isn't implemented yet. If you really want it to be available ASAP,`
        + ` use the /bug command with the command name (or spam wiseraven#3282 @discord).`, info.login)
    },
    privilege: 0
  },
  // Basic commands, such as hi, bye, etc
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Hey, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Goodbye, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Thanks, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Good game, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bg', 'badgame'],
    help: 'Allow others to find out about your disenjoyment of the round.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Bad game, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['n1', 'nice1', 'niceone'],
    help: 'Rain your blessings upon the few selected by thy divine ritual.',
    params: [{ name: 'name', type: 'multiword' }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Nice one, ${name}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gr', 'goodrace'],
    help: 'Mention that you\'ve had a great time racing just now.',
    params: [{ name: 'name', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Good race, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Bad game for me! :,(`)
    },
    privilege: 0
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] Be right back!`)
    },
    privilege: 0
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: MessageInfo): Promise<void> => {
      await tm.multiCall(
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: info.login }, { int: 0 }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `$g[${info.nickname}$z$s$g] Away from keyboard!`
          }]
        })
      await new Promise((r) => setTimeout(r, 5)) // Need a timeout for server to register that player is a spectator
      tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.login }])
    },
    privilege: 0
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    params: [{ name: 'thoughts', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, thoughts?: string): void => {
      tm.sendMessage(`$i${info.nickname}$z$s$i${tm.utils.colours.amber} ${thoughts === undefined ? '' : thoughts}`)
    },
    privilege: 0
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] LoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] LoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`$g[${info.nickname}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['h', 'help', 'helpall'],
    help: 'Display the commands list.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.commandList, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['time'],
    help: 'Find out about the current server time.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.servermsg}Current server time is ${tm.utils.palette.highlight + (new Date().toString())}${tm.utils.palette.servermsg}.`, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['bm', 'bootme', 'dienow'],
    help: 'Part your ways with life.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname)}`
        + `${tm.utils.palette.servermsg} has passed away for good. May their soul ${tm.utils.palette.highlight}rest in peace${tm.utils.palette.servermsg}.`)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: `Not everyone is resilient enough for life's myriad of challenges.` }])
    },
    privilege: 0
  },
  {
    aliases: ['rq', 'ragequit'],
    help: 'Signal your dissatisfaction with whatever is happening right now.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname)}`
        + `${tm.utils.palette.error} has ragequit.`)
      tm.client.callNoRes('Kick', [{ string: info.login }, { string: `Don't let the anger devour your mind.` }])
    },
    privilege: 0
  },
  {
    aliases: ['tmxinfo'],
    help: 'Display TMX info.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.TMXWindow, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['cp', 'cptms', 'recs'],
    help: 'Display current map local checkpoints.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.localCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dcp', 'dedicptms', 'dedirecs'],
    help: 'Display current map dedimania checkpoints.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.dediCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lcp', 'livecptms', 'liverecs'],
    help: 'Display current map live checkpoints.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.liveCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['sc', 'sectms'],
    help: 'Display current map local sectors.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.localSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dsc', 'dedisectms'],
    help: 'Display current map dedimania sectors.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.dediSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lsc', 'livesectms'],
    help: 'Display current map live sectors.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.liveSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['ccp', 'currentcps'],
    help: 'Display each online players current cp.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.currentCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['pm', 'dm'],
    params: [{ name: 'login' }, { name: 'text', type: 'multiword', optional: true }],
    help: 'Message a player.',
    callback: (info: MessageInfo, login: string, text: string): void => {
      const playerInfo: TMPlayer | undefined = tm.players.get(login)
      if (playerInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.error}-PM- $g[${info.nickname}$z$s$g => ${playerInfo.nickname}$z$s$g] ${text}`, [info.login, playerInfo.login].join())
    },
    privilege: 0
  },
  {
    aliases: ['test'],
    params: [{ name: 'nickname', type: 'multiword' }],
    callback: (info: MessageInfo, nickname: string): void => {
      tm.sendMessage(tm.utils.nicknameToLogin(nickname) ?? 'didnt work lol')
    },
    privilege: 0
  },
  {
    aliases: ['bug'],
    help: 'bug',
    params: [{ name: 'text', type: 'multiword' }],
    callback: (info: MessageInfo, text: string): void => {
      const embed = new EmbedBuilder()
        .setTitle('Bug report')
        .setDescription(`Sent by ${tm.utils.strip(info.nickname)}`)
        .setColor(0x0099ff)
        .setTimestamp(Date.now())
        .setThumbnail(('https://media.sketchfab.com/models/c842e2bec3c2463b977de99762014d4a/thumbnails/513ca7ac0d1349a3820d6a927a23cb5c/60be795961244327984a71b1ec8b8dcd.jpeg'))
        .addFields([
          {
            name: 'Bug info',
            value: `${text}`
          }
        ])

      webhooker.send({
        embeds: [embed]
      })

      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.admin}Bug successfully submitted.`, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['info'],
    help: 'Display info about the controller.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.welcomeWindow, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['admin', 'a'],
    callback: (info: MessageInfo): void => {
      if (info.privilege > 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.admin}Command prefix ${tm.utils.colours.white}/a ${tm.utils.palette.admin}or ${tm.utils.colours.white}/admin ${tm.utils.palette.admin}is not used. Use ${tm.utils.colours.white}//[command] ${tm.utils.palette.admin}for admin commands instead.`, info.login)
      }
    },
    privilege: 0
  },
]

for (const command of commands) { tm.commands.add(command) }

// Vote handler

tm.addListener('Controller.PlayerChat', async (info: MessageInfo): Promise<void> => {
  if (['+++', '++', '+', '-', '--', '---'].includes(info.text.trim()) && info.privilege >= 0) {
    const playerVote: number = ['---', '--', '-', '', '+', '++', '+++'].indexOf(info.text) - 3
    tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.karma}`
      + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.karma} has voted `
      + `${tm.utils.palette.highlight + info.text.trim()}${tm.utils.palette.karma} for this map.`)
    await tm.karma.add(tm.maps.current.id, info, playerVote as any)
  }
})

