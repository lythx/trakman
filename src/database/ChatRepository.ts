import { Repository } from './Repository.js'
import { PlayerRepository } from './PlayerRepository.js'
import { Logger } from '../Logger.js'

const playerRepo = new PlayerRepository()

export class ChatRepository extends Repository {

  private lastMessageTimestamp: Date = new Date(0)

  async get(options?: { limit?: number, date?: Date }): Promise<tm.Message[]> {
    let i = 1
    let limitStr = ''
    let dateStr = ''
    const params = []
    if (options?.date !== undefined) {
      dateStr = `WHERE date>$${i++}`
      params.push(options.date)
    }
    if (options?.limit !== undefined) {
      limitStr = `LIMIT $${i}`
      params.push(options.limit)
    }
    const query: string = `SELECT login, nickname, message as text, date FROM chat 
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
      dateStr = `AND date>$${i++}`
      params.push(options.date)
    }
    if (options?.limit !== undefined) {
      limitStr = `LIMIT $${i}`
      params.push(options.limit)
    }
    const query: string = `SELECT login, nickname, message as text, date FROM chat 
    JOIN players ON players.id=chat.player_id
    ORDER BY date DESC 
    WHERE login=$1${dateStr}
    ${limitStr}`
    if (params.length === 0) { return await this.query(query, login) }
    return await this.query(query, login, ...params)
  }

  async add(login: string, text: string, date: Date): Promise<void> {
    const id = await playerRepo.getId(login)
    if (id === undefined) {
      Logger.error(`Failed to get id for player ${login} while inserting into chat table`)
      return
    }
    if (date.getTime() === this.lastMessageTimestamp.getTime()) {
      Logger.trace(`Last chat message has the same timestamp as the one prior. Incrementing..`)
      date = new Date(date.getTime() + 1)
    }
    this.lastMessageTimestamp = date
    const query: string = 'INSERT INTO chat(player_id, message, date) VALUES ($1, $2, $3)'
    // Slice multibyte characters
    await this.query(query, id, text.slice(0, 150), date)
  }

}
