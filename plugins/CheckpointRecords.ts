import { addListener } from './checkpoint_records/CheckpointEvents.js'
import { fetchMapCheckpoints } from './checkpoint_records/CheckpointDB.js'
import { getMapCheckpoints, getPlayerCheckpoints } from './checkpoint_records/CheckpointListeners.js'

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