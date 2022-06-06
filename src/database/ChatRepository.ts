import { Repository } from './Repository.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS chat(
      id uuid primary key not null,
      login varchar(25) not null,
      message varchar(250) not null,
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

  async get(limit: number): Promise<any[]> {
    const query = 'SELECT * FROM chat ORDER BY date DESC LIMIT $1'
    const response = await this.db.query(query, [limit])
    return response.rows
  }

  async getByLogin(login: string, limit: number): Promise<any[]> {
    const query = 'SELECT id, message, date FROM chat WHERE login = $1 ORDER BY date DESC LIMIT $2;'
    const response = await this.db.query(query, [login, limit])
    return response.rows
  }

  async add(message: TMMessage): Promise<any[]> {
    const query = 'INSERT INTO chat(id, login, message, date) VALUES ($1, $2, $3, $4) RETURNING id;'
    const response = await this.db.query(query, [message.id, message.login, message.text, message.date])
    return response.rows
  }
}
