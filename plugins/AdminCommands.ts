'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'
import { ChatService } from '../src/services/ChatService.js'

const commands: TMCommand[] = [
  {
    aliases: ['sgm', 'setgamemode'],
    help: 'Change the gamemode.',
    callback: async (info: MessageInfo) => {
      let mode: number
      switch (info.text.toLowerCase()) {
        case 'rounds':
        case 'round':
          mode = 0
          break
        case 'timeattack':
        case 'ta':
          mode = 1
          break
        case 'teams':
        case 'team':
          mode = 2
          break
        case 'laps':
        case 'lap':
          mode = 3
          break
        case 'stunts':
        case 'stunt':
          mode = 4
          break
        case 'cup':
          mode = 5
          break
        default:
          return
      }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has set `
              + `the gamemode to ${TM.colours.white + info.text.toUpperCase()}${TM.colours.folly}.`
          }]
        },
        {
          method: 'SetGameMode',
          params: [{ int: mode }]
        })
    },
    privilege: 2
  }
]

for (const command of commands) { ChatService.addCommand(command) }
