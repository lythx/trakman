interface TMPlayer {
  readonly id: number
  readonly login: string
  readonly nickname: string
  readonly country: string
  readonly countryCode: string
  readonly region: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly currentCheckpoints: TMCheckpoint[]
  readonly visits: number
  readonly ip: string
  readonly isUnited: boolean
  readonly ladderPoints: number
  readonly ladderRank: number
  readonly lastOnline?: Date
  readonly title: string
  wins: number
  privilege: number
  isSpectator: boolean
  rank?: number
  average: number
}
