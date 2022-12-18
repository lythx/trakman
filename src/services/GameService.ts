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
  private static _dynamicTimerEnabled = false
  private static _dynamicTimerOnNextRound = false
  private static timeAttackLimit = config.defaultTimeAttackTimeLimit
  private static remainingDynamicTime: number = config.defaultTimeAttackTimeLimit
  private static dynamicTimerInterval: NodeJS.Timer
  private static lastDynamicTimerUpdate = 0
  private static dynamicTimerPaused = false

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
      this._enableDynamicTimer()
    }
    this.startTimer()
  }

  static async enableDynamicTimer(): Promise<void> {
    if (this._dynamicTimerOnNextRound) { return }
    Client.callNoRes(`SetTimeAttackLimit`, [{ int: 0 }])
    this._dynamicTimerOnNextRound = true
  }

  static disableDynamicTimer(): void {
    if (!this._dynamicTimerOnNextRound) { return }
    Client.call(`SetTimeAttackLimit`, [{ int: this.timeAttackLimit }])
    this._dynamicTimerOnNextRound = false
  }

  static get dynamicTimerEnabled() {
    return this._dynamicTimerEnabled
  }

  static get dynamicTimerOnNextRound() {
    return this._dynamicTimerOnNextRound
  }

  static set state(state: tm.ServerState) {
    if (state === 'result') { this.pauseTimer() }
    this._state = state
    Events.emit('ServerStateChanged', state)
  }

  private static _enableDynamicTimer(): void {
    this._dynamicTimerEnabled = true
    this._dynamicTimerOnNextRound = true
    this.lastDynamicTimerUpdate = Date.now()
    this.dynamicTimerInterval = setInterval(() => {
      if (this.dynamicTimerPaused) { return }
      const date = Date.now()
      this.remainingDynamicTime -= date - this.lastDynamicTimerUpdate
      this.lastDynamicTimerUpdate = date
      if (this.remainingDynamicTime < 0) {
        Client.call('NextChallenge')
      }
    }, 300)
  }

  private static _disableDynamicTimer(): void {
    this._dynamicTimerEnabled = false
    this._dynamicTimerOnNextRound = false
    clearInterval(this.dynamicTimerInterval)
  }

  static startTimer(): void {
    let stateChange: 'enabled' | 'disabled' | undefined
    if (this._dynamicTimerOnNextRound && !this.dynamicTimerEnabled) {
      this._enableDynamicTimer()
      stateChange = 'enabled'
    } else if (!this._dynamicTimerOnNextRound && this.dynamicTimerEnabled) {
      this._disableDynamicTimer()
      stateChange = 'disabled'
    }
    if (this.dynamicTimerEnabled) {
      this.remainingDynamicTime = this.timeAttackLimit
      this.resumeTimer()
    } else {
      this._timerStartTimestamp = Date.now()
    }
    if (stateChange !== undefined) {
      Events.emit('DynamicTimerStateChanged', stateChange)
    }
  }

  static pauseTimer(): boolean {
    if (!this.dynamicTimerEnabled || tm.state.current !== 'race') { return false }
    this.dynamicTimerPaused = true
    return true
  }

  static resumeTimer(): boolean {
    if (!this.dynamicTimerEnabled || tm.state.current !== 'race') { return false }
    this.lastDynamicTimerUpdate = Date.now()
    this.dynamicTimerPaused = false
    return true
  }

  static setTime(seconds: number): boolean {
    if (!this.dynamicTimerEnabled ||
      this.remainingDynamicTime < config.dynamicTimerSubtractionLimit
      || tm.state.current !== 'race') { return false }
    this.remainingDynamicTime = seconds * 1000
    this.remainingDynamicTime = Math.max(config.dynamicTimerSubtractionLimit,
      this.remainingDynamicTime)
    return true
  }

  static addTime(seconds: number): boolean {
    if (!this.dynamicTimerEnabled || seconds <= 0
      || tm.state.current !== 'race') { return false }
    this.remainingDynamicTime += seconds * 1000
    return true
  }

  static subtractTime(seconds: number): boolean {
    if (!this.dynamicTimerEnabled || seconds <= 0 ||
      this.remainingDynamicTime < config.dynamicTimerSubtractionLimit
      || tm.state.current !== 'race') { return false }
    this.remainingDynamicTime -= seconds * 1000
    this.remainingDynamicTime = Math.max(config.dynamicTimerSubtractionLimit,
      this.remainingDynamicTime)
    return true
  }

  static get remainingRaceTime(): number {
    if (this.dynamicTimerEnabled) {
      if (this.remainingDynamicTime < 0) { return 0 }
      return ~~(this.remainingDynamicTime / 1000)
    }
    if (this._state === 'result' || this.state === 'transition') { return 0 }
    return Math.round((this.config.timeAttackLimit - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get remainingResultTime(): number {
    if (this.dynamicTimerEnabled) {
      if (this.remainingDynamicTime < 0) { return 0 }
      return this.remainingDynamicTime // TODO FIX
    }
    if (this._state === 'race' || this.state === 'transition') { return 0 }
    return Math.round((this.config.resultTime - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get state(): tm.ServerState {
    return this._state
  }

  static get isTimerPaused(): boolean {
    return this.dynamicTimerPaused
  }

  static get resultTimeLimit(): number {
    return ~~(this._game.resultTime / 1000) // TODO DYNAMIC
  }

  static get raceTimeLimit(): number {
    return ~~(this.timeAttackLimit / 1000)
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
    if (this._game.timeAttackLimit !== 0) {
      this.timeAttackLimit = this._game.timeAttackLimit
    }
  }

  static get config(): tm.Game {
    return this._game
  }

}