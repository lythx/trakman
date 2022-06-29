interface TMGame {
  gameMode: number
  chatTime: number // what the fuck is this
  mapNo: number
  roundsPointsLimit: number
  roundsUseNewRules: boolean // or this
  roundsForcedLaps: number
  timeAttackLimit: number
  timeAttackSynchStartPeriod: number
  teamPointsLimit: number
  teamMaxPoints: number
  teamUseNewRules: boolean // or this
  lapsNo: number // or this
  lapsTimeLimit: number
  finishTimeout: number
  allWarmUpDuration: number
  disableRespawn: boolean
  forceShowAllOpponents: boolean
  roundsPointsLimitNewRules: number
  teamPointsLimitNewRules: number
  cupPointsLimit: number
  cupRoundsPerMap: number
  cupWinnersNo: number
  cupWarmUpDuration: number
}
