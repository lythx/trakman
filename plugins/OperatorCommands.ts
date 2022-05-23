'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'
import fs from 'node:fs/promises'
import fetch from 'node-fetch'
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
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}File ${TM.colours.white + path} is not accessible.`)
        return
      }
      try {
        await TM.call('WriteFile', [{ string: fileName }, { base64: file }])
      } catch (err: any) {
        ErrorHandler.error('Failed to write file', err.toString())
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to write the file to the server.`)
        return
      }
      try {
        await TM.call('InsertChallenge', [{ string: fileName }])
      } catch (err: any) {
        ErrorHandler.error('Failed to insert challenge to jukebox', err.toString())
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to insert the challenge into queue.`)
        return
      }
      let res
      try {
        res = await TM.call('GetNextChallengeInfo')
      } catch (err: any) {
        ErrorHandler.error('Failed to get next challenge info', err.toString())
        TM.sendMessage(`${TM.colours.yellow}» ${TM.colours.red}Failed to obtain the next challenge info.`)
        return
      }
      const name = res?.[0]?.Name
      TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
        + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has added and queued `
        + `${TM.colours.white + TM.stripModifiers(name || 'TODO: FIX THIS', true)}${TM.colours.folly} from local files.`)
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has skipped the ongoing track.`
          }]
        },
        {
          method: 'NextChallenge'
        })
    },
    privilege: 1
  },
  {
    aliases: ['r', 'res'],
    help: 'Restart the current map.',
    callback: async (info: MessageInfo) => {
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has restarted the ongoing track.`
          }]
        },
        {
          method: 'RestartChallenge'
        })
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has kicked `
              + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
        {
          method: 'Kick',
          params: [{ string: info.text }, { string: 'asdsasdasd' }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has unmuted `
              + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
        {
          method: 'Ignore',
          params: [{ string: info.text }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    callback: async (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) { return }
      await TM.multiCall(false,
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
              + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has unmuted `
              + `${TM.colours.white + TM.stripModifiers(targetInfo.nickName)}${TM.colours.folly}.`
          }]
        },
        {
          method: 'UnIgnore',
          params: [{ string: info.text }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['afu', 'addfromurl'],
    help: 'Add a track from an url.',
    callback: async (info: MessageInfo) => {
      const [fileName, url] = info.text.split(' ')
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        TM.sendMessage(`Failed to fetch map file from url ${url}`, info.login).then()
        return
      }
      const data = await res.arrayBuffer()
      const buffer = Buffer.from(data)
      await TM.call('WriteFile', [{ string: fileName + '.Challenge.Gbx' }, { base64: buffer.toString('base64') }], true)
      await TM.call('InsertChallenge', [{ string: fileName + '.Challenge.Gbx' }], true)
      const insertRes = await TM.call('GetNextChallengeInfo', [], true)
      const name = insertRes[0].Name
      TM.sendMessage(`${TM.colours.yellow}»» ${TM.colours.folly}${TM.getTitle(info)} `
        + `${TM.colours.white + TM.stripModifiers(info.nickName, true)}${TM.colours.folly} has added and queued `
        + `${TM.colours.white + TM.stripModifiers(name, true)}${TM.colours.folly} from url.`).then()
    },
    privilege: 1
  }
]

for (const command of commands) { ChatService.addCommand(command).then() }
