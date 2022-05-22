'use strict'
import colours from '../src/data/Colours.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../src/Trakman.js'
import fs from 'node:fs/promises'
import { ErrorHandler } from '../src/ErrorHandler.js'
import { ChatService } from '../src/services/ChatService.js'

const commands: TMCommand[] = [
  {
    aliases: ['al', 'addlocal'],
    help: 'Add a challenge from your pc.',
    callback: async (info: MessageInfo) => {
      const split = info.text.split(' ')
      const fileName = split.shift() + '.Challenge.Gbx'
      const path = split.join(' ')
      let file
      try {
        file = (await fs.readFile(path, 'base64'))
      } catch (err: any) {
        ErrorHandler.error('Error when reading file on addlocal', err.message)
        TM.sendMessage(`File ${path} doesn't exist`).then()
        return
      }
      try {
        await TM.call('WriteFile', [{ string: fileName }, { base64: file }])
      } catch (err: any) {
        ErrorHandler.error('Failed to write file', err.message)
        TM.sendMessage('Failed to write file').then()
        return
      }
      try {
        await TM.call('InsertChallenge', [{ string: fileName }])
      } catch (err: any) {
        ErrorHandler.error('Failed to insert challenge to jukebox', err.message)
        TM.sendMessage('Failed to insert challenge to jukebox').then()
        return
      }
      let res
      try {
        res = await TM.call('GetNextChallengeInfo')
      } catch (err: any) {
        ErrorHandler.error('Failed to get next challenge info', err.message)
        TM.sendMessage('Failed to get next challenge info').then()
        return
      }
      const name = res?.[0]?.Name
      if (name == null) {
        ErrorHandler.error('Next challenge name is undefined. Cancelling transaction.')
        TM.multiCall(false,
          {method: 'ChatSendServerMessage', params: [{string: 'Next challenge name is undefined. Cancelling transaction.' }]},
          {method: 'RemoveChallenge', params: [{ string: fileName }]}).then()
        return
      }
      try {
        await TM.addChallenge(res[0].UId, name, res[0].Author, res[0].Environnement)
      } catch (err: any) {
        ErrorHandler.error('Error adding challenge to database. Cancelling transaction.')
        TM.multiCall(false,
          {method: 'ChatSendServerMessage', params: [{string: 'Error adding challenge to database. Cancelling transaction.' }]},
          {method: 'RemoveChallenge', params: [{ string: fileName }]}).then()
        return
      }
      TM.sendMessage(`Player ${info.nickName} added and jukeboxed map ${name}`).then()
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has skipped the ongoing track.` }] }, { method: 'NextChallenge' })
    },
    privilege: 1
  },
  {
    aliases: ['r', 'res'],
    help: 'Restart the current map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has restarted the ongoing track.` }] }, { method: 'RestartChallenge' })
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    callback: async (info: MessageInfo) => {
      if (TM.getPlayer(info.text) === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has kicked ${info.text}.` }] }, { method: 'Kick', params: [{ string: `${info.text}` }, { string: 'asdsasdasd' }] })
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has muted ${targetInfo.nickName}.` }] }, { method: 'Ignore', params: [{ string: `${info.text}` }] })
    },
    privilege: 1
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    callback: async (info: MessageInfo) => {
      if (TM.getPlayer(info.text) === undefined) { return }
      await TM.multiCall(false, { method: 'ChatSendServerMessage', params: [{ string: `${info.nickName}$z$s${colours.yellow} has unmuted ${info.text}.` }] }, { method: 'UnIgnore', params: [{ string: `${info.text}` }] })
    },
    privilege: 1
  }
]

for (const command of commands) { ChatService.addCommand(command).then() }
