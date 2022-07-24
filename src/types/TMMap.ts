interface TMMap {
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
  lapsAmount?: number
  checkpointsAmount?: number
  readonly addDate: Date
}
