export type BestCheckpoints = ({
  login: string
  nickname: string
  checkpoint: number
  date: Date
} | undefined)[]

export interface PlayerCheckpoints {
  readonly login: string
  readonly checkpoints: (number | undefined)[]
}

export interface CheckpointEventFunctions {
  'BestCheckpoint': ((login: string, nickname: string, index: number, date: Date) => void)
  'CheckpointsFetch': ((checkpoints: BestCheckpoints) => void)
  'DeleteBestCheckpoint': ((checkpoints: BestCheckpoints) => void)
  'DeletePlayerCheckpoint': ((login: string) => void)
  'PlayerCheckpoint': ((login: string, nickname: string, index: number) => void)
}