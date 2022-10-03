type RecordInfo = Omit<tm.Player & tm.LocalRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>
