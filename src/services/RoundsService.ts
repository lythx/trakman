import { PlayerService } from './PlayerService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import config from '../../config/Config.js'

export class RoundsService {

  private static teamsRoundPoints?: number
  private static _teamScores: { blue: number; red: number } = { blue: 0, red: 0 }
  private static roundsPointSystem: number[] = []
  private static roundPointsLimit: number
  private static teamPointsLimit: number
  private static teamMaxPoints: number
  private static readonly _roundRecords: tm.FinishInfo[] = []
  private static roundFinishCount = 0

  /**
   * Fetches and stores records on the current map and ranks of all online players on maps in current MatchSettings
   */
  static async initialize(): Promise<void> {
    const status = await this.updateRoundsSettings()
    if (status instanceof Error) {
      Logger.fatal(status.message)
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
    this.roundsPointSystem = roundPointSystem
    this.roundsPointSystem = roundPointSystem
    this.roundPointsLimit = roundPointsLimit.currentValue
    this.teamPointsLimit = teamPointsLimit.currentValue
    this.teamMaxPoints = teamMaxPoints.currentValue
    if (this.roundsPointSystem.length === 0) {
      this.roundsPointSystem = config.roundsModePointSystem
      Client.callNoRes(`SetRoundCustomPoints`,
        [{ array: this.roundsPointSystem.map(a => ({ int: a })) }, { boolean: true }])
    }
    return true
  }

  static registerRoundRecord(record: tm.FinishInfo) {
    if (GameService.gameMode === 'Cup' || GameService.gameMode === 'Laps'
      || GameService.gameMode === 'Rounds' || GameService.gameMode === 'Teams') {
      this._roundRecords.push(record)
    }
  }

  static getRoundPoints(): number | undefined {
    let points = 0
    if (GameService.gameMode === 'Teams') {
      if (this.teamsRoundPoints === undefined) {
        this.teamsRoundPoints = PlayerService.players.filter(a => !a.isPureSpectator).length
      }
      points = this.teamsRoundPoints - this.roundFinishCount
    } else if (GameService.gameMode === 'Rounds') {
      points = this.roundsPointSystem[this.roundFinishCount]
    }
    this.roundFinishCount++
    return points
  }

  static handleEndMap(): void {
    this.teamsRoundPoints = undefined
    this._teamScores = { blue: 0, red: 0 }
  }

  static handleBeginRound(): void {
    this._roundRecords.length = 0
    this.roundFinishCount = 0
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

}