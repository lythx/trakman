import { addListener } from './SectorEvents.js'
import { fetchMapSectors } from './SectorDB.js'
import { getMapSectors, getPlayerSectors } from './SectorListeners.js'

export const sectorRecords = {

    get mapSectors(): ({ login: string, nickname: string, sector: number, date: Date } | null)[] {
        return getMapSectors()
    },

    get playerSectors(): ({ login: string, sectors: (number | null)[] })[] {
        return getPlayerSectors()
    },

    addListener,

    fetchMapSectors

}