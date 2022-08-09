import { trakman as TM } from '../../src/Trakman.js'
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
        TM.log.error('Error when reading file on addlocal', file.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}File ${TM.utils.palette.highlight + path} is not accessible.`, info.login)
        return
      }
      const write: any[] | Error = await TM.client.call('WriteFile', [{ string: fileName }, { base64: file }])
      if (write instanceof Error) {
        TM.log.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await TM.client.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.log.error('Failed to insert map to jukebox', insert.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const res: any[] | Error = await TM.client.call('GetNextChallengeInfo')
      if (res instanceof Error) {
        TM.log.error('Failed to get next map info', res.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = res[0].Name
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added and queued `
        + `${TM.utils.palette.highlight + TM.utils.strip(name, true)}${TM.utils.palette.admin} from local files.`)
    },
    privilege: 1
  },
  {
    aliases: ['afu', 'addfromurl'], // TODO: this doesnt use the tm method fix
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
      const write: any[] | Error = await TM.client.call('WriteFile', [{ string: fileName }, { base64: buffer.toString('base64') }])
      if (write instanceof Error) {
        TM.log.error('Failed to write file', write.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await TM.client.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        TM.log.error('Failed to insert map to jukebox', insert.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const nextInfo: any[] | Error = await TM.client.call('GetNextChallengeInfo')
      if (nextInfo instanceof Error) {
        TM.log.error('Failed to get next map info', nextInfo.message)
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = nextInfo[0].Name
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added and queued `
        + `${TM.utils.palette.highlight + TM.utils.strip(name, true)}${TM.utils.palette.admin} from URL.`)
    },
    privilege: 1
  },
  {
    aliases: ['rt', 'et', 'removethis', 'erasethis'],
    help: 'Remove the current map from the playlist.',
    callback: async (info: MessageInfo): Promise<void> => {
      // TODO: Import node:fs to unlinkSync the file (optionally?)
      // TODO: Implement remove map
      const map: TMMap = TM.maps.current
      await TM.maps.remove(map.id, info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
        + `${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.admin} from the playlist.`)
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
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has skipped the ongoing map.`
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
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has restarted the ongoing map.`
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
      if (TM.jukebox.history[0] === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Can't queue previous map because map history is empty. This happens if server was restarted.`)
        return
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has requeued the previous map.`)
      TM.jukebox.add(TM.jukebox.history[0].id, info.login)
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first
      TM.client.callNoRes('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['rq', 'requeue', 'replay'],
    help: 'Requeue the ongoing map.',
    callback: (info: MessageInfo): void => {
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has requeued the ongoing map.`)
      TM.jukebox.add(TM.maps.current.id, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, login: string, reason?: string): void => {
      const targetInfo: TMPlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.utils.palette.highlight}: ${reason}${TM.utils.palette.admin}.`
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has kicked `
            + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}.${reasonString}`
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
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo === undefined) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: true | Error = await TM.addToMutelist(targetInfo.login, info.login, reason, expireDate)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server failed to add to mute list.`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${TM.utils.palette.highlight}: ${reason}${TM.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${TM.utils.palette.highlight}${TM.utils.msToTime(duration)}`
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has muted `
        + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}${durationString}.${TM.utils.palette.admin}${reasonString}`)
    },
    privilege: 2
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      if (TM.mutelist.some(a => a.login === login) === false) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Specified player was not muted.`, info.login)
        return
      }
      let targetInfo: TMOfflinePlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await TM.players.fetch(login)
        if (targetInfo == null) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: boolean | Error = await TM.removeFromMutelist(targetInfo.login, info.login)
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server failed to remove from mute list.`, info.login)
        return
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has unmuted `
        + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['fs', 'forcespec'],
    help: 'Force a player into specmode.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string): void => {
      const targetInfo: TMPlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has forced `
            + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin} into specmode.`
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
      const targetInfo: TMPlayer | undefined = TM.players.get(login)
      if (targetInfo === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has forced `
            + `${TM.utils.palette.highlight + TM.utils.strip(targetInfo.nickname)}${TM.utils.palette.admin} into playermode.`
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
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has kicked `
            + `${TM.utils.palette.highlight + TM.utils.strip(login)}${TM.utils.palette.admin}.`
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
    aliases: ['dq', 'djb', 'dropqueue', 'dropjukebox'],
    help: 'Drop the specified track from the map queue',
    params: [{ name: 'index', type: 'int' }],
    callback: (info: MessageInfo, index: number): void => {
      if (TM.jukebox.juked[index] === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}No such index in the queue.`, info.login)
        return
      }
      const map: TMMap | undefined = TM.jukebox.juked.map(a => a.map).find(a => a === TM.jukebox.juked.map(a => a.map)[index])
      if (map === undefined) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Couldn't find this index in the queue.`, info.login)
        return
      }
      TM.jukebox.remove(map.id, info.login)
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
        + `${TM.utils.palette.highlight + TM.utils.strip(map.name)}${TM.utils.palette.admin} from the queue.`
      )
    },
    privilege: 1
  },
  {
    aliases: ['cq', 'cjb', 'clearqueue', 'clearjukebox'],
    help: 'Clear the entirety of the current map queue',
    callback: (info: MessageInfo): void => {
      if (TM.jukebox.juked.length === 0) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}No maps in the queue.`, info.login)
        return
      }
      for (const map of TM.jukebox.juked) {
        TM.jukebox.remove(map.map.id, info.login)
      }
      TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
        + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has removed `
        + `${TM.utils.palette.highlight + 'all mapos'}${TM.utils.palette.admin} from the queue.`
      )
    },
    privilege: 1
  },
  {
    aliases: ['er', 'endround'],
    help: 'End the ongoing race in rounds-based gamemodes.',
    callback: (info: MessageInfo): void => {
      if (TM.state.gameConfig.gameMode === 1 || TM.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      TM.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
            + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has forced `
            + `the ongoing round to end.`
        }]
      },
        {
          method: 'ForceEndRound',
        })
    },
    privilege: 1
  },
  {
    aliases: ['players', 'playerlist'],
    help: 'Display list of players.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.playerList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['banlist'],
    help: 'Display list of banned players.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.banList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['bll, blacklists'],
    help: 'Display list of blackisted players.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.blacklistList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['gl', 'guestlist'],
    help: 'Display list of players in the guestlist.',
    callback: (info: MessageInfo): void => {
      TM.openManialink(TM.UIIDS.guestlistList, info.login)
    },
    privilege: 1
  },
]

for (const command of commands) { TM.commands.add(command) }
