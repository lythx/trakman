'use strict'
import { Client } from '../Client.js'
import { ChallengeRepository } from '../database/ChallengeRepository.js'
import { GameService } from './GameService.js'
import { ErrorHandler } from '../ErrorHandler.js'
import {TMXService} from './TMXService.js'

export class ChallengeService {
  private static _current: TMChallenge
  private static list: TMChallenge[]
  private static repo: ChallengeRepository

  static async initialize (repo: ChallengeRepository = new ChallengeRepository()): Promise<void> {
    this.list = []
    this.repo = repo
    await this.repo.initialize()
  }

  static get current (): TMChallenge {
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
    if(process.env.USE_TMX === 'YES') {
      await TMXService.fetchTrack(ChallengeService.current.id).catch((err: Error) => ErrorHandler.error(err.toString(), 'Either TMX is down or map is not on TMX'))
    }
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
    for (const c of challengeList) {
      const challenge: TMChallenge = { id: c.UId, name: c.Name, author: c.Author, environment: c.Environnement, laps: 1 }
      this.list.push(challenge) // they cant speak english ahjahahahahhaha
    }
    await this.setCurrent()
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
