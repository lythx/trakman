'use strict'
import { randomUUID } from 'crypto'
import { RecordRepository } from '../database/RecordRepository.js'
import { Player, PlayerService } from './PlayerService.js'
import { ErrorHandler } from '../ErrorHandler.js'

export class RecordService {
  private static readonly repo = new RecordRepository()

  static async initialize (): Promise<void> {
    await this.repo.initialize()
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
