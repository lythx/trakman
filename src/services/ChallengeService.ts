'use strict'
import { Client } from '../Client.js'
import { ChallengeRepository } from '../database/ChallengeRepository.js'
import { ErrorHandler } from '../ErrorHandler'

export class ChallengeService {
  private static list: Challenge[]
  private static repo: ChallengeRepository

  static async initialize (repo: ChallengeRepository = new ChallengeRepository()): Promise<void> {
    this.list = []
    this.repo = repo
    await this.repo.initialize()
  }

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  private static async getList (): Promise<void> {
    this.list = []
    let challengeList
    try {
      challengeList = await Client.call('GetChallengeList', [
        { int: 5000 }, { int: 0 }
      ])
    } catch (e) {
      challengeList = null
    }
    if (challengeList == null) {
      throw Error('Error fetching challenges from TM server.')
    }
    for (const challenge of challengeList) {
      this.list.push(new Challenge(challenge.UId, challenge.Name, challenge.Author, challenge.Environnement)) // they cant speak english ahjahahahahhaha
    }
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  static async push (): Promise<void> {
    if (this.list == null || this.list.length === 0) {
      try {
        await this.getList()
      } catch (e: any) {
        ErrorHandler.error(e.message.toString())
        return
      }
    }
    await this.repo.add(this.list)
  }
}

export class Challenge {
  private readonly _id
  private readonly _name
  private readonly _author
  private readonly _environment

  constructor (id: string, name: string, author: string, environment: string) {
    this._id = id
    this._name = name
    this._author = author
    this._environment = environment
  }

  get id (): string {
    return this._id
  }

  get name (): string {
    return this._name
  }

  get author (): string {
    return this._author
  }

  get environment (): string {
    return this._environment
  }
}
