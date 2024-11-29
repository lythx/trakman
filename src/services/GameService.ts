import { Events } from '../Events.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'
import config from '../../config/Config.js'

export class GameService {

  private static _config: tm.GameInfo
  private static readonly proxyMethods = [
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
  ] as const
  private static _state: tm.ServerState
  private static _timerStartTimestamp: number = Date.now()
  private static _dynamicTimerEnabled = false
  private static _dynamicTimerOnNextRound = false
  private static timeAttackLimit = config.defaultTimeAttackTimeLimit
  private static remainingDynamicTime: number = config.defaultTimeAttackTimeLimit
  private static dynamicTimerInterval: NodeJS.Timeout
  private static lastDynamicTimerUpdate = 0
  private static dynamicTimerPaused = false
  private static _mapStartTimestamp: number
  private static readonly gameModeMap: Record<number, tm.GameMode> = {
    0: 'Rounds',
    1: 'TimeAttack',
    2: 'Teams',
    3: 'Laps',
    4: 'Stunts',
    5: 'Cup'
  }

  static async initialize(): Promise<void> {
    Client.callNoRes(`system.multicall`,
      [
        { method: `SetCallVoteRatios`, params: [{ array: [{ struct: { Command: { string: `*` }, Ratio: { double: -1 } } }] }] },
        { method: `SetVehicleNetQuality`, params: [{ int: 1 }] }
      ]
    )
    Client.addProxy(this.proxyMethods, async (method: string, params: tm.CallParams[]): Promise<void> => {
      Logger.info(`Game info changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
    await this.update()
    if (this._config.timeAttackLimit === 0) {
      this._enableDynamicTimer()
    }
    this.startTimer()
    this._mapStartTimestamp = Date.now()
  }

  static startTimer(): void {
    let stateChange: 'enabled' | 'disabled' | undefined
    this._mapStartTimestamp = Date.now()
    if ((this._config.timeAttackLimit !== 0 ||
      (this.gameMode !== 'TimeAttack' && this.gameMode !== 'Stunts'))
      && this.dynamicTimerEnabled) {
      this._disableDynamicTimer()
      stateChange = 'disabled'
    } else if (this._config.timeAttackLimit === 0 && !this.dynamicTimerEnabled &&
      (this.gameMode === 'TimeAttack' || this.gameMode === 'Stunts')) {
      this._enableDynamicTimer()
      stateChange = 'enabled'
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

  static async update(): Promise<void> {
    const res: any | Error = await Client.call('GetCurrentGameInfo', [{ int: 1 }]) // The int is game version (forever)
    if (res instanceof Error) {
      Logger.fatal('Failed to update game info. Server responded with an error:', res.message)
      return
    }
    const obj: tm.GameInfo = {
      gameMode: res.GameMode, // Rounds (0), TimeAttack (1), Team (2), Laps (3), Stunts (4), Cup (5)
      resultTime: res.ChatTime,
      mapIndex: res.NbChallenge,
      roundsPointLimitOld: res.RoundsPointsLimit,
      roundsPointSystemType: res.RoundsUseNewRules ? 'new' : 'old',
      roundsModeLapsAmount: res.RoundsForcedLaps,
      timeAttackLimit: res.TimeAttackLimit,
      countdownAdditionalTime: res.TimeAttackSynchStartPeriod,
      teamPointLimitOld: res.TeamPointsLimit,
      teamMaxPoints: res.TeamMaxPoints,
      teamPointSystemType: res.TeamUseNewRules,
      lapsModeLapsAmount: res.LapsNbLaps,
      lapsModeTimeLimit: res.LapsTimeLimit,
      finishTimeout: res.FinishTimeout,
      warmUpDuration: res.AllWarmUpDuration,
      disableRespawn: res.DisableRespawn,
      forceShowOpponents: res.ForceShowAllOpponents,
      roundsPointLimitNew: res.RoundsPointsLimitNewRules,
      teamPointLimitNew: res.TeamPointsLimitNewRules,
      cupPointsLimit: res.CupPointsLimit,
      cupRoundsPerMap: res.CupRoundsPerChallenge,
      cupWinnersAmount: res.CupNbWinners,
      cupWarmUpRounds: res.CupWarmUpDuration
    }
    if (this._config !== undefined && !this.isGameInfoChanged(obj)) { return }
    this._config = obj
    if (this._config.timeAttackLimit !== 0) {
      this.timeAttackLimit = this._config.timeAttackLimit
    }
    Events.emit('GameConfigChanged', this._config)
  }

  private static isGameInfoChanged(obj: any): boolean {
    for (const key in this._config) {
      if (obj[key] !== this._config[key as keyof typeof this._config]) {
        return true
      }
    }
    return false
  }

  static set state(state: tm.ServerState) {
    if (state === 'result') { this.pauseTimer() }
    this._state = state
    Events.emit('ServerStateChanged', state)
  }

  static get config(): tm.GameInfo {
    return this._config
  }

  /**
   * Enables the dynamic timer after map change. Dynamic timer 
   * allows players to change remaining race time in real time.
   */
  static enableDynamicTimer(): void {
    if (this._dynamicTimerOnNextRound) { return }
    Client.callNoRes(`SetTimeAttackLimit`, [{ int: 0 }])
    this._dynamicTimerOnNextRound = true
  }

  /**
   * Disables the dynamic timer after map change.
   */
  static disableDynamicTimer(): void {
    if (!this._dynamicTimerOnNextRound) { return }
    Client.call(`SetTimeAttackLimit`, [{ int: this.timeAttackLimit }])
    this._dynamicTimerOnNextRound = false
  }

  /**
   * Pauses the timer. This method works only if dynamic timer is enabled and server is in 'race' state.
   * @returns Boolean indicating whether the timer got paused
   */
  static pauseTimer(): boolean {
    if (!this.dynamicTimerEnabled || tm.getState() !== 'race'
      || this.dynamicTimerPaused) { return false }
    this.dynamicTimerPaused = true
    return true
  }

  /**
   * Resumes the timer. This method works only if dynamic timer is enabled and server is in 'race' state.
   * @returns Boolean indicating whether the timer got resumed
   */
  static resumeTimer(): boolean {
    if (!this.dynamicTimerEnabled || tm.getState() !== 'race'
      || !this.dynamicTimerPaused) { return false }
    this.lastDynamicTimerUpdate = Date.now()
    this.dynamicTimerPaused = false
    return true
  }

  /**
   * Sets remaining race time. If the time is lower than 
   * "dynamicTimerSubtractionLimit" from config
   * it will be set to it. This method works only if 
   * dynamic timer is enabled and server is in 'race' state.
   * @param milliseconds Amount of time to set in milliseconds
   * @returns Boolean indicating whether the time got set
   */
  static setTime(milliseconds: number): boolean {
    if (!this.dynamicTimerEnabled ||
      milliseconds < config.dynamicTimerSubtractionLimit
      || tm.getState() !== 'race') { return false }
    this.remainingDynamicTime = milliseconds
    this.remainingDynamicTime = Math.max(config.dynamicTimerSubtractionLimit,
      this.remainingDynamicTime)
    return true
  }

  /**
   * Adds time to the timer. This method works only if 
   * dynamic timer is enabled and server is in 'race' state.
   * @param milliseconds Amount of time to add in milliseconds
   * @returns Boolean indicating whether the time got added
   */
  static addTime(milliseconds: number): boolean {
    if (!this.dynamicTimerEnabled || milliseconds <= 0
      || tm.getState() !== 'race') { return false }
    this.remainingDynamicTime += milliseconds
    return true
  }

  /**
   * Subtracts time from the timer. If the time is lower than 
   * "dynamicTimerSubtractionLimit" from Config.js
   * it will be set to it. This method works only if 
   * dynamic timer is enabled and server is in 'race' state.
   * @param milliseconds Amount of time to subtract in milliseconds
   * @returns Boolean indicating whether the time got subtracted
   */
  static subtractTime(milliseconds: number): boolean {
    if (!this.dynamicTimerEnabled || milliseconds <= 0 ||
      this.remainingDynamicTime < config.dynamicTimerSubtractionLimit
      || tm.getState() !== 'race') { return false }
    this.remainingDynamicTime -= milliseconds
    this.remainingDynamicTime = Math.max(config.dynamicTimerSubtractionLimit,
      this.remainingDynamicTime)
    return true
  }

  /** 
   * Remaining race time in milliseconds.
   */
  static get remainingRaceTime(): number {
    if (this.dynamicTimerEnabled) {
      if (this.remainingDynamicTime < 0) { return 0 }
      return this.remainingDynamicTime
    }
    if (this._state === 'result' || this.state === 'transition') { return 0 }
    return this.config.timeAttackLimit - (Date.now() - this._timerStartTimestamp)
  }

  /**
   * Remaining result screen time in milliseconds.
   */
  static get remainingResultTime(): number {
    if (this._state === 'race' || this.state === 'transition') { return 0 }
    return (this.config.resultTime - (Date.now() - this._timerStartTimestamp))
  }

  /**
   * Server state.
   */
  static get state(): tm.ServerState {
    return this._state
  }

  /**
   * Boolean indicating whether the dynamic timer is paused.
   */
  static get isTimerPaused(): boolean {
    if (!this.dynamicTimerEnabled) { return false }
    return this.dynamicTimerPaused
  }

  /**
   * Result time limit in the current round in milliseconds.
   */
  static get resultTimeLimit(): number {
    return this._config.resultTime
  }

  /**
   * Race time limit in the current round in milliseconds.
   */
  static get raceTimeLimit(): number {
    return this.timeAttackLimit
  }

  /**
   * Boolean indicating whether the dynamic timer is enabled.
   */
  static get dynamicTimerEnabled() {
    return this._dynamicTimerEnabled
  }

  /**
   * Boolean indicating whether the dynamic timer will be enabled in the next round.
   */
  static get dynamicTimerOnNextRound() {
    return this._dynamicTimerOnNextRound
  }

  /**
   * Timestamp at which the current map has started.
   */
  static get mapStartTimestamp(): number {
    return this._mapStartTimestamp
  }

  /**
   * Current server gamemode. ('Rounds', 'TimeAttack', 'Teams', 'Laps', 'Stunts', 'Cup')
   */
  static get gameMode(): tm.GameMode {
    return this.gameModeMap[this._config.gameMode]
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

}
