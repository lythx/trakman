import { Events } from "../Events.js";
import { VoteRepository } from "../database/VoteRepository.js";
import { MapService } from "./MapService.js";
import { Logger } from "../Logger.js";
import { Client } from "../client/Client.js";

export abstract class VoteService {

  private static readonly repo: VoteRepository = new VoteRepository()
  private static _votes: { uid: string, votes: TMVote[] }[] = []
  private static readonly prefetchCount: number = 4

  /**
   * Disables CallVotes on dedicated server, fetches votes for current and next maps
   */
  static async initialize(): Promise<void> {
    Client.callNoRes('SetCallVoteTimeout', [{ int: 0 }])
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
    const res: TMVote[] = await this.repo.get(newId)
    this._votes.unshift({ uid: newId, votes: res })
    this._votes.length = Math.min(this._votes.length, this.prefetchCount * 2 + 1)
  }

  /**
   * Adds a vote on the current map to runtime memory and database
   * @param login Player login
   * @param vote Vote value 
   */
  static async add(login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): Promise<void> {
    const date: Date = new Date()
    const map = MapService.current
    const voteArr = this._votes.find(a => a.uid === map.id)?.votes
    if (voteArr === undefined) { return }
    const v = voteArr?.find(a => a.login === login)
    if (v?.vote === vote) {
      return // Return if same vote already exists
    }
    Logger.trace(`Player ${login} voted ${vote} for map ${map.id}`)
    if (v !== undefined) {
      v.date = date
      v.vote = vote
      void this.repo.update(map.id, login, vote, date)
      Events.emitEvent('Controller.KarmaVote', v)
      return
    }
    const obj = { login, mapId: map.id, date, vote }
    voteArr.push(obj)
    void this.repo.add(obj)
    Events.emitEvent('Controller.KarmaVote', obj)
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