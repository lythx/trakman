import { TRAKMAN as TM } from '../src/Trakman.js'

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
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Hey, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['bb', 'bye'],
    help: 'Bid your farewell.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Goodbye, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['ty', 'tx', 'thx', 'thanks'], // Can add like every single one of them idk
    help: 'Express your gratitude.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Thanks, ${info.text || 'everyone'}!`)
    },
    privilege: 0
  },
  {
    aliases: ['gg', 'goodgame'],
    help: 'Inform others that you\'ve enjoyed the race.',
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$g[${info.nickName}$z$s$g] Good game, ${info.text || 'everyone'}!`)
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
      await TM.multiCall({
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
    callback: (info: MessageInfo) => {
      TM.sendMessage(`$i${info.nickName}$z$s$i${TM.colours.amber} ${info.text}`)
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
      TM.sendMessage(`$g[${info.nickName}$z$s$g] LoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoOoL!`)
    },
    privilege: 0
  },
  {
    aliases: ['l', 'list'],
    help: 'Display list of maps.',
    callback: (info: MessageInfo) => {
      TM.openManialink(10000, info.login)
    },
    privilege: 0
  },
  //REMOVE THIS LATER
  {
    aliases: ['recs'],
    help: 'asdasd',
    callback: (info: MessageInfo) => {
      const localRecs: LocalRecord[] = TM.localRecords
      let str = `${TM.palette.server}» ${TM.palette.message}Local records on `
        + `${TM.palette.highlight + TM.strip(TM.challenge.name, true)}${TM.palette.highlight}: `
      for (const lr of localRecs) {
        str += `${TM.strip(lr.nickName, false)}$z$s ${TM.palette.highlight + '- ' + TM.Utils.getTimeString(lr.score)}, `
      }
      TM.sendMessage(str.slice(0, -2), info.login)
    },
    privilege: 0
  },
  {
    aliases: ['queue'],
    help: 'asfaf',
    callback: (info: MessageInfo) => {
      TM.addToQueue(info.text)
    },
    privilege: 0
  }
]

for (const command of commands) { TM.addCommand(command) }
