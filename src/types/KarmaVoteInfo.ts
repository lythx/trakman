interface KarmaVoteInfo {
    readonly mapId: string
    readonly login: string
    readonly vote: -3 | -2 | -1 | 1 | 2 | 3
    readonly date: Date
}