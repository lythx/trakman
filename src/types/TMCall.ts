export interface TMCall {
  readonly method: string
  readonly params ?: TM.CallParams[]
  readonly expectsResponse ?: boolean
}
