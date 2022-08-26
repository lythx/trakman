export interface MKMapVotes {
  fantastic: number
  beautiful: number
  good: number
  bad: number
  poor: number
  waste: number
}

export interface MKVote {
  readonly mapId: string
  readonly login: string
  vote: -3 | -2 | -1 | 1 | 2 | 3
}
