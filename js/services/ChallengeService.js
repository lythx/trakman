import client from '../Client.js'
import Error from '../Error.js'
import ChallengeRepository from '../database/ChallengeRepository.js'

class ChallengeService {
  #list = null
  #repo

  constructor () {
    this.#repo = new ChallengeRepository()

  }

  async #getList () {
    this.#list = await client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ]).catch(err => { Error.fatal('Error while fetching challenges', err, 1) })
  }

  async push () {
    if(this.#list === null) await this.#getList()
    this.#repo.add(this.#list)
  }
}

export default ChallengeService