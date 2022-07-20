interface CheckpointInfo {
  readonly player: {
    readonly login: string
    readonly nickname: string
    readonly nation: string
    readonly nationCode: string
    readonly timePlayed: number
    readonly joinTimestamp: number
    readonly checkpoints: TMCheckpoint[]
    readonly visits: number
    readonly wins: number
    readonly privilege: number
    readonly playerId: number
    readonly ip: string
    readonly region: string
    readonly isUnited: boolean
  }
  readonly time: number
  readonly lap: number
  readonly index: number
}
