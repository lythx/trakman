export interface UltimaniaRecord {
  readonly login: string
  nickname: string
  score: number
  date: Date
}

export type NewUltimaniaRecord = Omit<tm.Player & UltimaniaRecord & {
  readonly position: number
  readonly previous?: {
    readonly score: number,
    readonly position: number
  }
}, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>
