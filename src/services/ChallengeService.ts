'use strict'
import { Client } from '../Client.js'
import { ChallengeRepository } from '../database/ChallengeRepository.js'
import { GameService } from './GameService.js'
import { ErrorHandler } from '../ErrorHandler.js'

export class ChallengeService {
  private static _current: Challenge
  private static list: Challenge[]
  private static readonly repo = new ChallengeRepository()

  static async initialize (): Promise<void> {
    await this.repo.initialize()
  }

  static get current (): Challenge {
    return this._current
  }

  static async setCurrent (): Promise<void> {
    const info = (await Client.call('GetCurrentChallengeInfo'))[0]
    if (info.UId == null) {
      ErrorHandler.error('Unable to retrieve current challenge info.')
      return
    }
    const curr = this.list.find(c => c.id === info.UId)
    if (curr === undefined) {
      ErrorHandler.error('Unable to find current challenge in challenge list.')
      return
    }
    this._current = curr
    // If the game mode can have laps (Rounds, Team, Cup), get the number of laps
    if ([0, 2, 5].includes(GameService.gameMode) && info.LapRace as boolean) {
      this._current.laps = info.NbLaps
    }
  }

  /**
   * Download all the challenges from the server and store them in a field
   * @returns {Promise<void>}
   */
  private static async getList (): Promise<void> {
    const challengeList = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ])
    if (challengeList == null) {
      throw Error('Error fetching challenges from TM server.')
    }
    this.list = []
    for (const challenge of challengeList) {
      this.list.push(new Challenge(challenge.UId, challenge.Name, challenge.Author, challenge.Environnement)) // they cant speak english ahjahahahahhaha
    }
    await this.setCurrent()
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  static async push (): Promise<void> {
    if (this.list == null) await this.getList()
    await this.repo.add(this.list)
  }
}

export class Challenge {
  private readonly _id
  private readonly _name
  private readonly _author
  private readonly _environment
  public laps = 1

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
