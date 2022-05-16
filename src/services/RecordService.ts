'use strict'
import { randomUUID } from 'crypto'
import { RecordRepository } from '../database/RecordRepository.js'

export class RecordService {
  private static repo: RecordRepository

  static async initialize (repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async add (challenge: string, login: string, score: number, checkpoints: number[]): Promise<void> {
    const record = new TMRecord(challenge, login, score, checkpoints)
    const res = await this.repo.add(record)
    if (res?.rows?.[0].id != null) {
      record.id = res.rows[0].id
    }
  }
}

export class TMRecord {
  public id: string
  private readonly _challenge: string
  private readonly _login: string
  private readonly _score: number
  private readonly _date: Date
  private readonly _checkpoints: number[]

  constructor (challenge: string, login: string, score: number, checkpoints: number[]) {
    this.id = randomUUID()
    this._challenge = challenge
    this._login = login
    this._score = score
    this._checkpoints = checkpoints
    this._date = new Date()
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

  get date (): Date {
    return this._date
  }
}
