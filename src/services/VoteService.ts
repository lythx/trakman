import { Events } from "../Events.js"
import { VoteRepository } from "../database/VoteRepository.js"
import { MapService } from "./MapService.js"
import { Logger } from "../Logger.js"
import { Utils } from '../Utils.js'

export abstract class VoteService {

  private static readonly repo: VoteRepository = new VoteRepository()
  private static _votes: { uid: string, votes: TMVote[] }[] = []
  private static readonly prefetchCount: number = 4

  /**
   * Fetches votes for current and next maps
   */
  static async initialize(): Promise<void> {
    await this.repo.initialize()
    const res: TMVote[] = await this.repo.getAll()
    const maps = [MapService.current, ...MapService.queue]
    for (let i: number = 0; i < this.prefetchCount + 1; i++) {
      const uid: string = maps[i].id
      this._votes.unshift({ uid, votes: res.filter(a => a.mapId === uid) })
    }
  }

  /**
   * Fetches new map and deletes the last map in array from memory
   */
  static async nextMap(): Promise<void> {
    const newId: string = MapService.queue[this.prefetchCount - 1].id
    if (this._votes.some(a => a.uid === newId)) { return }
    const res: TMVote[] = await this.repo.get(newId)
    this._votes.unshift({ uid: newId, votes: res })
    this._votes.length = Math.min(this._votes.length, this.prefetchCount * 2 + 1)
  }

  /**
   * Adds a vote on the current map to runtime memory and database
   * @param player Player object
   * @param vote Vote value 
   */
  static async add(player: { login: string, nickname: string }, vote: -3 | -2 | -1 | 1 | 2 | 3): Promise<void> {
    const date: Date = new Date()
    const map = MapService.current
    const voteArr = this._votes.find(a => a.uid === map.id)?.votes
    if (voteArr === undefined) { return }
    const v = voteArr?.find(a => a.login === player.login)
    if (v?.vote === vote) {
      return // Return if same vote already exists
    }
    Logger.trace(`${Utils.strip(player.nickname)} (${player.login}) has voted ${vote} for map ${Utils.strip(map.name)} (${map.id})`)
    if (v !== undefined) {
      v.date = date
      v.vote = vote
      void this.repo.update(map.id, player.login, vote, date)
      this.updateMapVoteData(map.id, voteArr)
      Events.emitEvent('Controller.KarmaVote', v)
      return
    }
    const obj = { login: player.login, mapId: map.id, date, vote }
    voteArr.push(obj)
    void this.repo.add(obj)
    this.updateMapVoteData(map.id, voteArr)
    Events.emitEvent('Controller.KarmaVote', obj)
  }

  static async updatePrefetch(): Promise<void> {
    const arr: { uid: string, votes: TMVote[] }[] = []
    const mapsToFetch: string[] = []
    const maps = [...MapService.history, MapService.current, ...MapService.queue].reverse()
    for (let i = 0; i < maps.length; i++) {
      const uid: string = maps[i].id
      const v = this._votes.find(a => a.uid === uid)
      if (v === undefined) {
        arr[i] = { uid, votes: [] }
        mapsToFetch.push(uid)
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
    Events.emitEvent('Controller.VotesPrefetch', res)
  }

  private static updateMapVoteData(uid: string, arr: TMVote[]) {
    const count = arr.length
    const sum = arr.reduce((acc, cur) => acc += cur.vote, 0)
    MapService.setVoteData({ uid, count, ratio: count === 0 ? 0 : (((sum / count) + 3) / 6) * 100 })
  }

  static async fetch(mapId: string): Promise<TMVote[] | undefined>
  static async fetch(mapIds: string[]): Promise<{ uid: string, votes: TMVote[] }[]>
  static async fetch(mapIds: string | string[]): Promise<TMVote[] | undefined | { uid: string, votes: TMVote[] }[]> {
    return await this.repo.get(mapIds as any)
  }

  static get(uid: string): TMVote[] | undefined
  static get(uids: string[]): { uid: string, votes: TMVote[] }[]
  static get(uids: string | string[]): TMVote[] | undefined | { uid: string, votes: TMVote[] }[] {
    if (typeof uids === 'string') {
      return this._votes.find(a => a.uid === uids)?.votes
    }
    return this._votes.filter(a => uids.includes(a.uid))
  }

  static get current(): TMVote[] {
    return this._votes.find(a => a.uid === MapService.current.id)?.votes ?? []
  }

  static get currentCount(): number {
    return this._votes.find(a => a.uid === MapService.current.id)?.votes?.length ?? 0
  }

  static get votes(): { uid: string, votes: TMVote[] }[] {
    return [...this._votes]
  }

}