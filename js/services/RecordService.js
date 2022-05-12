'use strict'
import { randomUUID } from 'crypto'
import RecordRepository from '../database/RecordRepository.js'
import Chat from '../plugins/Chat.js'

class RecordService {
  #repo

  constructor () {
    this.#repo = new RecordRepository()
  }

  async initialize () {
    await this.#repo.initialize()
  }

  async add (challenge, login, score, checkpoints) {
    const record = new Record(challenge, login, score, checkpoints)
    const res = await this.#repo.add(record)
    if (res.rows?.[0]?.id) {
      record.id = res.rows[0].id
      Chat.newLocalRecord(login)
    }
  }
}

class Record {
  id
  #challenge
  #login
  #score
  #date
  #checkpoints

  constructor (challenge, login, score, checkpoints) {
    this.id = randomUUID()
    this.#challenge = challenge
    this.#login = login
    this.#score = score
    this.#checkpoints = checkpoints
    this.#date = new Date()
  }

  get challenge () {
    return this.#challenge
  }

  get login () {
    return this.#login
  }

  get score () {
    return this.#score
  }

  get checkpoints () {
    return this.#checkpoints
  }

  get date () {
    return this.#date
  }
}

export default RecordService
