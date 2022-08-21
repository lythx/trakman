export interface DediRecord {
  readonly login: string
  nickname: string
  time: number
  checkpoints: number[]
}

export type NewDediRecord = Omit<TMPlayer & DediRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>

interface f {
  readonly map: string
  readonly login: string
  readonly time: number
  readonly checkpoints: number[]
  readonly nickname: string
  readonly country: string
  readonly countryCode: string
  readonly timePlayed: number
  readonly joinTimestamp: number
  readonly wins: number
  readonly privilege: number
  readonly visits: number
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
  readonly playerId: number
  readonly ip: string
  readonly region: string
  readonly isUnited: boolean
}
