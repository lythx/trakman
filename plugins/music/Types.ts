interface Caller {
  readonly login: string
  readonly nickname: string
}
interface Song {
  name: string
  author: string
  url: string
  isJuked: boolean
  caller?: Caller
}

type QueueChangedCallback =
  ((queue: Song[], change?: {
    song: Song,
    action: 'added' | 'removed' | 'addedToQueue' | 'removedFromQueue'
  }) => void | Promise<void>)
type SongAddedCallback = ((song: Song, caller?: Readonly<Caller>) => void | Promise<void>)
type SongRemovedCallback = ((song: Song, caller?: Readonly<Caller>) => void | Promise<void>)

export type {
  Caller, Song, QueueChangedCallback, SongAddedCallback, SongRemovedCallback
}