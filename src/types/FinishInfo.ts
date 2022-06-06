interface FinishInfo {
  readonly login: string
  readonly nickName: string
  readonly nation: string
  readonly nationCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly checkpoints: TMCheckpoint[]
  readonly visits: number
  readonly wins: number
  readonly privilege: number
  readonly challenge: string
  readonly score: number
}
