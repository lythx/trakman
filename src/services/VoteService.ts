import { Events } from "../Events.js";
import { VoteRepository } from "../database/VoteRepository.js";
import { JukeboxService } from "./JukeboxService.js";
import { MapService } from "./MapService.js";
import { Logger } from "../Logger.js";

export abstract class VoteService {

  private static readonly repo: VoteRepository = new VoteRepository()
  private static readonly _voteRatios: { readonly mapId: string, ratio: number, amount: number }[] = []
  private static _votes: TMVote[] = []
  private static readonly mapsWithVotesStored: string[] = []
  private static readonly voteValues = [0, 20, 40, -1, 60, 80, 100]

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    const res: TMVote[] = await this.repo.getAll()
    const maps: { readonly mapId: string, votes: number[] }[] = []
    for (const e of res) {
      const map = maps.find(a => a.mapId === e.mapId)
      if (map === undefined) {
        maps.push({ mapId: e.mapId, votes: [e.vote] })
      } else {
        map.votes.push(e.vote)
      }
    }
    for (const e of MapService.maps) {
      const m = maps.find(a => a.mapId === e.id)
      if (m === undefined) {
        this._voteRatios.push({ mapId: e.id, ratio: 0, amount: 0 })
      } else {
        const amount: number = m.votes.length
        const sum: number = m.votes.map(a => this.voteValues[a + 3]).reduce((acc, cur): number => acc + cur, 0)
        const ratio: number = sum / amount
        this._voteRatios.push({ mapId: m.mapId, ratio, amount })
      }
    }
    for (let i: number = 0; i < 4; i++) {
      const id = [JukeboxService.current, ...JukeboxService.queue][i].id
      this.mapsWithVotesStored.push(id)
      this._votes.push(...res.filter(a => a.mapId === id))
    }
  }

  static get votes(): TMVote[] {
    return [...this._votes]
  }

  static get voteRatios(): { readonly mapId: string, ratio: number, amount: number }[] {
    return [...this._voteRatios]
  }

  static async nextMap(): Promise<void> {
    const id = JukeboxService.queue[2].id
    const res: TMVote[] = await this.repo.get(id)
    this.mapsWithVotesStored.push(id)
    this.mapsWithVotesStored.shift()
    this._votes.push(...res)
    this._votes = this._votes.filter(a => this.mapsWithVotesStored.includes(a.mapId))
    Logger.debug(this._voteRatios.find(a => a.mapId === id)?.toString() ?? '', JSON.stringify(this._votes, null, 2))
  }

  static async fetch(mapId: string): Promise<TMVote[]> {
    if (this._votes.some(a => a.mapId === mapId)) {
      return this._votes.filter(a => a.mapId === mapId)
    }
    return await this.repo.get(mapId)
  }

  static async add(mapId: string, login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): Promise<void> {
    if (this._votes.find(a => a.login === login && a.vote === vote && a.mapId === mapId)) {
      return // Return if same vote already exists
    }
    Logger.trace(`Player ${login} voted ${vote} for map ${mapId}`)
    const date: Date = new Date()
    const v: TMVote | undefined = this._votes.find(a => a.mapId === mapId && a.login === login)
    if (v !== undefined) { // If previous vote is in memory
      v.date = date
      v.vote = vote
      await this.updateVoteRatio(mapId)
      void this.repo.update(mapId, login, vote, date)
      Events.emitEvent('Controller.KarmaVote', v as KarmaVoteInfo)
    } else {
      const res: TMVote | undefined = await this.repo.getByLogin(mapId, login)
      if (res === undefined) { // If previous vote doesn't exist
        void this.repo.add({ mapId, login, vote, date })
        if (this.mapsWithVotesStored.includes(mapId)) {
          void this._votes.push({ login, mapId, vote, date })
        }
        await this.updateVoteRatio(mapId)
        Events.emitEvent('Controller.KarmaVote', { mapId, login, vote, date } as KarmaVoteInfo)
      } else { // If previous vote is in the db
        void this.repo.update(mapId, login, vote, date)
        if (this.mapsWithVotesStored.includes(mapId)) { // Push if map votes are in memory
          this._votes.push({ login, mapId, vote, date })
        }
        await this.updateVoteRatio(mapId)
        Events.emitEvent('Controller.KarmaVote', { mapId, login, vote, date } as KarmaVoteInfo)
      }
    }
  }

  private static async updateVoteRatio(mapId: string) {
    const ratio = this._voteRatios.find(a => a.mapId === mapId)
    if (ratio === undefined) {
      return
    }
    const mapVotes = this._votes.filter(a => a.mapId === mapId)
    if (this.mapsWithVotesStored.includes(mapId)) {
      const amount: number = mapVotes.length
      const sum: number = mapVotes.map(a => this.voteValues[a.vote + 3]).reduce((acc, cur): number => acc + cur, 0)
      ratio.ratio = sum / amount
    } else {
      const res = await this.repo.get(mapId)
      const amount: number = res.length
      const sum: number = res.map(a => this.voteValues[a.vote + 3]).reduce((acc, cur): number => acc + cur, 0)
      ratio.ratio = sum / amount
    }
  }

}