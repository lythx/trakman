import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'

export class GameService {

  private static _game: TMGame
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
  private static _state: 'race' | 'result'
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
    Client.addProxy(this.proxyMethods, async (method: string, params: CallParams[]): Promise<void> => {
      Logger.info(`Game info changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
    this.startTimer()
  }

  static set state(state: 'race' | 'result') {
    this._state = state
  }

  static startTimer(): void {
    this._timerStartTimestamp = Date.now()
  }

  static get remainingMapTime(): number {
    if (this._state === 'result') { return 0 }
    return Math.round((this.config.timeAttackLimit - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get remainingResultTime(): number {
    if (this._state === 'race') { return 0 }
    return Math.round((this.config.resultTime - (Date.now() - this._timerStartTimestamp)) / 1000)
  }

  static get state(): 'race' | 'result' {
    return this._state
  }

  static async update(): Promise<void> {
    const res: any[] | Error = await Client.call('GetCurrentGameInfo', [{ int: 1 }]) // The int is game version (forever)
    if (res instanceof Error) {
      Logger.fatal('Failed to update game info. Server responded with an error:', res.message)
      return
    }
    const [info]: any = res
    this._game = {
      gameMode: info.GameMode, // Rounds (0), TimeAttack (1), Team (2), Laps (3), Stunts (4), Cup (5)
      resultTime: info.ChatTime,
      mapIndex: info.NbChallenge,
      roundsPointsLimit: info.RoundsPointsLimit,
      roundsPointSystemType: info.RoundsUseNewRules,
      roundsModeLapsAmount: info.RoundsForcedLaps,
      timeAttackLimit: info.TimeAttackLimit,
      countdownAdditionalTime: info.TimeAttackSynchStartPeriod,
      teamPointsLimit: info.TeamPointsLimit,
      teamMaxPoints: info.TeamMaxPoints,
      teamPointSystemType: info.TeamUseNewRules,
      lapsModeLapsAmount: info.LapsNbLaps,
      lapsModeFinishTimeout: info.LapsTimeLimit,
      roundsModeFinishTimeout: info.FinishTimeout,
      warmUpDuration: info.AllWarmUpDuration,
      disableRespawn: info.DisableRespawn,
      forceShowOpponents: info.ForceShowAllOpponents,
      roundsPointLimitSystemType: info.RoundsPointsLimitNewRules,
      teamPointLimitSystemType: info.TeamPointsLimitNewRules,
      cupPointsLimit: info.CupPointsLimit,
      cupRoundsPerMap: info.CupRoundsPerChallenge,
      cupWinnersAmount: info.CupNbWinners,
      cupWarmUpDuration: info.CupWarmUpDuration
    }
  }

  static get config(): TMGame {
    return this._game
  }

}