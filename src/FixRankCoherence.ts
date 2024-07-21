import { Database } from './database/DB.js'
import { Logger } from "./Logger.js"
import { Client } from './client/Client.js'
import config from '../config/Config.js'
import fs from 'fs/promises'

const db = new Database()

export const fixRankCoherence = async (): Promise<void> => {
  const access = await fs.readFile(`./src/temp/rank_coherence.txt`).catch((err: Error) => err)
  if (!(access instanceof Error) && access.toString() === config.localRecordsLimit.toString()) {
    Logger.trace(`Rank coherence fix unneeded (same max locals value)`)
    return
  }
  await forceFixRankCoherence()
}

export const forceFixRankCoherence = async (): Promise<void> => {
  Logger.info(`Recalculating ranks...`)
  const allMaps: { uid: string, id: number }[] = (await db.query(`SELECT id, uid FROM map_ids`)).rows
  let maps: { uid: string, id: number }[]
  if (!config.manualMapLoading.enabled) {
    const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
    if (mapList instanceof Error) {
      Logger.fatal('Error while getting the map list', mapList.message)
      return
    }
    maps = allMaps.filter(a => mapList.some(b => b.UId === a.uid))
  } else {
    maps = allMaps
  }
  const playerIds: number[] = (await db.query(`SELECT id FROM players`)).rows.map(a => a.id)
  const allRecords: { player_id: number, map_id: number }[] = (await db.query(`SELECT player_id, map_id FROM records
  ORDER BY map_id ASC,
  time ASC,
  date ASC;`)).rows
  const records = allRecords.filter(a => maps.some(b => b.id === a.map_id))
  const limit = config.localRecordsLimit
  const sums: { id: number, average: number }[] = []
  const indexesMap = new Map<number, number[]>(playerIds.map(a => [a, []]))
  for (let i = 0; i < records.length; i++) {
    indexesMap.get(records[i].player_id as number)?.push(i)
  }
  for (let i = 0; i < playerIds.length; i++) {
    const indexes = indexesMap.get(playerIds[i]) as number[]
    let sum = 0
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
  if (sums.length !== 0) {
    await db.query(`UPDATE players AS p SET
    average = v.average
    FROM (VALUES
      ${sums.map(a => `(${a.id}, ${a.average}),`).join('').slice(0, -1)}
    ) AS v(id, average) 
    WHERE v.id = p.id;`)
  }
  await fs.writeFile('./src/temp/rank_coherence.txt', config.localRecordsLimit.toString())
}

