export interface TMXReplay {
  readonly id: number
  readonly userId: number
  readonly name: string
  readonly time: number
  readonly recordDate: Date
  readonly mapDate: Date
  readonly approved: any
  readonly leaderboardScore: number
  readonly expires: any
  readonly lockspan: any
  readonly url: string
  login?: string
}
