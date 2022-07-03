import { TRAKMAN as TM } from '../../src/Trakman.js'
import fs from 'node:fs/promises'
import fetch from 'node-fetch'

const commands: TMCommand[] = [
  {
    aliases: ['al', 'addlocal'],
    help: 'Add a map from your pc.',
    // todo params
    callback: async (info: MessageInfo): Promise<void> => {
      const split: string[] = info.text.split(' ')
      const fileName: string = split.shift() + '.Challenge.Gbx'
      const path: string = split.join(' ')
      const file: any = await fs.readFile(path, 'base64').catch(err => err)
      if (file instanceof Error) {
        TM.error('Error when reading file on addlocal', file.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}File ${TM.palette.highlight + path} is not accessible.`, info.login)
        return
      }
      const write: any[] | Error = await TM.call('WriteFile', [{ string: fileName }, { base64: file }])
      if (write instanceof Error) {
        TM.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.error('Failed to insert map to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const res: any[] | Error = await TM.call('GetNextChallengeInfo')
      if (res instanceof Error) {
        TM.error('Failed to get next map info', res.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = res[0].Name
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
        + `${TM.palette.highlight + TM.strip(name, true)}${TM.palette.admin} from local files.`)
    },
    privilege: 1
  },
  {
    aliases: ['afu', 'addfromurl'],
    help: 'Add a map from an url.',
    // todo params
    callback: async (info: MessageInfo): Promise<void> => {
      const s: string[] = info.text.split(' ')
      const fileName: string = s[0] + '.Challenge.Gbx'
      const url: string = s[1]
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        TM.sendMessage(`Failed to fetch map file from url ${url}`, info.login)
        return
      }
      const data: ArrayBuffer = await res.arrayBuffer()
      const buffer: Buffer = Buffer.from(data)
      const write: any[] | Error = await TM.call('WriteFile', [{ string: fileName }, { base64: buffer.toString('base64') }])
      if (write instanceof Error) {
        TM.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await TM.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.error('Failed to insert map to jukebox', insert.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const nextInfo: any[] | Error = await TM.call('GetNextChallengeInfo')
      if (nextInfo instanceof Error) {
        TM.error('Failed to get next map info', nextInfo.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = nextInfo[0].Name
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
        + `${TM.palette.highlight + TM.strip(name, true)}${TM.palette.admin} from URL.`)
    },
    privilege: 1
  },
  {
    aliases: ['rt', 'et', 'removethis', 'erasethis'],
    help: 'Remove the current map from the playlist.',
    callback: async (info: MessageInfo): Promise<void> => {
      // TODO: Import node:fs to unlinkSync the file (optionally?)
      // TODO: Implement remove map
      const map: TMMap = TM.map
      const res: any[] | Error = await TM.call('RemoveChallenge', [{ string: map.fileName }])
      if (res instanceof Error) { // This can happen if the map was already removed
        TM.error(`Couldn't remove ${map.fileName} from the playlist.`, res.message)
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Couldn't remove the current map.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has removed `
        + `${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.admin} from the playlist.`)
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: (info: MessageInfo): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has skipped the ongoing map.`
        }]
      },
        {
          method: 'NextChallenge'
        })
    },
    privilege: 1
  },
  {
    aliases: ['r', 'res', 'restart'],
    help: 'Restart the current map.',
    callback: (info: MessageInfo): void => {
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
            + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has restarted the ongoing map.`
        }]
      },
        {
          method: 'RestartChallenge'
        })
    },
    privilege: 1
  },
  {
    aliases: ['pt', 'prev', 'previous'],
    help: 'Requeue the previously played map.',
    callback: async (info: MessageInfo): Promise<void> => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has requeued the previous map.`)
      TM.addToJukebox(TM.previousMaps[0].id)
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first
      TM.callNoRes('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['rq', 'requeue', 'replay'],
    help: 'Requeue the ongoing map.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has requeued the ongoing map.`)
      TM.addToJukebox(TM.map.id)
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, login: string, reason?: string): void => {
      const targetInfo: TMPlayer | undefined = TM.getPlayer(login)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Player is not on the server`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.palette.highlight}: ${reason}${TM.palette.admin}.`
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
    help: 'Mutelist a specific player.',
    params: [{ name: 'login' }, { name: 'duration', type: 'time', optional: true }, { name: 'reason', type: 'multiword', optional: true }],
    callback: async (info: MessageInfo, login: string, duration?: number, reason?: string): Promise<void> => {
      const expireDate: Date | undefined = duration === undefined ? undefined : new Date(Date.now() + duration)
      let targetInfo: TMPlayer | undefined = TM.getPlayer(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(login)
        if (targetInfo === undefined) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: void | Error = await TM.addToMutelist(targetInfo.login, info.login, reason, expireDate)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Server failed to add to mute list.`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.palette.highlight}: ${reason}${TM.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${TM.palette.highlight}${TM.msToTime(duration)}`
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has muted `
        + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}${durationString}.${TM.palette.admin}${reasonString}`)
    },
    privilege: 2
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      if (TM.mutelist.some(a => a.login === login) === false) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Specified player was not muted.`, info.login)
        return
      }
      let targetInfo: TMPlayer | undefined = TM.getPlayer(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.fetchPlayer(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: void | Error = await TM.removeFromMutelist(targetInfo.login)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Server failed to remove from mute list.`, info.login)
        return
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
        + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has unmuted `
        + `${TM.palette.highlight + TM.strip(targetInfo.nickName)}${TM.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['fs', 'forcespec'],
    help: 'Force a player into specmode.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string): void => {
      const targetInfo: TMPlayer | undefined = TM.getPlayer(login)
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
    callback: (info: MessageInfo, login: string): void => {
      const targetInfo: TMPlayer | undefined = TM.getPlayer(login)
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
    callback: (info: MessageInfo, login: string): void => {
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
    callback: (info: MessageInfo): void => {
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
