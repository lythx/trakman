import { RecordRepository } from "./database/RecordRepository.js"
import { MapRepository } from "./database/MapRepository.js"
import { PlayerRepository } from "./database/PlayerRepository.js"
import { Database } from './database/DB.js'
import 'dotenv/config'

const repo = new RecordRepository()
await repo.initialize()
const mapRepo = new MapRepository()
await mapRepo.initialize()
const playerRepo = new PlayerRepository()
playerRepo.initialize()
const db = new Database()

db.initialize()

export const fixCoherence = async () => {
    const maps = await mapRepo.getAll()
    const players = await db.query(`SELECT player_ids.login, nickname, region, wins, time_played, visits, is_united, last_online, rank, average FROM players 
    JOIN player_ids ON players.id=player_ids.id`)
    const records = (await repo.get(...maps.map(a => a.id))).sort((a, b) => a.time - b.time)
    for (const e of players.rows) {
        const recs = records.filter(a => a.login === e.login)
        const indexes = []
        for (const rec of recs) {
            let index = records.filter(a => a.map === rec.map).findIndex(a => a.login === rec.login) + 1
            if (index === 0 || index > Number(process.env.LOCALS_AMOUNT)) {
                index = Number(process.env.LOCALS_AMOUNT)
            }
            indexes.push(index)
        }
        const arr = [...indexes, ...Array.from({ length: maps.length - recs.length }).fill(Number(process.env.LOCALS_AMOUNT))]
        const sum: any = arr.reduce((acc: any, cur: any) => acc + cur, 0)
        await playerRepo.updateAverage(e.login, sum / maps.length)
    }
}

