import { TRAKMAN as TM } from '../../src/Trakman.js'
import fs from 'node:fs/promises'
import fetch from 'node-fetch'

const commands: TMCommand[] = [
  {
    aliases: ['al', 'addlocal'],
    help: 'Add a challenge from your pc.',
    // todo params
    callback: async (info: MessageInfo) => {
      const split = info.text.split(' ')
      const fileName = split.shift() + '.Challenge.Gbx'
      const path = split.join(' ')
      const file = await fs.readFile(path, 'base64').catch(err => err)
      if (file instanceof Error) {
        TM.error('Error when reading file on addlocal', file.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}File ${TM.palette.highlight + path} is not accessible.`, info.login)
        return
      }
      const write = await TM.call('WriteFile', [{ string: fileName }, { base64: file }])
      if (write instanceof Error) {
        TM.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.error('Failed to insert challenge to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the challenge into queue.`, info.login)
        return
      }
      const res = await TM.call('GetNextChallengeInfo')
      if (res instanceof Error) {
        TM.error('Failed to get next challenge info', res.message)
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
    // todo params
    callback: async (info: MessageInfo) => {
      const s = info.text.split(' ')
      const fileName = s[0] + '.Challenge.Gbx'
      const url = s[1]
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        TM.sendMessage(`Failed to fetch map file from url ${url}`, info.login)
        return
      }
      const data = await res.arrayBuffer()
      const buffer = Buffer.from(data)
      const write = await TM.call('WriteFile', [{ string: fileName }, { base64: buffer.toString('base64') }])
      if (write instanceof Error) {
        TM.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.error('Failed to insert challenge to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the challenge into queue.`, info.login)
        return
      }
      const nextInfo = await TM.call('GetNextChallengeInfo')
      if (nextInfo instanceof Error) {
        TM.error('Failed to get next challenge info', nextInfo.message)
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
    aliases: ['rt', 'et', 'removethis', 'erasethis'],
    help: 'Remove the current track from the playlist.',
    callback: async (info: MessageInfo) => {
      // TODO: Import node:fs to unlinkSync the file (optionally?)
      // TODO: Implement remove challenge
      const challenge = TM.challenge
      const res = await TM.call('RemoveChallenge', [{ string: challenge.fileName }])
      if (res instanceof Error) { // This can happen if the challenge was already removed
        TM.error(`Couldn't remove ${challenge.fileName} from the playlist.`, res.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Couldn't remove the current track.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has removed `
        + `${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.admin} from the playlist.`)
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
      // DOESNT SKIP
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has requeued the previous track.`)
      TM.addToJukebox(TM.previousChallenges[0].id)
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first
      TM.callNoRes('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, login: string, reason?: string) => {
      const targetInfo = TM.getPlayer(login)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      const reasonString = reason === undefined ? '' : ` Reason${TM.palette.highlight}: ${reason}${TM.palette.admin}.`
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has kicked `
            + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.${reasonString}`
        }]
      },
        {
          method: 'Kick',
          params: [
            { string: login },
            { string: reason === undefined ? 'No reason specified' : reason }
          ]
        })
    },
    privilege: 1
  },
  {
    aliases: ['m', 'mute'],
    help: 'Mute a specific player.',
    // TODO params: [{}],
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
    // TODO params
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
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string) => {
      const targetInfo = TM.getPlayer(login)
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
          params: [{ string: login }, { int: 1 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: login }, { int: 0 }]
        }
      )
    },
    privilege: 1
  },
  {
    aliases: ['fp', 'forceplay'],
    help: 'Force a player into playermode.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string) => {
      const targetInfo = TM.getPlayer(login)
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
          params: [{ string: login }, { int: 2 }]
        },
        {
          method: 'ForceSpectator',
          params: [{ string: login }, { int: 0 }]
        }
      )
    },
    privilege: 1
  },
  {
    aliases: ['kg', 'gk', 'kickghost', 'ghostkick'],
    help: 'Manipulate every soul on the server that you kicked someone.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string) => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has kicked `
            + `${TM.palette.highlight + TM.strip(login)}${TM.palette.admin}.`
        }]
      },
        {
          method: 'Kick',
          params: [{ string: login }]
        }
      )
    },
    privilege: 1
  }, //You're welcome wizer : - ) // Thank Znake
  {
    aliases: ['er', 'endround'],
    help: 'End the ongoing race in rounds-based gamemodes.',
    callback: (info: MessageInfo) => {
      if (TM.gameInfo.gameMode === 1 || TM.gameInfo.gameMode === 4) { // TimeAttack & Stunts
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has forced `
            + `the ongoing round to end.`
        }]
      },
        {
          method: 'ForceEndRound',
        })
    },
    privilege: 1
  },
]

for (const command of commands) { TM.addCommand(command) }
