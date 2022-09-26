type LeaveInfo = Omit<TM.Player, 'lastOnline'> & {
  readonly sessionTime: number
  readonly wins: number
  readonly privilege: number
  readonly isSpectator: boolean
}
