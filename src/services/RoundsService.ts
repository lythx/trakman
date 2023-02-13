import { PlayerService } from './PlayerService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import config from '../../config/Config.js'

export class RoundsService {

  private static teamsRoundPoints?: number
  private static _teamScores: { blue: number; red: number } = { blue: 0, red: 0 }
  private static _roundsPointSystem: number[] = []
  private static _roundsPointsLimit: number
  private static _teamsPointsLimit: number
  private static teamMaxPoints: number // TODO FIND OUT WHAT IS THIS
  private static _ranking: tm.Player[]
  private static readonly _roundRecords: tm.FinishInfo[] = []
  private static noRoundFinishes = true
  private static finishedRounds = 0
  private static roundFinishCount = 0

  /**
   * Fetches and stores records on the current map and ranks of all online players on maps in current MatchSettings
   */
  static async initialize(): Promise<void> {
    const status = await this.updateRoundsSettings()
    if (status instanceof Error) {
      Logger.fatal(status.message)
    }
    const ranking = await Client.call('GetCurrentRanking', [{ int: 250 }, { int: 0 }])
    const playerList = PlayerService.players as tm.Player[]
    this._ranking = []
    for (const e of ranking) {
      const player = playerList.find(a => e.Login === a.login)
      if (player !== undefined) {
        player.roundsPoints = e.Score
        this._ranking.push(player)
      }
    }
    for (const e of playerList) {
      if (!this._ranking.some(a => a.login === e.login)) {
        this._ranking.push(e)
      }
    }
    Events.addListener('GameConfigChanged', () => {
      const status = this.updateRoundsSettings()
      if (status instanceof Error) {
        Logger.error(status.message)
      }
    })
  }

  static async updateRoundsSettings(): Promise<true | Error> {
    const settings = await Client.call('system.multicall', [
      { method: 'GetRoundCustomPoints' },
      { method: 'GetRoundPointsLimit' },
      { method: 'GetTeamPointsLimit' },
      { method: 'GetMaxPointsTeam' }])
    if (settings instanceof Error) {
      return new Error(`Failed to fetch round settings, server responded with error: ${settings.message}`)
    }
    const err = settings.find(a => a instanceof Error) as Error
    if (err !== undefined) {
      return new Error(`Failed to fetch round settings, server responded with error: ${err.message}`)
    }
    const [roundPointSystem, roundPointsLimit, teamPointsLimit, teamMaxPoints] =
      (settings as { method: string; params: any; }[]).map(a => a.params)
    this._roundsPointSystem = roundPointSystem
    this._roundsPointSystem = roundPointSystem
    this._roundsPointsLimit = roundPointsLimit.currentValue
    this._teamsPointsLimit = teamPointsLimit.currentValue
    this.teamMaxPoints = teamMaxPoints.currentValue
    if (this._roundsPointSystem.length === 0) {
      this._roundsPointSystem = config.roundsModePointSystem
      Client.callNoRes(`SetRoundCustomPoints`,
        [{ array: this._roundsPointSystem.map(a => ({ int: a })) }, { boolean: true }])
    }
    return true
  }

  static registerRoundRecord(record: tm.FinishInfo, player: tm.Player) {
    if (GameService.gameMode === 'TimeAttack' || GameService.gameMode === 'Stunts') { return }
    if (this.noRoundFinishes === true) {
      this.noRoundFinishes = false
      this.finishedRounds++
    }
    this._roundRecords.push(record)
    player.roundTimes[this.finishedRounds - 1] = record.time
  }

  static registerRoundPoints(player: tm.Player): number {
    if (GameService.gameMode === 'TimeAttack' || GameService.gameMode === 'Stunts') { return 0 }
    const index = this._ranking.findIndex(a => a.login === player.login)
    if (index === -1) {
      Logger.error(`Player object not present in RoundsService ranking when adding points`)
      return 0
    }
    let points = 0
    if (GameService.gameMode === 'Teams') {
      if (this.teamsRoundPoints === undefined) {
        this.teamsRoundPoints = PlayerService.players.filter(a => !a.isPureSpectator).length
      }
      points = this.teamsRoundPoints - this.roundFinishCount
    } else if (GameService.gameMode === 'Rounds') {
      points = this._roundsPointSystem[this.roundFinishCount]
    }
    player.roundsPoints += points
    this._ranking[index] = player
    this.fixRankingPosition(index)
    this.roundFinishCount++
    return points
  }

