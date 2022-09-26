export interface TMXMapInfo {
  readonly id: string
  readonly TMXId: number
  readonly name: string
  readonly authorId: number
  readonly author: string
  readonly uploadDate: Date
  readonly lastUpdateDate: Date
  readonly type: string
  readonly environment: string
  readonly mood: string
  readonly style: string
  readonly routes: string
  readonly length: string
  readonly difficulty: 'Beginner' | 'Intermediate' | 'Expert' | 'Lunatic'
  readonly leaderboardRating: number
  readonly game: string
  readonly comment: string
  readonly commentsAmount: number
  readonly awards: number
  readonly pageUrl: string
  readonly screenshotUrl: string
  readonly thumbnailUrl: string
  readonly downloadUrl: string
  readonly isClassic: boolean
  readonly isNadeo: boolean
  readonly replays: TM.TMXReplay[]
}
