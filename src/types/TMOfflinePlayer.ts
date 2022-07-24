interface TMOfflinePlayer {
  readonly login: string
  readonly nickname: string
  readonly nation: string
  readonly nationCode: string
  readonly region: string
  readonly timePlayed: number
  readonly visits: number
  readonly isUnited: boolean
  readonly wins: number
  readonly privilege: number
  readonly lastOnline?: Date
}
