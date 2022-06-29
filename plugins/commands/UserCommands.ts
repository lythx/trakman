import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  // TODO: help consistency, tidy up
  // Testing commands, remove those later into development
  {
    aliases: ['ct', 'colourtest'],
    help: 'Display all the colours in order [TO BE REMOVED].',
    callback: () => {
      const col = Object.values(TM.colours)
      TM.sendMessage(col.map((v) => `${v}>`).join(' '))
    },
    privilege: 0
  },
  // Basic commands, such as hi, bye, etc
  {
    aliases: ['hi', 'hey', 'hello'],
    help: 'Greet a certain someone.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Hey, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Goodbye, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Thanks, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    params: [{ name: 'name', optional: true }],
    callback: (info: MessageInfo, name: string) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Good game, ${name || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bgm'],
    help: 'Let others know you didn\'t do your best.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Bad game for me! :,(`)
    },
    privilege: 0
  },
  {
    aliases: ['brb'],
    help: 'Notify people of your potential absence.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Be right back!`)
    },
    privilege: 0
  },
  {
    aliases: ['afk', 'imstupid'],
    help: 'Update the server players on your position relative to the keyboard.',
    callback: async (info: MessageInfo) => {
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
    callback: (info: MessageInfo, thoughts?: string) => {
      TM.sendMessage(`$i${info.nickName}$z$s$i${TM.colours.amber} ${thoughts === undefined ? '' : thoughts}`)
    },
    privilege: 0
  },
  {
    aliases: ['lol'],
    help: 'Indicate your amusement.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['lool'],
    help: 'Indicate your excess amusement.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['loool'],
    help: 'I understand, saying "sussy petya" for the 53726th time must be hilarious enough.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['h', 'help', 'helpall'],
    help: 'Display current map dedimania checkpoints.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.CommandList, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['tmxinfo'],
    help: 'Display TMX info.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.TMXWindow, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['cp', 'cptms', 'recs'],
    help: 'Display current map local checkpoints.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.LocalCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dcp', 'dedicptms', 'dedirecs'],
    help: 'Display current map dedimania checkpoints.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.DediCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lcp', 'livecptms', 'liverecs'],
    help: 'Display current map live checkpoints.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.LiveCps, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['sc', 'sectms'],
    help: 'Display current map local sectors.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.LocalSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['dsc', 'dedisectms'],
    help: 'Display current map dedimania sectors.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.DediSectors, info.login)
    },
    privilege: 0
  },
  {
    aliases: ['lsc', 'livesectms'],
    help: 'Display current map live sectors.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.LiveSectors, info.login)
    },
    privilege: 0
  },
  {
    // TODO IMPLEMENT MAP SEARCH
    aliases: ['l', 'list'],
    help: 'Display list of maps.',
    callback: (info: MessageInfo) => {
      TM.openManialink(TM.UIIDS.JukeboxWindow, info.login)
    },
    privilege: 0
  },
  //DELETE LATER
  {
    aliases: ['qwe'],
    params: [{ name: 'nickName' }],
    callback: (info: MessageInfo, nickName: string) => {
      TM.sendMessage(`${nickName} to ${TM.nicknameToLogin(nickName)}`)
    },
    privilege: 0
  }
]

for (const command of commands) { TM.addCommand(command) }

// votes

TM.addListener('Controller.PlayerChat', (info: MessageInfo) => {
  if (['+++', '++', '+', '-', '--', '---'].includes(info.text.trim()) && info.privilege >= 0) {
    TM.sendMessage(`${TM.palette.server}»» ${TM.palette.karma}`
      + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.karma} has voted `
      + `${TM.palette.highlight + info.text.trim()}${TM.palette.karma} for this map.`)
    void TM.addVote(TM.challenge.id, info.login, ['---', '--', '-', '', '+', '++', '+++'].indexOf(info.text) - 3)
  }
})

