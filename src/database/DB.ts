import 'dotenv/config'
import postgres from 'pg'
import { Logger } from '../Logger.js'

const { Pool } = postgres

export class Database {

  private static readonly pool: postgres.Pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT)
  })
  private client: any | undefined

  async initialize(): Promise<void> {
    // const client = await Database.pool.connect().catch(err => Logger.fatal('Cannot connect to database', err))
    // if (!client) { throw new Error() }
    this.client = Database.pool
  }

  /**
   * Send a query to the database
   * basically a wrapper
   * no need to sanitise since the library does that itself
   * @param q the query
   * @param params
   * @throws a database error if something goes wrong with the query
   */
  async query(q: string, ...params: any[]): Promise<postgres.QueryResult> {
    if (this.client === undefined) { throw Error('Database client is not initialized') }
    return await this.client.query(q, params).catch((err: any) => {
      throw Error(`Database error on query ${q}: ${err.message}`)
    })
  }

}
