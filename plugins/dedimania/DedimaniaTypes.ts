export interface DediRecord {
  readonly login: string
  nickname: string
  time: number
  checkpoints: number[]
  readonly leaderboard: DediLeaderboard
  readonly isLapRecord: boolean
}

export type NewDediRecord = Omit<tm.Player & DediRecord & {
  readonly position: number
  readonly previous?: {
    readonly time: number,
    readonly position: number
  }
}, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>

export type DediLeaderboard = 'TimeAttack' | 'Rounds' | 'Disabled'