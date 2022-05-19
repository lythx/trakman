'use strict'

import { Client } from '../Client.js'

export class GameService {
  private static _game: TMGame

  static async initialize (): Promise<void> {
    const info = (await Client.call('GetCurrentGameInfo', [{ int: 1 }]))[0]
    if (info == null) {
      return
    }
    this._game = {
      gameMode: info.GameMode,
      chatTime: info.ChatTime,
      challengeNo: info.NbChallenge,
      roundsPointsLimit: info.RoundsPointsLimit,
      roundsUseNewRules: info.RoundsUseNewRules,
      roundsForcedLaps: info.RoundsForcedLaps,
      timeAttackLimit: info.TimeAttackLimit,
      timeAttackSynchStartPeriod: info.TimeAttackSynchStartPeriod,
      teamPointsLimit: info.TeamPointsLimit,
      teamMaxPoints: info.TeamMaxPoints,
      teamUseNewRules: info.TeamUseNewRules,
      lapsNo: info.NbLaps,
      lapsTimeLimit: info.LapsTimeLimit,
      finishTimeout: info.FinishTimeout,
      allWarmUpDuration: info.AllWarmUpDuration,
      disableRespawn: info.DisableRespawn,
      forceShowAllOpponents: info.ForceShowAllOpponents,
      roundsPointsLimitNewRules: info.RoundsPointsLimitNewRules,
      teamPointsLimitNewRules: info.TeamPointsLimitNewRules,
      cupPointsLimit: info.CupPointsLimit,
      cupRoundsPerChallenge: info.CupRoundsPerChallenge,
      cupWinnersNo: info.CupNbWinners,
      cupWarmUpDuration: info.CupWarmUpDuration
    }
  }

  static get gameMode (): number {
    return this._game.gameMode
  }

  static get roundsForcedLaps (): number {
    return this._game.roundsForcedLaps
  }

  static get game (): TMGame {
    return this._game
  }
}

export class GameError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'GameError'
  }
}
