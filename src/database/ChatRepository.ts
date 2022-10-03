import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'

const playerRepo = new PlayerRepository()

export class ChatRepository extends Repository {
  
  async get(options?: { limit?: number, date?: Date }): Promise<tm.Message[]> {
    let i = 1
    let limitStr = ''
    let dateStr = ''
    const params = []
    if (options?.date !== undefined) {
      dateStr = `WHERE date>$${i}`
      params.push(options.date)
    }
    if (options?.limit !== undefined) {
      limitStr = `LIMIT $${i}`
      params.push(options.limit)
    }
    const query: string = `SELECT login, nickname, message, date FROM chat 
    JOIN players ON players.id=chat.player_id
    ORDER BY date DESC 
    ${dateStr}
    ${limitStr}`
    if (params.length === 0) { return await this.query(query) }
    return await this.query(query, ...params)
  }

  async getByLogin(login: string, options?: { limit?: number, date?: Date }): Promise<tm.Message[]> {
    let i = 2
    let limitStr = ''
    let dateStr = ''
    const params = []
    if (options?.date !== undefined) {
      dateStr = `AND date>$${i}`
      params.push(options.date)
    }
    if (options?.limit !== undefined) {
      limitStr = `LIMIT $${i}`
      params.push(options.limit)
    }
    const query: string = `SELECT login, nickname, message, date FROM chat 
    JOIN players ON players.id=chat.player_id
    ORDER BY date DESC 
    WHERE login=$1${dateStr}
    ${limitStr}`
    if (params.length === 0) { return await this.query(query, login) }
    return await this.query(query, login, ...params)
  }

  async add(login: string, text: string, date: Date): Promise<void> {
    const id = await playerRepo.getId(login)
    const query: string = 'INSERT INTO chat(player_id, message, date) VALUES ($1, $2, $3)'
    await this.query(query, id, text, date)
  }

}
