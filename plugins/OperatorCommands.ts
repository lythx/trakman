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
      const file = await fs.readFile(path, 'base64').catch(err => err)
      if (file instanceof Error) {
        ErrorHandler.error('Error when reading file on addlocal', file.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}File ${TM.palette.highlight + path} is not accessible.`, info.login)
        return
      }
      const write = await TM.call('WriteFile', [{ string: fileName }, { base64: file }])
      if (write instanceof Error) {
        ErrorHandler.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        ErrorHandler.error('Failed to insert challenge to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the challenge into queue.`, info.login)
        return
      }
      const res = await TM.call('GetNextChallengeInfo')
      if (res instanceof Error) {
        ErrorHandler.error('Failed to get next challenge info', res.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to obtain the next challenge info.`, info.login)
        return
      }
      const name = res[0].Name
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
        + `${TM.palette.highlight + TM.strip(name, true)}${TM.palette.admin} from local files.`)
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
        TM.sendMessage(`Failed to fetch map file from url ${url}`, info.login)
        return
      }
      const data = await res.arrayBuffer()
      const buffer = Buffer.from(data)
      const write = await TM.call('WriteFile', [{ string: fileName }, { base64: buffer.toString('base64') }])
      if (write instanceof Error) {
        ErrorHandler.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        ErrorHandler.error('Failed to insert challenge to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the challenge into queue.`, info.login)
        return
      }
      const nextInfo = await TM.call('GetNextChallengeInfo')
      if (nextInfo instanceof Error) {
        ErrorHandler.error('Failed to get next challenge info', nextInfo.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to obtain the next challenge info.`, info.login)
        return
      }
      const name = nextInfo[0].Name
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
        + `${TM.palette.highlight + TM.strip(name, true)}${TM.palette.admin} from URL.`)
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: (info: MessageInfo) => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has skipped the ongoing track.`
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
    callback: (info: MessageInfo) => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has restarted the ongoing track.`
        }]
      },
        {
          method: 'RestartChallenge'
        })
    },
    privilege: 1
  },
  {
    aliases: ['pt', 'prev', 'previoustrack'],
    help: 'Requeue the previously played track.',
    callback: async (info: MessageInfo) => {
      const index = await TM.call('GetCurrentChallengeIndex')
      if (index instanceof Error) {
        TM.sendMessage('Failed to fetch current challenge index', info.login)
        ErrorHandler.error('Failed to fetch current challenge index', index.message)
        return
      }
      if (Number(index) === -1) { return }
      const res = await TM.multiCall({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has requeued the previous track.`
        }]
      },
        {
          method: 'SetNextChallengeIndex',
          params: [{
            int: Number(index) - 1
          }]
        })
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to set next challenge index.`, info.login)
        ErrorHandler.error('Failed to set next challenge index', res.message)
        return
      }
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first
      TM.callNoRes('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has kicked `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'Kick',
          params: [{ string: targetInfo.login }, { string: 'asdsasdasd' }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has muted `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'Ignore',
          params: [{ string: targetInfo.login }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has unmuted `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'UnIgnore',
          params: [{ string: targetInfo.login }]
        })
    },
    privilege: 1
  },
  {
    aliases: ['fs', 'forcespec'],
    help: 'Force a player into specmode.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has forced `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin} into specmode.`
        }]
      },
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 0 }]
        }
      )
    },
    privilege: 1
  },
  {
    aliases: ['fp', 'forceplay'],
    help: 'Force a player into playermode.',
    callback: (info: MessageInfo) => {
      const targetInfo = TM.getPlayer(info.text)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has forced `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin} into playermode.`
        }]
      },
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 2 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: targetInfo.login }, { int: 0 }]
        }
      )
    },
    privilege: 1
  },
  {
    aliases: ['kg', 'gk', 'kickghost', 'ghostkick'],
    help: 'Manipulate every soul on the server that you kicked someone.',
    callback: (info: MessageInfo) => {
      if (info.text.length === 0) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}No login specified.`, info.login)
        return
      }
      TM.multiCallNoRes(
        {
          method: 'Kick',
          params: [{ string: info.text }]
        },
        {
          method: 'ChatSendServerMessage',
          params: [{
            string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
              + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has kicked `
              + `${TM.palette.highlight + TM.strip(info.text)}${TM.palette.admin}.`
          }]
        }
      )
    },
    privilege: 1
  }, //You're welcome wizer : - )
]

for (const command of commands) { ChatService.addCommand(command) }
