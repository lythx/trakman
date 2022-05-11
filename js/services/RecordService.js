'use strict'

import RecordRepository from '../database/RecordRepository.js'

class RecordService {
  #list = []
  #repo

  constructor () {
    this.#repo = new RecordRepository()
  }

  async initialize () {
    await this.#repo.initialize()
  }
}

class Record {
  #id
  #challenge
  #login
  #score
  #date
  #checkpoints

  constructor (id, challenge, login, score, checkpoints) {
    this.#id = id
    this.#challenge = challenge
    this.#login = login
    this.#score = score
    this.#checkpoints = checkpoints
    this.#date = new Date()
  }
}

export default RecordService
