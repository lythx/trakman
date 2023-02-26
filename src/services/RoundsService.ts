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
  private static _cupPointsLimit: number
  private static _cupWarmUpRounds: number
  private static _cupMaxWinnersCount: number
  private static readonly _cupWinners: tm.Player[] = []
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
    await Client.call('SetCupRoundsPerChallenge', [{ int: 0 }])
    const status = await this.updateRoundsSettings()
    if (status instanceof Error) {
      await Logger.fatal(status.message)
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
    if (GameService.gameMode === 'Cup') {
      for (const e of this._ranking) {
        if (e.roundsPoints > this._cupPointsLimit) {
          e.roundsPoints = this._cupPointsLimit
          this._cupWinners.push(e)
          e.cupPosition = this._cupWinners.length
        } else if (e.roundsPoints === this._cupPointsLimit) {
          e.isCupFinalist = true
        }
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
      { method: 'GetMaxPointsTeam' },
      { method: 'GetCupPointsLimit' },
      { method: 'GetCupWarmUpDuration' },
      { method: 'GetCupNbWinners' }])
    if (settings instanceof Error) {
      return new Error(`Failed to fetch round settings, server responded with error: ${settings.message}`)
    }
    const err = settings.find(a => a instanceof Error) as Error
    if (err !== undefined) {
      return new Error(`Failed to fetch round settings, server responded with error: ${err.message}`)
    }
    const [roundPointSystem, roundPointsLimit, teamPointsLimit, teamMaxPoints,
      cupPointsLimit, cupWarmUpRounds, cupMaxWinnersCount] =
      (settings as { method: string; params: any; }[]).map(a => a.params)
    this._roundsPointSystem = roundPointSystem
    this._roundsPointSystem = roundPointSystem
    this._roundsPointsLimit = roundPointsLimit.CurrentValue
    this._teamsPointsLimit = teamPointsLimit.CurrentValue
    this.teamMaxPoints = teamMaxPoints.CurrentValue
    this._cupPointsLimit = cupPointsLimit.CurrentValue
    this._cupWarmUpRounds = cupWarmUpRounds.CurrentValue
    this._cupMaxWinnersCount = cupMaxWinnersCount.CurrentValue
    if (this._roundsPointSystem.length === 0) {
      this._roundsPointSystem = config.roundsModePointSystem
      Client.callNoRes(`SetRoundCustomPoints`,
        [{ array: this._roundsPointSystem.map(a => ({ int: a })) }, { boolean: true }])
    }
    return true
  }

  static registerRoundRecord(record: tm.FinishInfo, player: tm.Player) {
    if (GameService.gameMode === 'TimeAttack' || GameService.gameMode === 'Stunts' ||
      GameService.gameMode === 'Laps') { return }
    if (this.noRoundFinishes === true) {
      this.noRoundFinishes = false
      this.finishedRounds++
    }
    this._roundRecords.push(record)
    player.roundTimes[this.finishedRounds - 1] = record.time
  }

  static registerRoundPoints(player: tm.Player): number {
    if (GameService.gameMode === 'TimeAttack' || GameService.gameMode === 'Stunts' ||
      GameService.gameMode === 'Laps') { return 0 }
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
    } else if (GameService.gameMode === 'Rounds' || GameService.gameMode === 'Cup') {
      points = this._roundsPointSystem[this.roundFinishCount]
    }
    this._ranking[index] = player
    this.roundFinishCount++
    if (GameService.gameMode === 'Cup' && player.roundsPoints === this._cupPointsLimit) {
      // Cupmode winner
      if (this.roundFinishCount === 1) {
        player.isCupFinalist = false
        player.cupPosition = this._cupWinners.length + 1
        this._ranking.splice(index, 1)
        this._ranking.splice(player.cupPosition - 1, 0, player)
        this._cupWinners.push(player)
      }
      return points
    }
    player.roundsPoints += points
    if (GameService.gameMode === 'Cup' && player.roundsPoints > this._cupPointsLimit) {
      player.roundsPoints = this._cupPointsLimit
      player.isCupFinalist = true
    }
    this.fixRankingPosition(index)
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
    player.isCupFinalist = this._ranking[index].isCupFinalist
    const winIndex = this._cupWinners.findIndex(a => a.login === player.login)
    if (winIndex !== -1) {
      player.cupPosition = winIndex + 1
    }
    this._ranking[index] = player
  }

  static handleBeginMap(): void {
    this._ranking = PlayerService.players
    this.teamsRoundPoints = undefined
    this._teamScores = { blue: 0, red: 0 }
    this.finishedRounds = 0
    // This method modifies the player objects so it needs to ignore the readonly constraint
    const playerList = PlayerService.players as tm.Player[]
    for (const e of playerList) {
      e.roundsPoints = 0
      e.roundTimes = []
      e.isCupFinalist = false
      e.cupPosition = undefined
    }
    this._ranking = playerList
  }

  static handleBeginRound(): void {
    this._roundRecords.length = 0
    this.roundFinishCount = 0
    this.noRoundFinishes = true
    this._cupWinners.length = 0
  }

  static async handleEndRound(): Promise<void> {
    this.teamsRoundPoints = undefined
    if (GameService.gameMode === 'Teams') {
      const res: tm.TrackmaniaRankingInfo[] | Error =
        await Client.call('GetCurrentRanking', [{ int: 2 }, { int: 0 }])
      if (res instanceof Error) {
        Logger.error(`Call to get team score failed`, res.message)
        return
      }
      this._teamScores.blue = res.find(a => a.NickName === '$00FBlue Team')?.Score ?? 0
      this._teamScores.red = res.find(a => a.NickName === '$F00Red Team')?.Score ?? 0
    }
    if (GameService.gameMode === 'Rounds' || GameService.gameMode === 'Cup') {
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
          if (GameService.gameMode === 'Cup' && (obj.roundsPoints === this._cupPointsLimit
            || this._cupWinners.some(a => a.login === e.Login))) { continue }
          Logger.debug(`${GameService.gameMode} points mismatch in RoundsService`, JSON.stringify(obj), JSON.stringify(e))
          const player = PlayerService.get(obj.login) as tm.Player
          obj.roundsPoints = e.Score
          if (player !== undefined) { player.roundsPoints = e.Score }
        }
      }
    }
  }

  private static fixRankingPosition(index: number) {
    if (this._ranking[index] === undefined) { return }
    const obj = this._ranking.splice(index, 1)[0]
    for (let i = this._cupWinners.length; i < index; i++) { // Preserve cup winner order
      if (obj.roundsPoints > this._ranking[i].roundsPoints) {
        this._ranking.splice(i, 0, obj)
        return
      }
    }
    this._ranking.splice(index, 0, obj)
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