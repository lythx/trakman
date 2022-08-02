import { addListener } from './sector_records/SectorEvents.js'
import { fetchMapSectors } from './sector_records/SectorDB.js'
import { getMapSectors, getPlayerSectors } from './sector_records/SectorListeners.js'

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