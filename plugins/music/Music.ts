import config from './Config.js'

interface Song {
  name: string;
  url: string;
}

interface SongData { name: string, callerLogin?: string }

const songs: Song[] = config.songs
const queue: SongData[] = []
const history: SongData[] = []
let current: SongData | undefined

tm.addListener('EndMap', () => {
  if(current !== undefined) {
    history.unshift(current)
  }
  current = queue[0]
  queue.shift()
})

export const music = {

  get currentQueue(): Readonly<SongData>[] {
    return queue
  },

  addSongToQueue(songName: string, caller?: { nickname: string, login: string }): boolean {
    const song = songs.find(a => a.name === songName)
    if (song === undefined) {
      return false
    }
    queue.push({ name: songName, callerLogin: caller?.login })
    if (caller !== undefined) {
      tm.log.trace(`${tm.utils.strip(caller.nickname)} (${caller.login}) added song ${song.name} by ${'TODO'}`) // TODO
    } else {
      tm.log.trace(`Song ${song.name} by ${'TODO'} added`) // TODO
    }
    return true
  },

  removeSongFromQueue() {

  }

}


