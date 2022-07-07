import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: (): void => {
      const col: string[] = Object.values(TM.colours)
      TM.sendMessage(col.map((v): string => `${v}>`).join(' '))
    },
    privilege: 0
  },
  // Basic commands, such as hi, bye, etc
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Hey, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Goodbye, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Thanks, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Good game, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Bad game for me! :,(`)
    },
    privilege: 0
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Be right back!`)
    },
    privilege: 0
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: MessageInfo): Promise<void> => {
      await TM.multiCall(
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
            string: `$g[${info.nickName}$z$s$g] Away from keyboard!`
          }]
        })
      await new Promise((r) => setTimeout(r, 5)) // Need a timeout for server to register that player is a spectator
      TM.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.login }])
    },
    privilege: 0
  },
  {
    aliases: ['me', 'mfw'],
    help: 'Express the deep emotions hidden within your sinful soul.',
    params: [{ name: 'thoughts', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, thoughts?: string): void => {
      TM.sendMessage(`$i${info.nickName}$z$s$i${TM.colours.amber} ${thoughts === undefined ? '' : thoughts}`)
    },
    privilege: 0
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['h', 'help', 'helpall'],
    help: 'Display current map dedimania checkpoints.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.commandList, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['tmxinfo'],
    help: 'Display TMX info.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.TMXWindow, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['cp', 'cptms', 'recs'],
    help: 'Display current map local checkpoints.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.localCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dcp', 'dedicptms', 'dedirecs'],
    help: 'Display current map dedimania checkpoints.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.dediCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lcp', 'livecptms', 'liverecs'],
    help: 'Display current map live checkpoints.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.liveCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['sc', 'sectms'],
    help: 'Display current map local sectors.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.localSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dsc', 'dedisectms'],
    help: 'Display current map dedimania sectors.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.dediSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lsc', 'livesectms'],
    help: 'Display current map live sectors.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.liveSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['ccp', 'currentcps'],
    help: 'Display each online players current cp.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.currentCps, info.login)
    },
    privilege: 0
  },
  {
    // TODO IMPLEMENT MAP SEARCH
    aliases: ['l', 'ml', 'list'],
    help: 'Display list of maps.',
    params: [{ name: 'query', optional: true }],
    callback: (info: MessageInfo, query: string): void => {
      TM.openManialink(TM.UIIDS.mapList, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['pm', 'dm'],
    params: [{ name: 'login' }, { name: 'text', type: 'multiword', optional: true }],
    help: 'Message a player.',
    callback: (info: MessageInfo, login: string, text: string): void => {
      const playerInfo: TMPlayer | undefined = TM.getPlayer(login)
      if (playerInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.error}-PM- $g[${info.nickName}$z$s$g => ${playerInfo.nickName}$z$s$g] ${text}`, [info.login, playerInfo.login].join())
    },
    privilege: 0
  }
]

for (const command of commands) { TM.addCommand(command) }

// Vote handler

TM.addListener('Controller.PlayerChat', (info: MessageInfo): void => {
  if (['+++', '++', '+', '-', '--', '---'].includes(info.text.trim()) && info.privilege >= 0) {
    const playerVote: number = ['---', '--', '-', '', '+', '++', '+++'].indexOf(info.text) - 3
    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.karma}`
      + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.karma} has voted `
      + `${TM.palette.highlight + info.text.trim()}${TM.palette.karma} for this map.`)
    void TM.addVote(TM.map.id, info.login, playerVote)
    TM.addMKVote(TM.map.id, info.login, playerVote, new Date())
  }
})

