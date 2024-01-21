import config from './Config.js'
import songList from './SongList.js'
import { Song, SongAddedCallback, SongRemovedCallback, QueueChangedCallback, Caller } from './Types.js'
import SongList from './ui/SongList.component.js'
import MusicWidget from './ui/MusicWidget.component.js'
import fs from 'fs/promises'

let songs: Omit<Song, 'isJuked' | 'caller'>[] = songList
const queueChangeCallbacks: QueueChangedCallback[] = []
const songAddCallbacks: SongAddedCallback[] = []
const songRemoveCallbacks: SongRemovedCallback[] = []
let queue: Song[] = []
const history: Song[] = []
let current: Song | undefined
let listUi: SongList
let widgetUi: MusicWidget

/**
 * Manages server music and renders music related UI.
 * @author lythx
 * @since 1.3
 */
export const music = {

  /**
   * Add a callback function to execute on a song queue change
   * @param callback Function to execute on event. 
   * It takes song queue and optional change information object as parameters.
   */
  onQueueChanged(callback: QueueChangedCallback) {
    queueChangeCallbacks.push(callback)
  },

  /**
   * Add a callback function to execute when a new song gets added to the song list
   * @param callback Function to execute on event. 
   * It takes song object and caller object as parameters. (Caller is the player who added the song)
   */
  onSongAdded(callback: SongAddedCallback) {
    songAddCallbacks.push(callback)
  },

  /**
   * Add a callback function to execute when a song gets removed from the song list
   * @param callback Function to execute on event. 
   * It takes song object and caller object as parameters. (Caller is the player who removed the song)
   */
  onSongRemoved(callback: SongRemovedCallback) {
    songRemoveCallbacks.push(callback)
  },

  /**
   * Add a new song to the song list
   * @param name Song name
   * @param author Song author
   * @param url Song url (link to an .ogg file)
   * @param caller Caller player object
   * @returns True if successful, error message otherwise
   */
  addSong(name: string, author: string, url: string, caller?: Caller): true | 'name taken' | 'invalid file extension' {
    if (!(url.endsWith('.ogg') || url.endsWith('.mux'))) {
      return 'invalid file extension'
    }
    if (queue.some(a => a.name === name)) {
      return 'name taken'
    }
    url = tm.utils.fixProtocol(url)
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

  /**
   * Remove a song from the song list
   * @param name Song name
   * @param caller Caller player object
   * @returns Boolean indicating whether the song got removed
   */
  removeSong(name: string, caller?: Caller): boolean {
    const index = queue.findIndex(a => a.name === name)
    if (index === -1) {
      return false
    }
    const song = queue.splice(index, 1)[0]
    if (index === 0) {
      updateNextSong(queue[0]?.url)
    }
    listUi.updateSongs(current, queue)
    emitEvent(songRemoveCallbacks, song, caller)
    emitEvent(queueChangeCallbacks, queue, {
      song, action: 'removed'
    })
    void updateSongsConfigFile('remove', song)
    return true
  },

  /**
   * Add a song to the song queue
   * @param songName Song name
   * @param caller Caller player object
   * @returns Song object if it got added, error message if unsuccessful
   */
  addSongToQueue(songName: string, caller?: Caller):
    Readonly<Song> | 'already queued' | 'not in songlist' | 'no privilege' {
    return addToQueue(songName, true, caller)
  },

  removeSongFromQueue: removeFromQueue,

  /**
   * Song list in queue order
   */
  get songs(): Readonly<Song>[] {
    return [...queue]
  },

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled,

  /**
   * If true songs will be played instead of map music
   */
  overrideMapMusic: config.overrideMapMusic

}

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    listUi = new SongList()
    widgetUi = new MusicWidget()
    const duplicatesExist = fixDuplicateNames()
    if (duplicatesExist) {
      tm.log.warn(`Song name duplicates present in SongList, to fix them edit SongList.js file or use ingame commands.`)
      updateSongsConfigFile()
    }
    queue.push(...songs.map(a => ({ ...a, isJuked: false })))
    listUi.updateSongs(current, queue)
    const msg = config.messages
    listUi.onSongJuked = (song, info) => {
      const status = addToQueue(song.name, true, info)
      if (typeof status !== 'string') {
        tm.sendMessage(tm.utils.strVar(msg.addToQueue, {
          nickname: tm.utils.strip(info.nickname),
          song: song.name,
          author: song.author
        }), config.publicQueue ? undefined : info.login)
      } else if (status === 'no privilege') {
        tm.sendMessage(msg.cantAddMoreThanOne, info.login)
      } else {
        tm.sendMessage(msg.addToQueueError, info.login)
      }
    }
    listUi.onSongUnjuked = (song, info) => {
      const status = removeFromQueue(song.name, info)
      if (typeof status !== 'string') {
        tm.sendMessage(tm.utils.strVar(msg.removeFromQueue, {
          nickname: tm.utils.strip(info.nickname),
          song: song.name
        }), config.publicQueue ? undefined : info.login)
      } else {
        tm.sendMessage(msg.removeFromQueueError, info.login)
      }
    }
    updateNextSong(queue[0]?.url)
    emitEvent(queueChangeCallbacks, queue)
  })

  tm.addListener('BeginMap', () => {
    if (current !== undefined) {
      current.isJuked = false
      current.caller = undefined
      history.unshift(current)
      history.length = Math.min(config.historySize, history.length)
      // If song gets juked again when played prevent it from being added twice
      if (!queue.some(a => a.name === current?.name)) {
        queue.push(current)
      }
    }
    current = queue[0]
    queue.shift()
    listUi.updateSongs(current, queue)
    listUi.updatePreviousSongs(history)
    widgetUi.setCurrentSong(current)
    updateNextSong(queue[0]?.url)
    emitEvent(queueChangeCallbacks, queue)
  }, true)
  const msg = config.messages

  const add = config.addCommand
  tm.commands.add({
    aliases: add.aliases,
    help: add.help,
    params: [{ name: 'name' }, { name: 'author' }, { name: 'url' }],
    callback: (info, name: string, author: string, url: string) => {
      const status = music.addSong(name, author, url, info)
      if (status === true) {
        tm.sendMessage(tm.utils.strVar(msg.add, {
          nickname: tm.utils.strip(info.nickname),
          song: name, author
        }), add.public ? undefined : info.login)
      } else if (status === 'name taken') {
        tm.sendMessage(tm.utils.strVar(msg.addNameError, { name }), info.login)
      } else if (status === 'invalid file extension') {
        tm.sendMessage(tm.utils.strVar(msg.addFileExtensionError, { url }), info.login)
      }
    },
    privilege: add.privilege
  })

  const rm = config.removeCommand
  tm.commands.add({
    aliases: rm.aliases,
    help: rm.help,
    params: [{ name: 'name' }],
    callback: (info, name: string) => {
      const removed = music.removeSong(name, info)
      if (removed) {
        tm.sendMessage(tm.utils.strVar(msg.remove, {
          nickname: tm.utils.strip(info.nickname),
          song: name
        }), rm.public ? undefined : info.login)
      } else {
        tm.sendMessage(tm.utils.strVar(msg.removeError, { name }), info.login)
      }
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

  const sh = config.shuffleCommand
  tm.commands.add({
    aliases: sh.aliases,
    help: sh.help,
    callback: (info) => {
      shuffleQueue(info)
      tm.sendMessage(tm.utils.strVar(msg.shuffle, {
        nickname: tm.utils.strip(info.nickname),
      }), sh.public ? undefined : info.login)
    },
    privilege: sh.privilege
  })

}

function emitEvent<T extends ((...args: any) => any)[]>(eventCallbacks: T, ...params: Parameters<T[number]>) {
  for (const e of eventCallbacks) {
    e(params)
  }
}

function addToQueue(songName: string, emitEvents: boolean, caller?: Caller):
  Song | "already queued" | "not in songlist" | "no privilege" {
  const songIndex = queue.findIndex(a => a.name === songName)
  if (songIndex === -1) {
    return 'not in songlist'
  }
  if (queue[songIndex].isJuked) {
    return 'already queued'
  }
  if (caller !== undefined && caller.privilege < config.forceQueuePrivilege) {
    if (queue.some(a => a.caller?.login === caller.login) || history.some(a => a.name === songName)) {
      return 'no privilege'
    }
  }
  const song = queue.splice(songIndex, 1)[0]
  song.isJuked = true
  song.caller = caller
  const newIndex = queue.findIndex(a => a.isJuked === false)
  queue.splice(newIndex, 0, song)
  if (newIndex === 0) {
    updateNextSong(song.url)
  }
  listUi.updateSongs(current, queue)
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

/**
  * Removes a song from the song queue
  * @param songName Song name
  * @param caller Caller player object
  * @returns Song object if it got removed, error message if unsuccessful
  */
function removeFromQueue(name: string, caller?: Caller): Readonly<Song> | 'not queued' {
  if (!queue.filter(a => a.isJuked === true).some(a => a.name === name)) { return 'not queued' }
  const index: number = queue.findIndex(a => a.name === name)
  if (caller !== undefined) {
    tm.log.trace(`${tm.utils.strip(caller.nickname)} (${caller.login}) removed song ` +
      `${tm.utils.strip(queue[index].name)} by ${queue[index].author} from the queue`)
  } else {
    tm.log.trace(`Song ${tm.utils.strip(queue[index].name)} by ${queue[index].author} has been removed from the queue`)
  }
  const song = queue.splice(index, 1)[0]
  if (index === 0) {
    updateNextSong(queue[0].url)
  }
  song.isJuked = false
  song.caller = undefined
  queue.push(song)
  listUi.updateSongs(current, queue)
  emitEvent(queueChangeCallbacks, queue, {
    song, action: 'removedFromQueue'
  })
  return song
}

function shuffleQueue(caller?: Caller): boolean {
  if (caller !== undefined && caller.privilege < config.forceQueuePrivilege) {
    return false
  }
  queue = queue
    .map(a => ({ song: { ...a, isJuked: false, caller: undefined }, rand: Math.random() }))
    .sort((a, b): number => a.rand - b.rand)
    .map(a => a.song)
  listUi.updateSongs(current, queue)
  updateNextSong(queue[0]?.url)
  emitEvent(queueChangeCallbacks, queue)
  if (caller !== undefined) {
    tm.log.info(`${tm.utils.strip(caller.nickname)} (${caller.login}) shuffled the song list`)
  } else {
    tm.log.info(`Song list shuffled`)
  }
  return true
}

function updateNextSong(url: string) {
  if (url === undefined) { return }
  tm.client.callNoRes('SetForcedMusic', [
    { boolean: config.overrideMapMusic },
    { string: url }
  ])
}

function fixDuplicateNames(): boolean {
  let isChanged = false
  for (let i = 0; i < songs.length; i++) {
    const song = songs[i]
    const prev = songs.slice(0, i)
    let j = 1
    if (prev.some(a => a.name === song.name)) {
      isChanged = true
      song.name = song.name + `(${j})`
    }
    while ((prev.some(a => a.name === song.name))) {
      j++
      const sliceIndex = song.name.lastIndexOf('(')
      song.name = song.name.slice(0, sliceIndex) + `(${j})`
    }
  }
  return isChanged
}

async function updateSongsConfigFile(action?: 'add' | 'remove', song?: Song): Promise<void> {
  if (action === 'add' && song !== undefined) {
    songs.push({ name: song.name, author: song.author, url: song.url })
  } else if (action === 'remove' && song !== undefined) {
    songs = songs.filter(a => a.name !== song.name)
  }
  try {
    await fs.writeFile(config.songListPath, 'export default ' + JSON.stringify(songs, null, 2))
  } catch (err: any) {
    tm.log.error(`Cannot update song list in config. ${err?.message}`)
  }
}
