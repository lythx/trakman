'use strict'
import { randomUUID } from 'crypto'
import RecordRepository from '../database/RecordRepository.js'
import Chat from '../plugins/Chat.js'

export class RecordService {
  #repo: RecordRepository

  constructor () {
    this.#repo = new RecordRepository()
  }

  async initialize () {
    await this.#repo.initialize()
  }

  async add (challenge: string, login: string, score: number, checkpoints: number[]) {
    const record = new Record(challenge, login, score, checkpoints)
    const res = await this.#repo.add(record)
    if (res?.rows?.[0].id) {
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

  get challenge () {
    return this._challenge
  }

  get login () {
    return this._login
  }

  get score () {
    return this._score
  }

  get checkpoints () {
    return this._checkpoints
  }

  get date () {
    return this._date
  }
}