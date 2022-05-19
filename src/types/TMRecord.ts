interface TMRecord {
  readonly id: string
  readonly challenge: string
  readonly login: string
  readonly score: number
  readonly date: Date
  readonly checkpoints: number[]
}
