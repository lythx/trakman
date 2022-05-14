'use strict'
import { randomUUID } from 'crypto'
import { RecordRepository } from '../database/RecordRepository.js'
import { Chat } from '../plugins/Chat.js'

export class RecordService {
  private static readonly repo = new RecordRepository()

  static async initialize (): Promise<void> {
    await this.repo.initialize()
  }

  static async add (challenge: string, login: string, score: number, checkpoints: number[]): Promise<void> {
    const record = new Record(challenge, login, score, checkpoints)
    const res = await this.repo.add(record)
    if (res?.rows?.[0].id != null) {
      record.id = res.rows[0].id
      Chat.newLocalRecord(login)
    }
  }
}

export class Record {
  public id: string
  private readonly _challenge: string
  private readonly _login: string
  private readonly _score: number
  private readonly _date: number
  private readonly _checkpoints: number[]

  constructor (challenge: string, login: string, score: number, checkpoints: number[]) {
    this.id = randomUUID()
    this._challenge = challenge
    this._login = login
    this._score = score
    this._checkpoints = checkpoints
    this._date = Date.now()
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

  get date (): number {
    return this._date
  }
}
