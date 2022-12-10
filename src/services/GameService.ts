import { Events } from '../Events.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'
import config from '../../config/Config.js'

export class GameService {

  private static _game: tm.Game
  private static readonly proxyMethods: string[] = [
    'SetGameMode',
    'SetChatTime',
    'SetFinishTimeout',
    'SetAllWarmUpDuration',
    'SetDisableRespawn',
    'SetForceShowAllOpponents',
    'SetTimeAttackLimit',
    'SetTimeAttackSynchStartPeriod',
    'SetLapsTimeLimit',
    'SetNbLaps',
    'SetRoundForcedLaps',
    'SetRoundPointsLimit',
    'SetRoundCustomPoints',
    'SetUseNewRulesRound',
    'SetTeamPointsLimit',
    'SetMaxPointsTeam',
    'SetUseNewRulesTeam',
    'SetCupPointsLimit',
    'SetCupRoundsPerChallenge',
    'SetCupWarmUpDuration',
    'SetCupNbWinners'
  ]
  private static _state: tm.ServerState
  private static _timerStartTimestamp: number = Date.now()
  private static _flexiTimeEnabled = false
  private static flexiTimeOnNextRound = false
  private static timeAttackLimit = config.defaultTimeAttackTimeLimit
  private static remainingFlexiTime: number = config.defaultTimeAttackTimeLimit
  private static flexiTimeInterval: NodeJS.Timer
  private static lastFlexiTimeUpdate = 0
  private static flexiTimePaused = false

  static async initialize(): Promise<void> {
    Client.callNoRes(`SetCallVoteRatios`,
      [{
        array: [{
          struct: {
            Command: { string: `*` },
            Ratio: { double: -1 }
          }
        }]
      }]
    )
    const status: Promise<void> = this.update()
    if (status instanceof Error) {
      await Logger.fatal('Failed to retrieve game info. Error:', status.message)
    }
    Client.addProxy(this.proxyMethods, async (method: string, params: tm.CallParams[]): Promise<void> => {
      Logger.info(`Game info changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
    await this.update()
    if (this._game.timeAttackLimit === 0) {
      this._enableFlexiTime()
    }
    this.startTimer()
  }

  static async enableFlexiTime(): Promise<void> {
    if (this.flexiTimeOnNextRound) { return }
    Client.callNoRes(`SetTimeAttackLimit`, [{ int: 0 }])
    this.flexiTimeOnNextRound = true
  }

  static disableFlexiTime(): void {
    if (!this.flexiTimeOnNextRound) { return }
    Client.call(`SetTimeAttackLimit`, [{ int: this.timeAttackLimit }])
    this.flexiTimeOnNextRound = false
  }

  static get flexiTimeEnabled() {
    return this._flexiTimeEnabled
  }

  static set state(state: tm.ServerState) {
    this._state = state
    Events.emit('ServerStateChanged', state)
  }

  private static _enableFlexiTime(): void {
    this._flexiTimeEnabled = true
    this.flexiTimeOnNextRound = true
    console.log('enableflex')
    this.flexiTimeInterval = setInterval(() => {
      if (this.flexiTimePaused) { return }
      const date = Date.now()
      this.lastFlexiTimeUpdate = date
      this.remainingFlexiTime -= date - this.lastFlexiTimeUpdate
    }, 300)
  }

  private static _disableFlexiTime(): void {
    this._flexiTimeEnabled = false
    this.flexiTimeOnNextRound = false
    clearInterval(this.flexiTimeInterval)
  }

  static startTimer(): void {
    if (this.flexiTimeOnNextRound && !this.flexiTimeEnabled) {
      this._enableFlexiTime()
    } else if (!this.flexiTimeOnNextRound && this.flexiTimeEnabled) {
      this._disableFlexiTime()
    }
    if (this.flexiTimeEnabled) {
      this._timerStartTimestamp = Date.now()
    } else {
      this.remainingFlexiTime = this.timeAttackLimit
    }
  }

  static pauseFlexiTime(): boolean {
    if (!this.flexiTimeEnabled) { return false }
    this.flexiTimePaused = true
    return true
  }

  static resumeFlexiTime(): boolean {
    if (!this.flexiTimeEnabled) { return false }
    this.flexiTimePaused = false
    return true
  }

  static setFlexiTime(miliseconds: number): boolean {
    if (!this.flexiTimeEnabled) { return false }
    this.remainingFlexiTime = miliseconds
    return true
  }

  static addFlexiTime(miliseconds: number): boolean {
    if (!this.flexiTimeEnabled) { return false }
    this.remainingFlexiTime += miliseconds
    return true
  }

  static subtractFlexiTime(miliseconds: number): boolean {
    if (!this.flexiTimeEnabled) { return false }
    this.remainingFlexiTime -= miliseconds
    return true
  }

  static get remainingRaceTime(): number {
    if (this.flexiTimeEnabled) {
      if (this.remainingFlexiTime < 0) { return 0 }
      return this.remainingFlexiTime
    }
    if (this._state === 'result' || this.state === 'transition') { return 0 }
    return Math.round((this.config.timeAttackLimit - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get remainingResultTime(): number {
    if (this.flexiTimeEnabled) {
      if (this.remainingFlexiTime < 0) { return 0 }
      return this.remainingFlexiTime
    }
    if (this._state === 'race' || this.state === 'transition') { return 0 }
    return Math.round((this.config.resultTime - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get state(): tm.ServerState {
    return this._state
  }

  static get isFlexiTimePaused(): boolean {
    return this.flexiTimePaused
  }

  static get resultTimeLimit(): number {
    return ~~(this._game.resultTime / 1000)
  }

  static get raceTimeLimit(): number {
    return ~~(this._game.timeAttackLimit / 1000)
  }

  static async update(): Promise<void> {
    const res: any | Error = await Client.call('GetCurrentGameInfo', [{ int: 1 }]) // The int is game version (forever)
    if (res instanceof Error) {
      Logger.fatal('Failed to update game info. Server responded with an error:', res.message)
      return
    }
    this._game = {
      gameMode: res.GameMode, // Rounds (0), TimeAttack (1), Team (2), Laps (3), Stunts (4), Cup (5)
      resultTime: res.ChatTime,
      mapIndex: res.NbChallenge,
      roundsPointsLimit: res.RoundsPointsLimit,
      roundsPointSystemType: res.RoundsUseNewRules,
      roundsModeLapsAmount: res.RoundsForcedLaps,
      timeAttackLimit: res.TimeAttackLimit,
      countdownAdditionalTime: res.TimeAttackSynchStartPeriod,
      teamPointsLimit: res.TeamPointsLimit,
      teamMaxPoints: res.TeamMaxPoints,
      teamPointSystemType: res.TeamUseNewRules,
      lapsModeLapsAmount: res.LapsNbLaps,
      lapsModeFinishTimeout: res.LapsTimeLimit,
      roundsModeFinishTimeout: res.FinishTimeout,
      warmUpDuration: res.AllWarmUpDuration,
      disableRespawn: res.DisableRespawn,
      forceShowOpponents: res.ForceShowAllOpponents,
      roundsPointLimitSystemType: res.RoundsPointsLimitNewRules,
      teamPointLimitSystemType: res.TeamPointsLimitNewRules,
      cupPointsLimit: res.CupPointsLimit,
      cupRoundsPerMap: res.CupRoundsPerChallenge,
      cupWinnersAmount: res.CupNbWinners,
      cupWarmUpDuration: res.CupWarmUpDuration
    }
    this.timeAttackLimit = this._game.timeAttackLimit
  }

  static get config(): tm.Game {
    return this._game
  }

}