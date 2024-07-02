import type { CheckpointEventFunctions } from './CheckpointTypes.js'

const fetchListeners: Function[] = []
const bestDeleteListeners: Function[] = []
const bestCheckpointListeners: Function[] = []
const playerCheckpointListeners: Function[] = []
const playerDeleteListeners: Function[] = []
const nicknameUpdateListeners: Function[] = []

/**
 * Registers a callback to execute on a given event
 * @param event Event name
 * @param callback Callback function to execute
 */
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
      return
    case 'NicknameUpdated':
      nicknameUpdateListeners.push(callback as any)
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
      break
    case 'NicknameUpdated':
      listeners = nicknameUpdateListeners
  }
  for (const e of listeners) {
    await e(...params)
  }
}

export { addListener, emitEvent }