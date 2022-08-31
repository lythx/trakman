export type BestCheckpoints = ({
  login: string
  nickname: string
  checkpoint: number
  date: Date
} | undefined)[]

export interface PlayerCheckpoints {
  readonly login: string
  readonly nickname: string
  readonly checkpoints: (number | undefined)[]
}

export interface CheckpointEventFunctions {
  'BestCheckpoint': ((bestCheckpoint: {login: string, nickname: string, index: number, date: Date}) => void)
  'CheckpointsFetch': ((checkpoints: BestCheckpoints) => void)
  'DeleteBestCheckpoint': ((checkpoints: BestCheckpoints) => void)
  'DeletePlayerCheckpoint': ((player: {login: string, nickname: string}) => void)
  'PlayerCheckpoint': ((playerCheckpoint: {login: string, nickname: string, index: number}) => void)
}