interface TMVote {
  readonly mapId: string
  readonly login: string
  vote: -3 | -2 | -1 | 1 | 2 | 3
  date: Date
}