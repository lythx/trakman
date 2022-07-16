import { Client } from '../client/Client.js'
import { Events } from '../Events.js'
import { Logger } from '../Logger.js'

export class GameService {

  private static _game: TMGame
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
  ]

  static async initialize(): Promise<void> {
    const status = this.update()
    if (status instanceof Error) {
      await Logger.fatal('Failed to retrieve game info. Error:', status.message)
    }
    Client.addProxy(this.proxyMethods, async (method: string, params: CallParams[]) => {
      Logger.info(`Game info changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
  }

  static async update(): Promise<void> {
    const res: any[] | Error = await Client.call('GetCurrentGameInfo', [{ int: 1 }]) // The int is game version (forever)
    if (res instanceof Error) {
      Logger.fatal('Failed to update game info. Server responded with an error:', res.message)
      return
    }
    const info: any = res[0]
    // TODO: check what the props of this actually mean if possible (like wtf is timeattacksynchstartperiod) and change names accordingly
    this._game = {
      gameMode: info.GameMode, // Rounds (0), TimeAttack (1), Team (2), Laps (3), Stunts (4), Cup (5)
      chatTime: info.ChatTime,
      mapNo: info.NbChallenge,
      roundsPointsLimit: info.RoundsPointsLimit,
      roundsUseNewRules: info.RoundsUseNewRules,
      roundsForcedLaps: info.RoundsForcedLaps,
      timeAttackLimit: info.TimeAttackLimit,
      timeAttackSynchStartPeriod: info.TimeAttackSynchStartPeriod,
      teamPointsLimit: info.TeamPointsLimit,
      teamMaxPoints: info.TeamMaxPoints,
      teamUseNewRules: info.TeamUseNewRules,
      lapsNo: info.LapsNbLaps,
      lapsTimeLimit: info.LapsTimeLimit,
      finishTimeout: info.FinishTimeout,
      allWarmUpDuration: info.AllWarmUpDuration,
      disableRespawn: info.DisableRespawn,
      forceShowAllOpponents: info.ForceShowAllOpponents,
      roundsPointsLimitNewRules: info.RoundsPointsLimitNewRules,
      teamPointsLimitNewRules: info.TeamPointsLimitNewRules,
      cupPointsLimit: info.CupPointsLimit,
      cupRoundsPerMap: info.CupRoundsPerChallenge,
      cupWinnersNo: info.CupNbWinners,
      cupWarmUpDuration: info.CupWarmUpDuration
    }
  }

  static get game(): TMGame {
    return this._game
  }

}