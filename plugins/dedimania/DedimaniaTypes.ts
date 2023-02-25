export interface DediRecord {
  readonly login: string
  nickname: string
  time: number
  checkpoints: number[]
  readonly isLap: boolean
}

export type NewDediRecord = Omit<tm.Player & DediRecord & {
  readonly position: number
  readonly previous?: {
    readonly time: number,
    readonly position: number
  },
  readonly isLap: boolean
}, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>
