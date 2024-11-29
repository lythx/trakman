import type { SectorEventFunctions } from './SectorTypes.js'

const fetchListeners: Function[] = []
const bestDeleteListeners: Function[] = []
const bestSectorListeners: Function[] = []
const playerSectorListeners: Function[] = []
const playerDeleteListeners: Function[] = []
const nicknameUpdateListeners: Function[] = []

/**
 * Registers a callback to execute on a given event
 * @param event Event name
 * @param callback Callback function to execute
 */
const addListener = <T extends keyof SectorEventFunctions>(event: T, callback: SectorEventFunctions[T]): void => {
  switch (event) {
    case 'BestSector':
      bestSectorListeners.push(callback as any)
      return
    case 'DeleteBestSector':
      bestDeleteListeners.push(callback as any)
      return
    case 'DeletePlayerSector':
      playerDeleteListeners.push(callback as any)
      return
    case 'SectorsFetch':
      fetchListeners.push(callback as any)
      return
    case 'PlayerSector':
      playerSectorListeners.push(callback as any)
      return
    case 'NicknameUpdated':
      nicknameUpdateListeners.push(callback as any)
  }
}

const emitEvent = async <T extends keyof SectorEventFunctions>(event: T, ...params: Parameters<SectorEventFunctions[T]>) => {
  let listeners: any
  switch (event) {
    case 'BestSector':
      listeners = bestSectorListeners
      break
    case 'DeleteBestSector':
      listeners = bestDeleteListeners
      break
    case 'DeletePlayerSector':
      listeners = playerDeleteListeners
      break
    case 'SectorsFetch':
      listeners = fetchListeners
      break
    case 'PlayerSector':
      listeners = playerSectorListeners
      break
    case 'NicknameUpdated':
      listeners = nicknameUpdateListeners
  }
  for (const e of listeners) {
    await e(...params)
  }
}

export { addListener, emitEvent }