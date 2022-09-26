type RecordInfo = Omit<TM.Player & TM.LocalRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>
