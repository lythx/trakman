type EndMapInfo = Readonly<TM.CurrentMap> & {
    readonly localRecords: Readonly<Readonly<TM.LocalRecord>[]>
    readonly liveRecords: Readonly<Readonly<FinishInfo>[]>
    readonly isRestarted: boolean
    readonly wasWarmUp: boolean
    readonly continuesOnNextMap: boolean
    readonly winnerLogin?: string
    readonly winnerWins?: number,
    readonly isRestart: boolean
}
