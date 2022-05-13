'use strict'
import { ErrorHandler } from '../ErrorHandler.js'
import { Message } from '../services/ChatService.js'
import { Repository } from './Repository.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS chat(
      id uuid primary key not null,
      login varchar(25) not null,
      message varchar(??) not null,
      date timestamp not null
  );
`

export class ChatRepository extends Repository {

    /**
     * initialize repository and create chat table if it doesn't exist
     */
    async initialize(): Promise<void> {
        await super.initialize()
        await this.db.query(createQuery)
    }

    /**
     *
     * @param {Date} date limit date to start searching the db from
     * @returns {Promise<any[]>} database response
     */
    async get(limit: number) {
        const query = `SELECT * FROM chat ORDER BY date DESC LIMIT $1`
        return await this.db.query(query, [limit])//.catch(err => ErrorHandler.error('Failed to get chat messages from database', `Query: ${query}`, err))
    }

    async getByLogin(login: string, date, limit: number = 250) {
        const query = 'SELECT id, message, date FROM chat WHERE login = $1 AND date > $2 ORDER BY date DESC LIMIT $3;'
        const response = this.db.query(query, [login, date, limit]).catch(err => ErrorHandler.error(`Failed to get users ${login} messages from database`, `Query: ${query}`, err))
        if (!response?.rows) {
            return Promise.reject('Error fetching players from database.')
        }
        return await response.rows
    }

    async add(message: Message) {
        const query = `
        INSERT INTO chat(login, message, date) VALUES ($1, $2, $3) RETURNING id;`
        const response = this.db.query(query, [message.login, message.text, message.timestamp]).catch(err => ErrorHandler.error('Failed to add chat message to database', `Query: ${query}`, err))
        return await response
    }
}