import { Repository } from './Repository.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS chat(
      id uuid primary key not null,
      login varchar(25) not null,
      message varchar(250) not null,
      date timestamp not null
  );
`

export class ChatRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async get(limit: number): Promise<ChatDBEntry[]> {
    const query: string = 'SELECT * FROM chat ORDER BY date DESC LIMIT $1'
    const res = await this.db.query(query, [limit])
    return res.rows
  }

  async getByLogin(login: string, limit: number): Promise<ChatDBEntry[]> {
    const query: string = 'SELECT id, message, date FROM chat WHERE login = $1 ORDER BY date DESC LIMIT $2;'
    const response = await this.db.query(query, [login, limit])
    return response.rows
  }

  async add(message: TMMessage): Promise<void> {
    const query: string = 'INSERT INTO chat(id, login, message, date) VALUES ($1, $2, $3, $4) RETURNING id;'
    await this.db.query(query, [message.id, message.login, message.text, message.date])
  }

}
