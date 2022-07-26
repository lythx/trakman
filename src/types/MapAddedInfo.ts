interface MapAddedInfo {
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
  readonly addDate: Date
  readonly callerLogin?: string
}
