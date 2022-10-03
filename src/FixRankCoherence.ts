import { RecordRepository } from "./database/RecordRepository.js"
import { MapRepository } from "./database/MapRepository.js"
import { PlayerRepository } from "./database/PlayerRepository.js"
import { Database } from './database/DB.js'
import config from '../config/Config.js'

// TODO FIX THIS FILE

const repo = new RecordRepository()
const mapRepo = new MapRepository()
const playerRepo = new PlayerRepository()
const db = new Database()

export const fixRankCoherence = async () => {
  const maps = await mapRepo.getAll()
  const players = await db.query(`SELECT login, nickname, region, wins, time_played, visits, is_united, last_online, average FROM players`)
  const records = (await repo.get(...maps.map(a => a.id))).sort((a, b) => a.time - b.time)
  for (const e of players.rows) {
    const recs = records.filter(a => a.login === e.login)
    const indexes = []
    for (const rec of recs) {
      let index = records.filter(a => a.map === rec.map).findIndex(a => a.login === rec.login) + 1
      if (index === 0 || index > config.localRecordsLimit) {
        index = config.localRecordsLimit
      }
      indexes.push(index)
    }
    const arr = [...indexes, ...Array.from({ length: maps.length - recs.length }).fill(config.localRecordsLimit)]
    const sum: any = arr.reduce((acc: any, cur: any) => acc + cur, 0)
    await playerRepo.updateAverage(e.login, sum / maps.length)
  }
}

