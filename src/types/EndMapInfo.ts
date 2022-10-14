type EndMapInfo = Readonly<tm.CurrentMap> & {
    readonly localRecords: Readonly<Readonly<tm.LocalRecord>[]>
    readonly liveRecords: Readonly<Readonly<FinishInfo>[]>
    readonly wasWarmUp: boolean
    readonly continuesOnNextMap: boolean
    readonly winnerLogin?: string
    readonly winnerWins?: number,
    readonly isRestart: boolean
}
