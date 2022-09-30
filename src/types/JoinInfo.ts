type JoinInfo = Omit<tm.Player, 'currentCheckpoints'> & {
  readonly isSpectator: boolean
  readonly privilege: number
  readonly wins: number
}
