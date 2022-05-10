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

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  async #getList () {
    this.#list = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ]).catch(err => { Error.fatal('Error fetching challenges', err) })
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  async push () {
    if (this.#list === null) await this.#getList()
    this.#repo.add(this.#list)
  }
}

export default ChallengeService
