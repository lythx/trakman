interface MapsDBEntry {
  readonly id: string
  readonly name: string
  readonly filename: string
  readonly author: string
  readonly environment: string
  readonly mood: string
  readonly bronzetime: number
  readonly silvertime: number
  readonly goldtime: number
  readonly authortime: number
  readonly copperprice: number
  readonly laprace: boolean
  readonly lapsamount: number
  readonly checkpointsamount: number
  readonly adddate: Date
}