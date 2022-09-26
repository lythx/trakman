export interface DediRecord {
  readonly login: string
  nickname: string
  time: number
  checkpoints: number[]
}

export type NewDediRecord = Omit<TM.Player & DediRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>
