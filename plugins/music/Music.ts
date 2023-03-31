import config from './Config.js'
import songList from './SongList.js'
import { Song, SongAddedCallback, SongRemovedCallback, QueueChangedCallback, Caller } from './Types.js'
import SongList from './ui/SongList.component.js'
import fs from 'fs/promises'

let songs: Omit<Song, 'isJuked' | 'caller'>[] = songList
const queueChangeCallbacks: QueueChangedCallback[] = []
const songAddCallbacks: SongAddedCallback[] = []
const songRemoveCallbacks: SongRemovedCallback[] = []
const queue: Song[] = []
const history: Song[] = []
let current: Song | undefined
let listUi: SongList

export const music = {

  onQueueChanged(callback: QueueChangedCallback) {
    queueChangeCallbacks.push(callback)
  },

  onSongAdded(callback: SongAddedCallback) {
    songAddCallbacks.push(callback)
  },

  onSongRemoved(callback: SongRemovedCallback) {
    songRemoveCallbacks.push(callback)
  },

  addSong(name: string, author: string, url: string, caller?: Caller): boolean {
    if (queue.some(a => a.name === name)) {
      return false
    }
    const song: Song = { name, author, url, isJuked: false }
    queue.push(song)
    emitEvent(songAddCallbacks, song, caller)
    const status = addToQueue(name, false, caller)
    if (typeof status !== 'string') {
      emitEvent(queueChangeCallbacks, queue, {
        song, action: 'added'
      })
    }
    void updateSongsConfigFile('add', song)
    return true
  },

  removeSong(name: string, caller?: Caller): boolean {
    const index = queue.findIndex(a => a.name === name)
    if (index === -1) {
      return false
    }
    const song = queue.splice(index, 1)[0]
    listUi.updateSongs(queue)
    emitEvent(songRemoveCallbacks, song, caller)
    emitEvent(queueChangeCallbacks, queue, {
      song, action: 'removed'
    })
    void updateSongsConfigFile('remove', song)
    return true
  },

  addSongToQueue(songName: string, caller?: Caller):
    Readonly<Song> | 'already queued' | 'not in songlist' {
    return addToQueue(songName, true, caller)
  },

  removeSongFromQueue(name: string, caller?: Caller): Readonly<Song> | 'not queued' {
    if (!queue.filter(a => a.isJuked === true).some(a => a.name === name)) { return 'not queued' }
    const index: number = queue.findIndex(a => a.name === name)
    if (caller !== undefined) {
      tm.log.trace(`${tm.utils.strip(caller.nickname)} (${caller.login}) removed song ` +
        `${tm.utils.strip(queue[index].name)} by ${queue[index].author} from the queue`)
    } else {
      tm.log.trace(`Song ${tm.utils.strip(queue[index].name)} by ${queue[index].author} has been removed from the queue`)
    }
    const song = queue.splice(index, 1)[0]
    queue.push(song)
    listUi.updateSongs(queue)
    emitEvent(queueChangeCallbacks, queue, {
      song, action: 'removedFromQueue'
    })
    return song
  },

  async fetchCurrentServerMusic() {
    tm.client.call('GetForcedMusic') // TODO
  },

  get songs(): Readonly<Song>[] {
    return [...queue]
  }

}

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    listUi = new SongList()
    queue.push(...songs.map(a => ({ ...a, isJuked: false })))
    listUi.updateSongs(queue)
    emitEvent(queueChangeCallbacks, queue)
  })

  tm.addListener('EndMap', () => {
    if (current !== undefined) {
      current.isJuked = false
      current.caller = undefined
      history.unshift(current)
      // If song gets juked again when played prevent it from being added twice
      if (!queue.some(a => a.name === current?.name)) {
        queue.push(current)
      }
    }
    current = queue[0]
    queue.shift()
    listUi.updateSongs(queue)
    tm.client.callNoRes('SetForcedMusic', [
      { boolean: config.overrideMapMusic },
      { string: current.url }
    ])
    emitEvent(queueChangeCallbacks, queue)
  }, true)

  const add = config.addCommand
  tm.commands.add({
    aliases: add.aliases,
    help: add.help,
    params: [{ name: 'name' }, { name: 'author' }, { name: 'url' }],
    callback: (info, name: string, author: string, url: string) => {
      tm.sendMessage(`Added song ${name}`, add.public ? undefined : info.login)
      console.log(music.addSong(name, author, url, info))
    },
    privilege: add.privilege
  })

  const rm = config.removeCommand
  tm.commands.add({
    aliases: rm.aliases,
    help: rm.help,
    params: [{ name: 'name' }],
    callback: (info, name: string) => {
      tm.sendMessage(`Removed song ${name}`, rm.public ? undefined : info.login)
      console.log(music.removeSong(name, info))
    },
    privilege: rm.privilege
  })

  const ol = config.openListCommand
  tm.commands.add({
    aliases: ol.aliases,
    help: ol.help,
    params: [{ name: 'query', type: 'multiword', optional: true }],
    callback: (info, query?: string) => {
      if (query === undefined || query.trim().length === 0) {
        listUi.open(info)
      } else if (query.startsWith('$a')) {
        listUi.openWithQuery(info, query.slice(2), 'author')
      } else {
        listUi.openWithQuery(info, query)
      }
    },
    privilege: 0
  })

}

function emitEvent<T extends ((...args: any) => any)[]>(eventCallbacks: T, ...params: Parameters<T[number]>) {
  for (const e of eventCallbacks) {
    e(params)
  }
}

function addToQueue(songName: string, emitEvents: boolean, caller?: Caller) {
  const songIndex = queue.findIndex(a => a.name === songName)
  if (songIndex === -1) {
    return 'not in songlist'
  }
  if (queue[songIndex].isJuked) {
    return 'already queued'
  }
  const song = queue.splice(songIndex, 1)[0]
  song.isJuked = true
  song.caller = caller
  const newIndex = queue.findIndex(a => a.isJuked === false)
  queue.splice(newIndex, 0, song)
  listUi.updateSongs(queue)
  if (caller !== undefined) {
    tm.log.trace(`${tm.utils.strip(caller.nickname)} (${caller.login}) queued song ${song.name} by ${song.author}`)
  } else {
    tm.log.trace(`Song ${song.name} by ${song.author} queued`)
  }
  if (emitEvents) {
    emitEvent(queueChangeCallbacks, queue, {
      song, action: 'addedToQueue'
    })
  }
  return song
}

async function updateSongsConfigFile(action: 'add' | 'remove', song: Song): Promise<void> {
  if (action === 'add') {
    songs.push({ name: song.name, author: song.author, url: song.url })
  } else {
    songs = songs.filter(a => a.name !== song.name)
  }
  try {
    await fs.writeFile(config.songListPath, 'export default ' + JSON.stringify(songs, null, 2))
  } catch (err: any) {
    tm.log.error(`Cannot update song list in config. ${err?.message}`)
  }
}
