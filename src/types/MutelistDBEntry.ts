interface MutelistDBEntry {
  readonly login: string
  readonly date: Date
  readonly caller: string
  readonly reason: string | null
  readonly expires: Date | null
}