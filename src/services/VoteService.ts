import { VoteRepository } from "../database/VoteRepository.js";
import { JukeboxService } from "./JukeboxService.js";
import { ManiakarmaService } from './ManiakarmaService.js'

export abstract class VoteService {

  private static repo: VoteRepository
  private static readonly _voteRatios: { readonly mapId: string, ratio: number }[] = []
  private static _votes: TMVote[] = []

  static async initialize(): Promise<void> {
    this.repo = new VoteRepository()
    await this.repo.initialize()
    const res: any[] = await this.repo.getAll()
    const maps: { readonly mapId: string, votes: number[] }[] = []
    for (const e of res) {
      const map = maps.find(a => a.mapId === e.map)
      if (map === undefined) {
        maps.push({ mapId: e.map, votes: [e.vote] })
      } else {
        map.votes.push(e.vote)
      }
    }
    for (const e of maps) {
      const amount: number = e.votes.length
      const sum: number = e.votes.reduce((acc, cur): number => acc + cur)
      const ratio: number = ((sum / amount) / 6) + 1
      this._voteRatios.push({ mapId: e.mapId, ratio })
    }
    for (let i: number = 0; i < 4; i++) {
      const res: any[] = await this.repo.get([JukeboxService.current, ...JukeboxService.queue][i].id)
      for (const e of res) {
        this._votes.push({ mapId: e.map, login: e.login, vote: e.vote, date: e.date })
      }
    }
  }

  static get votes(): TMVote[] {
    return [...this._votes]
  }

  static get voteRatios() {
    return [...this._voteRatios]
  }

  static async nextMap(): Promise<void> {
    const res: any[] = await this.repo.get(JukeboxService.queue[2].id)
    for (const e of res) {
      this._votes.push({ mapId: e.map, login: e.login, vote: e.vote, date: e.date })
    }
    const valid: TMMap[] = [JukeboxService.current]
    for (let i: number = 0; i < 3; i++) {
      valid.push(JukeboxService.previous[i])
      valid.push(JukeboxService.queue[i])
    }
    this._votes = this._votes.filter(a => valid.some(b => b.id === a.mapId))
  }
  static async fetch(mapId: string): Promise<any[]> {
    if (this._votes.some(a => a.mapId === mapId)) {
      return [...this._votes.filter(a => a.mapId === mapId)]
    }
    const res: any[] = await this.repo.get(mapId)
    const ret: TMVote[] = []
    for (const e of res) {
      ret.push({ mapId: e.map, login: e.login, vote: e.vote, date: e.date })
    }
    return res
  }

  static async add(mapId: string, login: string, vote: number): Promise<void> {
    if (this._votes.find(a => a.login === login && a.vote === vote && a.mapId === mapId)) {
      return // Return if same vote already exists
    }
    const date: Date = new Date()
    const v: TMVote | undefined = this._votes.find(a => a.mapId === mapId && a.login === login)
    if (v !== undefined) {
      v.date = date
      v.vote = vote
      void this.repo.update(mapId, login, vote, date)
    } else {
      const res: any[] = await this.repo.getOne(mapId, login)
      if (res.length === 0) {
        void this.repo.add(mapId, login, vote, date)
        if (this._votes.some(a => a.mapId === mapId)) {
          void this._votes.push({ login, mapId, vote, date })
        }
      } else {
        if (res[0].vote !== vote) {
          void this.repo.update(mapId, login, vote, date)
          if (this._votes.some(a => a.mapId === mapId)) {
            void this._votes.push({ login, mapId, vote, date })
          }
        }
      }
    }
  }

}