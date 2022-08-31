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
  'BestCheckpoint': ((bestCheckpoint: Readonly<{ login: string, nickname: string, index: number, date: Date }>) => void)
  'CheckpointsFetch': ((bestCheckpoints: Readonly<BestCheckpoints>, playerCheckpoints: readonly Readonly<PlayerCheckpoints>[]) => void)
  'DeleteBestCheckpoint': ((deletedCheckpoints: readonly Readonly<{ index: number, login: string, checkpoint: number, date: Date }>[]) => void)
  'DeletePlayerCheckpoint': ((player: Readonly<{
    login: string, nickname: string,
    deletedCheckpoints: readonly Readonly<{ index: number, time: number }>[]
  }>) => void)
  'PlayerCheckpoint': ((playerCheckpoint: Readonly<{ login: string, nickname: string, index: number }>) => void)
}