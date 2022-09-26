export interface TMMap {
  readonly id: string
  readonly name: string
  readonly fileName: string
  readonly author: string
  readonly environment: 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
  readonly mood: 'Sunrise' | 'Day' | 'Sunset' | 'Night'
  readonly bronzeTime: number
  readonly silverTime: number
  readonly goldTime: number
  readonly authorTime: number
  readonly copperPrice: number
  readonly isLapRace: boolean
  readonly addDate: Date
  isNadeo: boolean
  isClassic: boolean
  voteCount: number
  voteRatio: number
  lapsAmount ?: number
  checkpointsAmount ?: number
  leaderboardRating ?: number
  awards ?: number
}
