import { Database } from './database/DB.js'
import { Logger } from "./Logger.js"
import { Client } from './client/Client.js'
import config from '../config/Config.js'

const db = new Database()

export const fixRankCoherence = async (): Promise<void> => {
  const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
  if (mapList instanceof Error) {
    Logger.fatal('Error while getting the map list', mapList.message)
    return
  }
  const allMaps: { uid: string, id: number }[] = (await db.query(`SELECT id, uid FROM map_ids`)).rows
  const playerIds: number[] = (await db.query(`SELECT id FROM players`)).rows.map(a => a.id)
  const allRecords: { player_id: number, map_id: number }[] = (await db.query(`SELECT player_id, map_id FROM records
  ORDER BY map_id ASC,
  time ASC,
  date ASC;`)).rows
  const maps = allMaps.filter(a => mapList.some(b => b.UId === a.uid))
  const records = allRecords.filter(a => maps.some(b => b.id === a.map_id))
  const limit = config.localRecordsLimit
  const sums: { id: number, average: number }[] = []
  for (let i = 0; i < playerIds.length; i++) {
    const indexes: number[] = []
    let sum = 0
    for (let j = 0; j < records.length; j++) { if (records[j].player_id === playerIds[i]) { indexes.push(j) } }
    for (let j = 0; j < indexes.length; j++) {
      let position = 1
      for (let k = indexes[j] - 1; k >= 0; k--) {
        if (records[k].map_id !== records[indexes[j]].map_id) { break }
        position++
      }
      if (position > limit) {
        position = limit
      }
      sum += position
    }
    sum += (maps.length - indexes.length) * limit
    sums[i] = { average: sum / maps.length, id: playerIds[i] }
  }
  if (sums.length === 0) { return }
  db.query(`UPDATE players AS p SET
  average = v.average
  FROM (VALUES
    ${sums.map(a => `(${a.id}, ${a.average}),`).join('').slice(0, -1)}
  ) AS v(id, average) 
  WHERE v.id = p.id;`)
}

