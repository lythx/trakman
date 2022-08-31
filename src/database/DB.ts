import 'dotenv/config'
import postgres from 'pg'
import { Logger } from '../Logger'

const { Pool } = postgres

export class Database {

  private static readonly pool: postgres.Pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT)
  })
  private client: postgres.Pool | postgres.PoolClient = Database.pool

  async initializeClient(): Promise<void> {
    const client = await Database.pool.connect()
    this.client = client
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
    return await this.client.query(q, params).catch((err: any) => {
      throw Error(`Database error on query ${q}: ${err.message}`)
    })
  }

}
