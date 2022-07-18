interface BanlistDBEntry {
  readonly ip: string
  readonly login: string
  readonly date: Date
  readonly caller: string
  readonly reason: string | null
  readonly expires: Date | null
} 