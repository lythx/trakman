type JoinInfo = Omit<TM.Player, 'currentCheckpoints'> & {
  readonly isSpectator: boolean
  readonly privilege: number
  readonly wins: number
}
