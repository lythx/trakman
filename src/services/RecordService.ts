'use strict'
import { randomUUID } from 'crypto'
import { RecordRepository } from '../database/RecordRepository.js'
import { Player, PlayerService } from './PlayerService.js'
import { ErrorHandler } from '../ErrorHandler.js'
import { Events } from '../Events.js'

export class RecordService {
  private static repo: RecordRepository
  private static readonly _records: TMRecord[] = []

  static async initialize (repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async fetchRecords (challengeId: string): Promise<TMRecord[]> {
    const records = await this.repo.get(challengeId)
    this._records.push(...records.map(r => new TMRecord(r.challenge, r.login, r.score, r.checkpoints, r.id, r.date)))
    return this._records
  }

  static get records (): TMRecord[] {
    return this._records
  }

  static async add (challenge: string, login: string, score: number): Promise<void> {
    let player: Player
    try {
      player = PlayerService.getPlayer(login)
    } catch (e: any) {
      ErrorHandler.error(e.message.toString())
      return
    }
    const record = new TMRecord(challenge, login, score, player.checkpoints.map(c => c.time))
    const res = await this.repo.add(record)
    let status = ''
    if (res?.rows?.[0].id != null) {
      record.id = res.rows[0].id
      // add or replace the player's current record on this track
      const existing = this._records.findIndex(r => r.login === login && r.challenge === challenge)
      if (existing === -1) {
        this._records.push(record)
        status = ' got the '
      } else {
        this._records[existing] = record
        status = ' improved their '
      }
    } else if (res === 'equal') {
      status = ' equaled their '
    }
    if (status !== '') {
      Events.emitEvent('Controller.PlayerRecord', [record, status])
    }
  }
}

export class TMRecord {
  public id: string
  private readonly _challenge: string
  private readonly _login: string
  private readonly _score: number
  public date: Date
  private readonly _checkpoints: number[]

  constructor (challenge: string, login: string, score: number, checkpoints: number[], id: string = randomUUID(), date: Date = new Date()) {
    this.id = id
    this._challenge = challenge
    this._login = login
    this._score = score
    this._checkpoints = checkpoints
    this.date = date
  }

  get challenge (): string {
    return this._challenge
  }

  get login (): string {
    return this._login
  }

  get score (): number {
    return this._score
  }

  get checkpoints (): number[] {
    return this._checkpoints
  }
}
