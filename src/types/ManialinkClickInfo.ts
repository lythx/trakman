interface ManialinkClickInfo {
  readonly answer: number
  readonly login: string
  readonly nickname: string
  readonly country: string
  readonly countryCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly checkpoints: TMCheckpoint[]
  readonly visits: number
  readonly wins: number
  readonly privilege: number
  readonly isSpectator: boolean
  readonly playerId: number
  readonly ip: string
  readonly region: string
  readonly isUnited: boolean
}
