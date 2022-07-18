interface TMCall {
  readonly method: string
  readonly params?: CallParams[]
  readonly expectsResponse?: boolean
}
