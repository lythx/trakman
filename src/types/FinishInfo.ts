type FinishInfo = Omit<TM.Player & TM.LocalRecord, 'currentCheckpoints' | 'isSpectator' | 'date'>
