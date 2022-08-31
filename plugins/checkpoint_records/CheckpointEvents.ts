import { BestCheckpoints, PlayerCheckpoints, CheckpointEventFunctions as CheckpointEventFunctions } from './CheckpointTypes.js'

const fetchListeners: ((mapCheckpoints: BestCheckpoints, playerCheckpoints: PlayerCheckpoints[]) => void)[] = []
const bestDeleteListeners: ((bestCheckpoints: BestCheckpoints) => void)[] = []
const bestCheckpointListeners: ((login: string, nickname: string, index: number, date: Date) => void)[] = []
const playerCheckpointListeners: ((login: string, nickname: string, index: number) => void)[] = []
const playerDeleteListeners: ((login: string) => void)[] = []

const addListener = <T extends keyof CheckpointEventFunctions>(event: T, callback: CheckpointEventFunctions[T]): void => {
  switch (event) {
    case 'BestCheckpoint':
      bestCheckpointListeners.push(callback as any)
      return
    case 'DeleteBestCheckpoint':
      bestDeleteListeners.push(callback as any)
      return
    case 'DeletePlayerCheckpoint':
      playerDeleteListeners.push(callback as any)
      return
    case 'CheckpointsFetch':
      fetchListeners.push(callback as any)
      return
    case 'PlayerCheckpoint':
      playerCheckpointListeners.push(callback as any)
  }
}

const emitEvent = async <T extends keyof CheckpointEventFunctions>(event: T, ...params: Parameters<CheckpointEventFunctions[T]>) => {
  let listeners: any
  switch (event) {
    case 'BestCheckpoint':
      listeners = bestCheckpointListeners
      break
    case 'DeleteBestCheckpoint':
      listeners = bestDeleteListeners
      break
    case 'DeletePlayerCheckpoint':
      listeners = playerDeleteListeners
      break
    case 'CheckpointsFetch':
      listeners = fetchListeners
      break
    case 'PlayerCheckpoint':
      listeners = playerCheckpointListeners
  }
  for (const e of listeners) {
    await e(...params)
  }
}

export { addListener, emitEvent }