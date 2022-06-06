interface ChallengeDedisInfo {
  readonly id: string
  readonly name: string
  readonly author: string
  readonly environment: string
  readonly mood: string
  readonly bronzeTime: number
  readonly silverTime: number
  readonly goldTime: number
  readonly authorTime: number
  readonly copperPrice: number
  readonly lapRace: boolean
  readonly lapsAmount: number
  readonly checkpointsAmount: number
  readonly dedis: TMDedi[]
}
