type FinishInfo = Omit<TMPlayer & TMLocalRecord, 'currentCheckpoints' | 'isSpectator' | 'date'>
