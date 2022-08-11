type EndMapInfo = Readonly<TMCurrentMap> & {
    readonly localRecords: Readonly<TMLocalRecord[]>
    readonly liveRecords: Readonly<FinishInfo[]>
    readonly isRestarted: boolean
    readonly wasWarmUp: boolean
    readonly continuesOnNextMap: boolean
    readonly winnerLogin?: string
    readonly winnerWins?: number,
    readonly isRestart: boolean
}
