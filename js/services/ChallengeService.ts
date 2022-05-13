'use strict'
import {Client} from '../Client.js'
import {ChallengeRepository} from '../database/ChallengeRepository.js'

export class ChallengeService {
  private static list: Challenge[]
  private static repo = new ChallengeRepository()

  static async initialize () {
    await this.repo.initialize()
  }

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  private static async getList () {
    const challengeList = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ])
    if(!challengeList) {
      return Promise.reject('Error fetching challenges from TM server.')
    }
    this.list = []
    for (const challenge of challengeList) {
      this.list.push(new Challenge(challenge.UId, challenge.Name, challenge.Author, challenge.Environnement)) // they cant speak english ahjahahahahhaha
    }
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  static async push () {
    if (!this.list) await this.getList()
    await this.repo.add(this.list)
  }
}

export class Challenge {
  private readonly _id
  private readonly _name
  private readonly _author
  private readonly _environment

  constructor (id: any, name: any, author: any, environment: any) {
    this._id = id
    this._name = name
    this._author = author
    this._environment = environment
  }

  get id () {
    return this._id
  }

  get name () {
    return this._name
  }

  get author () {
    return this._author
  }

  get environment () {
    return this._environment
  }
}
