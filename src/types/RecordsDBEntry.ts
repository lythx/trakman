interface RecordsDBEntry {
  readonly map: string
  readonly login: string
  readonly score: number
  readonly date: Date
  readonly checkpoints: number[]
}