export interface DediRecord {
  readonly login: string
  nickname: string
  time: number
  checkpoints: number[]
}

export type NewDediRecord = Omit<tm.Player & DediRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>