  static registerPlayer(player: tm.Player) {
    const index = this._ranking.findIndex(a => a.login === player.login)
    if (index === -1) {
      this._ranking.push(player)
      return
    }
    player.roundTimes = this._ranking[index].roundTimes
    for (let i = 0; i < this.finishedRounds; i++) {
      if (player.roundTimes[i] === undefined) { player.roundTimes[i] = -1 }
    }
    player.roundsPoints = this._ranking[index].roundsPoints
    this._ranking[index] = player
  }

  static resetRankingAndTimes() {
    // This method modifies the player objects so it needs to ignore the readonly constraint
    const playerList = PlayerService.players as tm.Player[]
    for (const e of playerList) {
      e.roundsPoints = 0
      e.roundTimes = []
    }
    this._ranking = playerList
  }

  static handleEndMap(): void {
    this.teamsRoundPoints = undefined
    this._teamScores = { blue: 0, red: 0 }
    this._ranking.length = 0
    this.finishedRounds = 0
  }

  static handleBeginRound(): void {
    this._roundRecords.length = 0
    this.roundFinishCount = 0
    this.noRoundFinishes = true
  }

  static async handleEndRound(): Promise<void> {
    this.teamsRoundPoints = undefined
    if (GameService.gameMode === 'Teams') {
      const res: tm.TrackmaniaRankingInfo[] | Error =
        await tm.client.call('GetCurrentRanking', [{ int: 2 }, { int: 0 }])
      if (res instanceof Error) {
        tm.log.error(`Call to get team score failed`, res.message)
        return
      }
      this._teamScores.blue = res.find(a => a.NickName === '$00FBlue Team')?.Score ?? 0
      this._teamScores.red = res.find(a => a.NickName === '$F00Red Team')?.Score ?? 0
    }
    if (GameService.gameMode === 'Rounds') {
      // This method modifies the player objects so it needs to ignore the readonly constraint
      const playerList = PlayerService.players as tm.Player[]
      for (let i = 0; i < playerList.length; i++) {
        const roundTimes = playerList[i].roundTimes
        if (roundTimes.length !== this.finishedRounds) {
          roundTimes[this.finishedRounds - 1] = -1
        }
      }
      // TODO REMOVE THIS IF NEVER HAPPENS  
      const ranking = await Client.call('GetCurrentRanking', [{ int: 250 }, { int: 0 }])
      for (const e of ranking) {
        const obj = this._ranking.find(a => a.login === e.Login)
        if (obj === undefined) { continue }
        if (obj.roundsPoints !== e.Score) {
          Logger.debug(`Rounds points mismatch in RoundsService`, obj, e)
          const player = PlayerService.get(obj.login) as tm.Player
          obj.roundsPoints = e.Score
          if (player !== undefined) { player.roundsPoints = e.Score }
        }
      }
    }
  }

  private static fixRankingPosition(index: number) {
    const obj = this._ranking[index]
    for (let i = 0; i < index; i++) {
      if (obj.roundsPoints > this._ranking[i].roundsPoints) {
        this._ranking.splice(i, 0, obj)
      }
    }
  }
  // TODO DOCUMENTATA
  /**
   * Current round records
   */
  static get roundRecords(): Readonly<tm.FinishInfo>[] {
    return [...this._roundRecords]
  }

  /**
   * Number of current round records
   */
  static get roundRecordCount(): number {
    return this._roundRecords.length
  }

  /**
   * Get current team scores (teams mode only)
   */
  static get teamScores(): typeof this._teamScores {
    return { ...this._teamScores }
  }

  static get roundsPointSystem(): number[] {
    return [...this._roundsPointSystem]
  }

  static get roundsPointsLimit(): number {
    return this._roundsPointsLimit
  }

  static get teamsPointsLimit(): number {
    return this._teamsPointsLimit
  }

  static get pointsRanking(): Readonly<tm.Player>[] {
    return [...this._ranking]
  }

}