'use strict'
import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { ChallengeService } from './ChallengeService.js'
import { Events } from '../Events.js'

export class RecordService {
  private static repo: RecordRepository
  private static _records: TMRecord[] = []
  private static _currentPlayerRecords: TMRecord[] = []

  static async initialize(repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async fetchRecords(challengeId: string): Promise<TMRecord[]> {
    this._currentPlayerRecords.length = 0
    this._records.length = 0
    const records = await this.repo.get(challengeId)
    records.sort((a, b) => a.score - b.score)
    for (let i = 0; i < 30 && i<records.length; i++)
      this._records.push({ challenge: records[i].challenge, score: records[i].score, login: records[i].login, date: records[i].date, checkpoints: records[i].checkpoints })
    for (const r of records) {
      if (PlayerService.players.some(a => a.login === r.login))
        this._currentPlayerRecords.push({ challenge: challengeId, score: r.score, login: r.login, date: r.date, checkpoints: r.checkpoints })
    }
    Events.emitEvent('Controller.LocalRecords', records)
    return this._currentPlayerRecords
  }

  static async fetchRecord(challengeId: string, login: string): Promise<TMRecord | null> {
    const res = (await this.repo.getByLogin(challengeId, login))?.[0]
    if (res == null)
      return null
    const record: TMRecord = { challenge: challengeId, score: res.score, login, date: res.date, checkpoints: res.checkpoints }
    this._currentPlayerRecords.push(record)
    return record
  }

  static get currentPlayerRecords(): TMRecord[] {
    return this._currentPlayerRecords
  }

  static get records(): TMRecord[] {
    return this._records
  }

  static async add(challenge: string, login: string, score: number): Promise<void> {
    const player = PlayerService.getPlayer(login)
    const cpAmount = ChallengeService.current.checkpointsAmount
    const checkpoints = [...player.checkpoints.map(a => a.time)]
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb = this.currentPlayerRecords.find(a => a.login === login)?.score
    if (pb == null) {
      const position = this._records.filter(a=>a.score<score).length + 1
      const recordInfo: RecordInfo = {
        challenge, login, score, date: new Date(), checkpoints, status: 'new',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position
      }
      if (this._records.some(a => a.score > score)) {
        this._records.push(recordInfo)
        this._records.sort((a, b) => a.score - b.score)
      }
      this._currentPlayerRecords.push(recordInfo)
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.add(recordInfo)
      return
    }
    if (score === pb) {
      const recordInfo: RecordInfo = {
        challenge, login, score, date: new Date(), checkpoints, status: 'equal',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position: -1
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      return
    }
    if (score < pb) {
      const position = this._records.filter(a=>a.score<score).length + 1
      const recordInfo: RecordInfo = {
        challenge, login, score, date: new Date(), checkpoints, status: 'improved',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position
      }
      if (this._records.some(a => a.score > score)) {
        this._records = this._records.filter(a => a.login != login)
        this._records.push(recordInfo)
        this._records.sort((a, b) => a.score - b.score)
      }
      this._currentPlayerRecords = this._currentPlayerRecords.filter(a => a.login !== login)
      this._currentPlayerRecords.push(recordInfo)
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.update(recordInfo)
    }
  }
}

