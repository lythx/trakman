import { addListener } from './CheckpointEvents.js'
import { fetchMapCheckpoints } from './CheckpointDB.js'
import { getMapCheckpoints, getPlayerCheckpoints } from './CheckpointListeners.js'

export const checkpointRecords = {

  get mapCheckpoints(): ({ login: string, nickname: string, checkpoint: number, date: Date } | null)[] {
    return getMapCheckpoints()
  },

  get playerCheckpoints(): ({ login: string, checkpoints: (number | null)[] })[] {
    return getPlayerCheckpoints()
  },

  addListener,

  fetchMapCheckpoints

}