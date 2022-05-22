'use strict'
import colours from '../src/data/Colours.json' assert {type: 'json'}
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
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has changed the gamemode to ${info.text}.` }] }, { method: 'SetGameMode', params: [{ int: mode }] })
    },
    privilege: 2
  }
]

for (const command of commands) { ChatService.addCommand(command) }
