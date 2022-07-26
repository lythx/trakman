type LeaveInfo = Omit<TMPlayer, 'lastOnline'> & {
  readonly sessionTime: number
  readonly wins: number
  readonly privilege: number
  readonly isSpectator: boolean
}
