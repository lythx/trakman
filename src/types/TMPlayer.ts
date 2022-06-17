interface TMPlayer {
  readonly playerId: number
  readonly login: string
  readonly nickName: string
  readonly nation: string
  readonly nationCode: string
  readonly region: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly checkpoints: TMCheckpoint[]
  readonly visits: number
  readonly ip: string
  readonly isUnited: boolean
  wins: number
  privilege: number
  isSpectator: boolean
}
