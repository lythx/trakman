export interface TMGame {
  gameMode: number
  resultTime: number // what the fuck is this
  mapIndex: number
  roundsPointsLimit: number
  roundsPointSystemType: boolean // or this
  roundsModeLapsAmount: number
  timeAttackLimit: number
  countdownAdditionalTime: number
  teamPointsLimit: number
  teamMaxPoints: number
  teamPointSystemType: boolean // or this
  lapsModeLapsAmount: number // or this
  lapsModeFinishTimeout: number
  roundsModeFinishTimeout: number
  warmUpDuration: number
  disableRespawn: boolean
  forceShowOpponents: boolean
  roundsPointLimitSystemType: number
  teamPointLimitSystemType: number
  cupPointsLimit: number
  cupRoundsPerMap: number
  cupWinnersAmount: number
  cupWarmUpDuration: number
} 
