type FinishInfo = Omit<tm.Player & tm.LocalRecord, 'currentCheckpoints' | 'isSpectator' | 'date'>
