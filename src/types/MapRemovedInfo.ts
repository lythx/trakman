interface MapRemovedInfo {
  readonly id: string
  readonly name: string
  readonly fileName: string
  readonly author: string
  readonly environment: string
  readonly mood: string
  readonly bronzeTime: number
  readonly silverTime: number
  readonly goldTime: number
  readonly authorTime: number
  readonly copperPrice: number
  readonly isLapRace: boolean
  readonly lapsAmount?: number
  readonly checkpointsAmount?: number
  readonly addDate: Date
  readonly callerLogin?: string
}