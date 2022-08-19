import { trakman as tm } from '../../src/Trakman.js'
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
        tm.log.error('Error when reading file on addlocal', file.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}File ${tm.utils.palette.highlight + path} is not accessible.`, info.login)
        return
      }
      const write: any[] | Error = await tm.client.call('WriteFile', [{ string: fileName }, { base64: file }])
      if (write instanceof Error) {
        tm.log.error('Failed to write file', write.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        tm.log.error('Failed to insert map to jukebox', insert.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const res: any[] | Error = await tm.client.call('GetNextChallengeInfo')
      if (res instanceof Error) {
        tm.log.error('Failed to get next map info', res.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = res[0].Name
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
        + `${tm.utils.palette.highlight + tm.utils.strip(name, true)}${tm.utils.palette.admin} from local files.`)
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
        tm.sendMessage(`Failed to fetch map file from url ${url}`, info.login)
        return
      }
      const data: ArrayBuffer = await res.arrayBuffer()
      const buffer: Buffer = Buffer.from(data)
      const write: any[] | Error = await tm.client.call('WriteFile', [{ string: fileName }, { base64: buffer.toString('base64') }])
      if (write instanceof Error) {
        tm.log.error('Failed to write file', write.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to write the file to the server.`, info.login)
        return
      }
      const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: fileName }])
      if (insert instanceof Error) {
        tm.log.error('Failed to insert map to jukebox', insert.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map into queue.`, info.login)
        return
      }
      const nextInfo: any[] | Error = await tm.client.call('GetNextChallengeInfo')
      if (nextInfo instanceof Error) {
        tm.log.error('Failed to get next map info', nextInfo.message)
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to obtain the next map info.`, info.login)
        return
      }
      const name: string = nextInfo[0].Name
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
        + `${tm.utils.palette.highlight + tm.utils.strip(name, true)}${tm.utils.palette.admin} from URL.`)
    },
    privilege: 1
  },
  {
    aliases: ['rt', 'et', 'removethis', 'erasethis'],
    help: 'Remove the current map from the playlist.',
    callback: async (info: MessageInfo): Promise<void> => {
      // TODO: Import node:fs to unlinkSync the file (optionally?)
      // TODO: Implement remove map
      const map: TMMap = tm.maps.current
      await tm.maps.remove(map.id, info)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
        + `${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.admin} from the playlist.`)
    },
    privilege: 1
  },
  {
    aliases: ['s', 'skip'],
    help: 'Skip to the next map.',
    callback: (info: MessageInfo): void => {
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has skipped the ongoing map.`
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
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has restarted the ongoing map.`
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
      if (tm.jukebox.history[0] === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Can't queue previous map because map history is empty. This happens if server was restarted.`)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has requeued the previous map.`)
      tm.jukebox.add(tm.jukebox.history[0].id, info)
      await new Promise((r) => setTimeout(r, 5)) // Let the server think first
      tm.client.callNoRes('NextChallenge')
    },
    privilege: 1
  },
  {
    aliases: ['rq', 'requeue', 'replay'],
    help: 'Requeue the ongoing map.',
    callback: (info: MessageInfo): void => {
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has requeued the ongoing map.`)
      tm.jukebox.add(tm.maps.current.id, info)
    },
    privilege: 1
  },
  {
    aliases: ['k', 'kick'],
    help: 'Kick a specific player.',
    params: [{ name: 'login' }, { name: 'reason', type: 'multiword', optional: true }],
    callback: (info: MessageInfo, login: string, reason?: string): void => {
      const targetInfo: TMPlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${tm.utils.palette.highlight}: ${reason}${tm.utils.palette.admin}.`
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has kicked `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}.${reasonString}`
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
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo === undefined) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: true | Error = await tm.admin.mute(targetInfo.login, info, reason, targetInfo.nickname, expireDate)
      if (res instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server failed to add to mute list.`, info.login)
        return
      }
      const reasonString: string = reason === undefined ? '' : ` Reason${tm.utils.palette.highlight}: ${reason}${tm.utils.palette.admin}.`
      const durationString: string = duration === undefined ? '' : ` for ${tm.utils.palette.highlight}${tm.utils.msToTime(duration)}`
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has muted `
        + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}${durationString}.${tm.utils.palette.admin}${reasonString}`)
    },
    privilege: 2
  },
  {
    aliases: ['um', 'unmute'],
    help: 'Unmute a specific player.',
    params: [{ name: 'login' }],
    callback: async (info: MessageInfo, login: string): Promise<void> => {
      if (tm.mutelist.some(a => a.login === login) === false) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Specified player was not muted.`, info.login)
        return
      }
      let targetInfo: TMOfflinePlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        targetInfo = await tm.players.fetch(login)
        if (targetInfo == null) {
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player.`, info.login)
          return
        }
      }
      const res: boolean | Error = await tm.admin.unmute(targetInfo.login, info)
      if (res instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server failed to remove from mute list.`, info.login)
        return
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has unmuted `
        + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin}.`
      )
    },
    privilege: 2
  },
  {
    aliases: ['fs', 'forcespec'],
    help: 'Force a player into specmode.',
    params: [{ name: 'login' }],
    callback: (info: MessageInfo, login: string): void => {
      const targetInfo: TMPlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has forced `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin} into specmode.`
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
      const targetInfo: TMPlayer | undefined = tm.players.get(login)
      if (targetInfo === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has forced `
            + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin} into playermode.`
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
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has kicked `
            + `${tm.utils.palette.highlight + tm.utils.strip(login)}${tm.utils.palette.admin}.`
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
      if (tm.jukebox.juked[index] === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No such index in the queue.`, info.login)
        return
      }
      const map: TMMap | undefined = tm.jukebox.juked.map(a => a.map).find(a => a === tm.jukebox.juked.map(a => a.map)[index])
      if (map === undefined) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Couldn't find this index in the queue.`, info.login)
        return
      }
      tm.jukebox.remove(map.id, info)
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
        + `${tm.utils.palette.highlight + tm.utils.strip(map.name)}${tm.utils.palette.admin} from the queue.`
      )
    },
    privilege: 1
  },
  {
    aliases: ['cq', 'cjb', 'clearqueue', 'clearjukebox'],
    help: 'Clear the entirety of the current map queue',
    callback: (info: MessageInfo): void => {
      if (tm.jukebox.juked.length === 0) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No maps in the queue.`, info.login)
        return
      }
      for (const map of tm.jukebox.juked) {
        tm.jukebox.remove(map.map.id, info)
      }
      tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
        + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has removed `
        + `${tm.utils.palette.highlight + 'all mapos'}${tm.utils.palette.admin} from the queue.`
      )
    },
    privilege: 1
  },
  {
    aliases: ['er', 'endround'],
    help: 'End the ongoing race in rounds-based gamemodes.',
    callback: (info: MessageInfo): void => {
      if (tm.state.gameConfig.gameMode === 1 || tm.state.gameConfig.gameMode === 4) { // TimeAttack & Stunts
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Server not in rounds mode.`, info.login)
        return
      }
      tm.multiCallNoRes({
        method: 'ChatSendServerMessage',
        params: [{
          string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
            + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has forced `
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
      tm.openManialink(tm.UIIDS.playerList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['banlist'],
    help: 'Display list of banned players.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.banList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['bll, blacklists'],
    help: 'Display list of blackisted players.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.blacklistList, info.login)
    },
    privilege: 1
  },
  {
    aliases: ['gl', 'guestlist'],
    help: 'Display list of players in the guestlist.',
    callback: (info: MessageInfo): void => {
      tm.openManialink(tm.UIIDS.guestlistList, info.login)
    },
    privilege: 1
  },
]

for (const command of commands) { tm.commands.add(command) }
