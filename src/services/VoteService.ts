import { Events } from "../Events.js"
import { VoteRepository } from "../database/VoteRepository.js"
import { MapService } from "./MapService.js"
import { Logger } from "../Logger.js"
import { Utils } from '../Utils.js'
import { GameService } from "./GameService.js"

export abstract class VoteService {

  private static readonly repo: VoteRepository = new VoteRepository()
  private static _votes: { uid: string, votes: tm.Vote[] }[] = []
  private static _currentVotes: tm.Vote[] = []

  /**
   * Fetches votes for current and next maps
   */
  static async initialize(): Promise<void> {
    const res: tm.Vote[] = await this.repo.getAll()
    const maps = [MapService.current, ...MapService.queue]
    for (let i: number = 0; i < maps.length; i++) {
      const uid: string = maps[i].id
      this._votes.unshift({ uid, votes: res.filter(a => a.mapId === uid) })
    }
    this._currentVotes = this._votes[0].votes
    Events.addListener('JukeboxChanged', () => {
      void this.updatePrefetch()
    })
  }

  /**
   * Updates map prefetch and sets the current map
   */
  static async nextMap(): Promise<void> {
    await this.updatePrefetch()
    this._currentVotes = this._votes.find(a => a.uid === MapService.current.id)?.votes ?? []
  }

  /**
   * Adds a vote on the current map to runtime memory and database
   * @param player Player object
   * @param vote Vote value 
   */
  static add(player: { login: string, nickname?: string }, vote: -3 | -2 | -1 | 1 | 2 | 3): void
  /**
   * Adds multiple votes on the current map to runtime memory and database
   * @param votes Vote objects 
   */
  static add(votes: { login: string, vote: -3 | -2 | -1 | 1 | 2 | 3 }[]): void
  static add(arg: { login: string, nickname?: string } |
    { login: string, vote: -3 | -2 | -1 | 1 | 2 | 3 }[], vote?: -3 | -2 | -1 | 1 | 2 | 3): void {
    if (GameService.state === 'transition') { return }
    const date: Date = new Date()
    const map = { ...MapService.current }
    const voteArr = this._votes.find(a => a.uid === map.id)?.votes
    if (voteArr === undefined) { return }
    if (Array.isArray(arg)) {
      const updated: tm.Vote[] = []
      const added: tm.Vote[] = []
      for (const e of arg) {
        const v = voteArr.find(a => a.login === e.login)
        if (v?.vote === vote) { return }
        if (v !== undefined) {
          v.vote = e.vote
          v.date = date
          added.push(v)
        } else {
          const obj = { login: e.login, mapId: map.id, date, vote: e.vote }
          voteArr.push(obj)
          updated.push(obj)
        }
      }
      void this.repo.add(...added)
      void this.repo.update(map.id, updated)
      this.updateMapVoteData(map.id, voteArr)
      Events.emit('KarmaVote', [...added, ...updated])
      return
    } else if (vote !== undefined) {
      const player = arg
      const v = voteArr.find(a => a.login === player.login)
      if (v?.vote === vote) {
        return // Return if same vote already exists
      }
      Logger.trace(`${Utils.strip(player?.nickname ?? player.login)} (${player.login}) has voted ${vote} for map ${Utils.strip(map.name)} (${map.id})`)
      if (v !== undefined) {
        v.date = date
        v.vote = vote
        void this.repo.update(map.id, player.login, vote, date)
        this.updateMapVoteData(map.id, voteArr)
        Events.emit('KarmaVote', [v])
        return
      }
      const obj = { login: player.login, mapId: map.id, date, vote }
      voteArr.push(obj)
      void this.repo.add(obj)
      this.updateMapVoteData(map.id, voteArr)
      Events.emit('KarmaVote', [obj])
    }
  }

  private static async updatePrefetch(): Promise<void> {
    const arr: { uid: string, votes: tm.Vote[] }[] = []
    const mapsToFetch: string[] = []
    const ids: string[] = [...MapService.history, MapService.current, ...MapService.queue].map(a => a.id)
    for (let i = 0; i < ids.length; i++) {
      const v = this._votes.find(a => a.uid === ids[i])
      if (v === undefined) {
        arr[i] = { uid: ids[i], votes: [] }
        mapsToFetch.push(ids[i])
      } else {
        arr[i] = v
      }
    }
    const res = await this.repo.get(...mapsToFetch)
    for (const e of mapsToFetch) {
      const entry = arr.find(a => a.uid === e)
      if (entry !== undefined) { entry.votes = res.filter(a => a.mapId === e) }
    }
    this._votes = arr
    Events.emit('VotesPrefetch', res)
  }

  private static updateMapVoteData(uid: string, arr: tm.Vote[]) {
    const count = arr.length
    MapService.setVoteData({ uid, count, ratio: this.calculateVoteRatio(arr) })
  }

  private static calculateVoteRatio(votes: tm.Vote[]): number {
    const values = {
      '-3': 0,
      '-2': 20,
      '-1': 40,
      '1': 60,
      '2': 80,
      '3': 100
    }
    const count = votes.length
    const sum = votes.map(a => values[a.vote.toString() as keyof typeof values]).reduce((acc, cur) => acc += cur, 0)
    return count === 0 ? 0 : sum / count
  }

  /**
   * Fetches all the player votes for a given map UID.
   * @param mapId Map UID
   * @returns Array of vote objects or undefined if map is not in the database
   */
  static async fetch(mapId: string): Promise<tm.Vote[] | undefined>
  /**
   * Fetches all the player votes for given map UIDs.
   * @param mapIds Array of Map UIDs
   * @returns Array of objects containing map UID and vote objects array.
   * If some map is not in the database it won't be in the returned array
   */
  static async fetch(mapIds: string[]): Promise<{ uid: string, votes: tm.Vote[] }[]>
  static async fetch(mapIds: string | string[]): Promise<tm.Vote[] | undefined | { uid: string, votes: tm.Vote[] }[]> {
    return await this.repo.get(mapIds as any)
  }

  /**
   * Gets all the player votes for given map UID from the runtime memory.
   * Only votes for maps in the history, queue and the current map are stored.
   * @param uid Map UID
   * @returns Array of vote objects or undefined if map is not in the memory
   */
  static get(uid: string): tm.Vote[] | undefined
  /**
   * Gets all the player votes for given map UIDs from the runtime memory.
   * Only votes for maps in the history, queue and the current map are stored.
   * @param uids Array of Map UIDs
   * @returns Array of objects containing map UID and vote objects array.
   * If some map is not in the memory it won't be in the returned array.
   */
  static get(uids: string[]): { uid: string, votes: tm.Vote[] }[]
  static get(uids: string | string[]): tm.Vote[] | undefined | { uid: string, votes: tm.Vote[] }[] {
    if (typeof uids === 'string') {
      return this._votes.find(a => a.uid === uids)?.votes
    }
    return this._votes.filter(a => uids.includes(a.uid))
  }

  /**
   * Current map votes.
   */
  static get current(): Readonly<tm.Vote>[] {
    return this._currentVotes
  }

  /**
   * Current map vote count.
   */
  static get currentCount(): number {
    return this._currentVotes.length
  }

  /**
   * All votes in runtime memory. Only votes for maps in the history, 
   * queue and the current map are stored.
   */
  static get votes(): Readonly<{ uid: string, votes: tm.Vote[] }>[] {
    return [...this._votes]
  }

}