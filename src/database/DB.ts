import config from '../../config/Database.js'
import postgres from 'pg'
import { createQueries } from './CreateQueries.js'
import { Logger } from '../Logger.js'

const { Pool } = postgres

export class Database {

  private static readonly pool: postgres.Pool = new Pool({
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    host: config.dbAddress,
    port: config.dbPort
  })
  private client: postgres.Pool | postgres.PoolClient = Database.pool

  static async initialize(): Promise<void> {
    for (const e of createQueries) {
      await this.pool.query(e).catch(async (err: Error) => {
        await Logger.fatal(`Database create query failed.`, `Error: ${err.message}`, err.stack, `Query:`, e)
      })
    }
  }

  async enableClient(): Promise<void> {
    const client: postgres.PoolClient = await Database.pool.connect()
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
    return await this.client.query(q, params).catch((err: Error) => {
      throw Error(`Database error on query ${q}: ${err.message}`)
    })
  }

}
