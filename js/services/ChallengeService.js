'use strict'
import Client from '../Client.js'
import Error from '../Error.js'
import ChallengeRepository from '../database/ChallengeRepository.js'

class ChallengeService {
  #list = null
  #repo

  constructor () {
    this.#repo = new ChallengeRepository()
  }

  async initialize () {
    await this.#repo.initialize()
  }

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  async #getList () {
    const rawList = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ]).catch(err => { Error.fatal('Error fetching challenges', err) })
    this.#list = rawList.map(challenge => ChallengeService.#deserialise(challenge))
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

  /**
   * Retrieve a challenge from whatever mess TM sends us
   * @param object
   * @returns {Challenge}
   */
  static #deserialise (object) {
    const c = object.member
    return new Challenge(c[0].value[0].string, c[1].value[0].string, c[4].value[0].string, c[3].value[0].string)
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
