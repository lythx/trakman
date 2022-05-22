'use strict'
import { Client } from '../Client.js'
import { ChallengeRepository } from '../database/ChallengeRepository.js'
import { ErrorHandler } from '../ErrorHandler.js'
import { TMXService } from './TMXService.js'

export class ChallengeService {
  private static _current: TMChallenge
  private static list: ChallengeInfo[]
  private static repo: ChallengeRepository

  static async initialize (repo: ChallengeRepository = new ChallengeRepository()): Promise<void> {
    this.list = []
    this.repo = repo
    await this.repo.initialize()
    await this.push()
    await this.setCurrent()
  }

  static get current (): TMChallenge {
    return this._current
  }

  /**
   * Sets the current challenge.
   */
  static async setCurrent (): Promise<void> {
    let info
    try {
      info = (await Client.call('GetCurrentChallengeInfo'))[0]
      if (info.UId == null) {
        throw Error('Challenge id is undefined')
      }
    } catch (e: any) {
      ErrorHandler.error('Unable to retrieve current challenge info.', e.message)
      return
    }
    this._current = {
      id: info.UId,
      name: info.Name,
      author: info.Author,
      environment: info.Environnement,
      mood: info.Mood,
      bronzeTime: info.BronzeTime,
      silverTime: info.SilverTime,
      goldTime: info.GoldTime,
      authorTime: info.AuthorTime,
      copperPrice: info.CopperPrice,
      lapRace: info.LapRace,
      lapsAmount: info.NbLaps,
      checkpointsAmount: info.NbCheckpoints
    }
    if (process.env.USE_TMX === 'YES') {
      await TMXService.fetchTrackInfo(ChallengeService.current.id).catch((err: Error) => ErrorHandler.error(err.toString(), 'Either TMX is down or map is not on TMX'))
    }
  }

  /**
   * Download all the challenges from the server and store them in a field
   */
  private static async getList (): Promise<void> {
    this.list = []
    let challengeList
    try {
      challengeList = await Client.call('GetChallengeList', [
        { int: 5000 }, { int: 0 }
      ])
    } catch (e: any) {
      ErrorHandler.error('Error getting challenge list', e.message)
      challengeList = []
    }
    for (const c of challengeList) {
      const challenge: ChallengeInfo = {
        id: c.UId,
        name: c.Name,
        author: c.Author,
        environment: c.Environnement
      }
      this.list.push(challenge) // they cant speak english ahjahahahahhaha
    }
  }

  /**
   * Put all the challenges in the list in the database
   * If the list is empty, put the challenges there
   * @returns {Promise<void>}
   */
  static async push (): Promise<void> {
    if (this.list == null) {
      ErrorHandler.error('Challenge list is null, was initialize() called before pushing?')
      this.list = []
    }
    await this.getList()
    if (this.list === []) {
      ErrorHandler.error('Challenge list is empty, no need to push to database.')
      return
    }
    await this.repo.add(...this.list)
  }

  static async add (id: string, name: string, author: string, environment: string): Promise<void> {
    await this.repo.add({ id: id, name: name, author: author, environment: environment })
  }
}
