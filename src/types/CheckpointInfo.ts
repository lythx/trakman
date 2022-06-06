interface CheckpointInfo {
  readonly login: string
  readonly id: number
  readonly time: number
  readonly lap: number
  readonly index: number
  readonly nickName: string
  readonly nation: string
  readonly nationCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly checkpoints: TMCheckpoint[]
  readonly visits: number
  readonly wins: number
  readonly privilege: number
}
