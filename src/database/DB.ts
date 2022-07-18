import 'dotenv/config'
import postgres from 'pg'
import { Logger } from '../Logger.js'

const { Pool } = postgres

export class Database {

  private readonly client: postgres.Pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT)
  })

  async initialize(): Promise<void> {
    await this.client.connect().catch(err => Logger.fatal('Cannot connect to database', err))
  }

  /**
   * Send a query to the database
   * basically a wrapper
   * no need to sanitise since the library does that itself
   * @param q the query
   * @param params
   * @throws a database error if something goes wrong with the query
   */
  async query(q: string, params: any[] = []): Promise<postgres.QueryResult> {
    return await this.client.query(q, params).catch(err => {
      throw Error(`Database error on query ${q}: ${err.message}`)
    })
  }

}
