'use strict'
import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { ChallengeService } from './ChallengeService.js'
import { Events } from '../Events.js'

export class RecordService {
  private static repo: RecordRepository
  private static _records: TMRecord[] = []

  static async initialize(repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async fetchRecords(challengeId: string): Promise<TMRecord[]> {
    this._records.length = 0
    const records = await this.repo.get(challengeId)
    records.sort((a, b) => a.score - b.score)
    for (const r of records) {
      this._records.push({ challenge: challengeId, score: r.score, login: r.login, date: r.date, checkpoints: r.checkpoints })
    }
    console.log('fetch')
    console.log(records)
    Events.emitEvent('Controller.LocalRecords', records)
    return this._records
  }

  static async fetchRecord(challengeId: string, login: string): Promise<TMRecord | null> {
    const res = (await this.repo.getByLogin(challengeId, login))?.[0]
    if (res == null)
      return null
    const record: TMRecord = { challenge: challengeId, score: res.score, login, date: res.date, checkpoints: res.checkpoints }
    return record
  }

  static get records(): TMRecord[] {
    return this._records
  }

  static async add(challenge: string, login: string, score: number): Promise<void> {
    const date = new Date()
    const player = PlayerService.getPlayer(login)
    const cpAmount = ChallengeService.current.checkpointsAmount
    const checkpoints = [...player.checkpoints.map(a => a.time)]
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb = this._records.find(a => a.login === login)?.score
    const position = this._records.filter(a=>a.score<score).length + 1
    console.log(position, pb, score)
    if (pb == null) {
      const recordInfo: RecordInfo = {
        challenge, login, score, date, checkpoints, status: 'new',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position
      }
      console.log(position -1)
      console.log(this._records)
      this._records.splice(position - 1, 0, {challenge, login, score, date, checkpoints})
      console.log('new')
      console.log(this._records)
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.add(recordInfo)
      return
    }
    if (score === pb) {
      const recordInfo: RecordInfo = {
        challenge, login, score, date, checkpoints, status: 'equal',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      return
    }
    if (score < pb) {
      const recordInfo: RecordInfo = {
        challenge, login, score, date, checkpoints, status: 'improved',
        nickName: player.nickName, nation: player.nation, nationCode: player.nationCode,
        timePlayed: player.timePlayed, joinTimestamp: player.joinTimestamp, wins: player.wins,
        privilege: player.privilege, visits: player.visits, position
      }
      this._records = this._records.filter(a => a.login != login)
      console.log(position -1)
      console.log(this._records)
      this._records.splice(position - 1, 0, {challenge, login, score, date, checkpoints})
      console.log('improved')
      console.log(this._records)
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.update(recordInfo)
    }
  }
}

