import config from './Config.js'
import { addListener } from './CheckpointEvents.js'
import { getMapCheckpoints, getPlayerCheckpoints } from './CheckpointListeners.js'

/**
 * Registers and stores checkpoint records for every player.
 * Provides utilities for accessing checkpoint records related data.
 * @author Ciekma
 * @since 0.3
 */
export const checkpointRecords = {

  /**
   * @returns an array of current map best checkpoint records or null if checkpoint record doesn't exist
   */
  get mapCheckpoints(): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] {
    return getMapCheckpoints()
  },


  /**
   * @returns an array of current map online players and their checkpoint records
   */
  get playerCheckpoints(): ({ login: string, nickname: string, checkpoints: (number | null)[] })[] {
    return getPlayerCheckpoints()
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