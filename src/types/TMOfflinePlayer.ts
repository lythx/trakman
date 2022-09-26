export interface TMOfflinePlayer {
  readonly login: string
  readonly nickname: string
  readonly country: string
  readonly countryCode: string
  readonly region: string
  readonly timePlayed: number
  readonly visits: number
  readonly isUnited: boolean
  readonly wins: number
  readonly privilege: number
  readonly lastOnline ?: Date
  readonly rank ?: number
  readonly average: number
}
