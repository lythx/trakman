import config from './Config.js'
import { addListener } from './SectorEvents.js'
import { getMapSectors, getPlayerSectors } from './SectorListeners.js'

/**
 * Registers and stores sector records for every player.
 * Provides utilities for accessing sector records related data
 * @author Ciekma
 * @since 0.3
 */
export const sectorRecords = {

  /**
   * @returns an array of current map best sector records or null if sector record doesn't exist
   */
  get mapSectors(): ({ login: string, nickname: string, sector: number, date: Date } | null)[] {
    return getMapSectors()
  },

  /**
   * @returns an array of current map online players and their sector records
   */
  get playerSectors(): ({ login: string, nickname: string, sectors: (number | null)[] })[] {
    return getPlayerSectors()
  },

  /**
   * Registers a callback to execute on a given event
   * @param event Event name
   * @param callback Callback function to execute
  */
  addListener,

  /**
   * Plugin status
   */
  isEnabled: config.isEnabled

}