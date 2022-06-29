import { ErrorHandler } from '../ErrorHandler.js'
import { Client } from '../Client.js'

export class GameService {
  private static _game: TMGame

  static async initialize(): Promise<void> {
    // TODO: implement proxy here like in ServerConfig.js
    const res: any[] | Error = await Client.call('GetCurrentGameInfo', [{ int: 1 }])
    if (res instanceof Error) {
      ErrorHandler.error('Failed to get game info', res.message)
      return
    }
    const info: any = res[0]
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

  static get gameMode(): number {
    return this._game.gameMode
  }

  static get roundsForcedLaps(): number {
    return this._game.roundsForcedLaps
  }

  static get game(): TMGame {
    return this._game
  }
}

export class GameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameError'
  }
}
