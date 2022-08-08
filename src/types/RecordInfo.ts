type RecordInfo =  Omit<TMPlayer & TMLocalRecord & {
  readonly position: number
  readonly previousPosition: number
  readonly previousTime: number
}, 'currentCheckpoints' | 'isSpectator'>
