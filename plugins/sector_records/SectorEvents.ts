import { BestSectors, PlayerSectors, SectorEventFunctions } from './SectorTypes.js'

const fetchListeners: ((mapSectors: BestSectors, playerSectors: PlayerSectors[]) => void)[] = []

const bestDeleteListeners: ((mapSectors: BestSectors, playerSectors: PlayerSectors[]) => void)[] = []

const bestSectorListeners: ((login: string, nickname: string, index: number, date: Date) => void)[] = []

const playerSectorListeners: ((login: string, nickname: string, index: number) => void)[] = []

const playerDeleteListeners: ((login: string) => void)[] = []

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
  }
}

const emitEvent = async <T extends keyof SectorEventFunctions>(event: T, ...params: any[]) => {
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
  }
  for (const e of listeners) {
    await e(...params)
  }
}

export { addListener, emitEvent }