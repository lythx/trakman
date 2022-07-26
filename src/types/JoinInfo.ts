type JoinInfo = Omit<TMPlayer, 'currentCheckpoints'> & {
  readonly isSpectator: boolean
  readonly privilege: number
  readonly wins: number
}
