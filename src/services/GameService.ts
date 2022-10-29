import { Events } from '../Events.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'

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
    this.startTimer()
  }

  static set state(state: tm.ServerState) {
    this._state = state
    Events.emit('ServerStateChanged', state)
  }

  static startTimer(): void {
    this._timerStartTimestamp = Date.now()
  }

  static get remainingMapTime(): number {
    if (this._state === 'result' || this.state === 'transition') { return 0 }
    return Math.round((this.config.timeAttackLimit - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get remainingResultTime(): number {
    if (this._state === 'race' || this.state === 'transition') { return 0 }
    return Math.round((this.config.resultTime - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get state(): 'race' | 'result' | 'transition' {
    return this._state
  }

  static get resultTimeLimit(): number {
    return ~~(this.config.resultTime / 1000)
  }

  static get raceTimeLimit(): number {
    return ~~(this.config.timeAttackLimit / 1000)
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
  }

  static get config(): tm.Game {
    return this._game
  }

}