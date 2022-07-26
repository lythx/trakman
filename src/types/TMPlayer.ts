interface TMPlayer {
  readonly id: number
  readonly login: string
  readonly nickname: string
  readonly nation: string
  readonly nationCode: string
  readonly region: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly currentCheckpoints: TMCheckpoint[]
  readonly visits: number
  readonly ip: string
  readonly isUnited: boolean
  readonly lastOnline?: Date
  wins: number
  privilege: number
  isSpectator: boolean
}
