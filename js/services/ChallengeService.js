'use strict'
import Client from '../Client.js'
import Error from '../Error.js'
import ChallengeRepository from '../database/ChallengeRepository.js'

class ChallengeService {
  #list = null
  #repo

  async initialize () {
    this.#repo = await new ChallengeRepository()
  }

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  async #getList () {
    const challengeList = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ]).catch(err => { Error.fatal('Error fetching challenges', err) })
    this.#list = []
    for (const challenge of challengeList) {
      this.#list.push(new Challenge(challenge.UId, challenge.Name, challenge.Author, challenge.Environnement)) // they cant speak english ahjahahahahhaha
    }
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  async push () {
    if (this.#list === null) await this.#getList()
    await this.#repo.add(this.#list)
  }
}

class Challenge {
  #id
  #name
  #author
  #environment

  constructor (id, name, author, environment) {
    this.#id = id
    this.#name = name
    this.#author = author
    this.#environment = environment
  }

  get id () {
    return this.#id
  }

  get name () {
    return this.#name
  }

  get author () {
    return this.#author
  }

  get environment () {
    return this.#environment
  }
}

export default ChallengeService
