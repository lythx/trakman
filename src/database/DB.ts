import config from '../../config/Database.js'
import postgres from 'pg'

const { Pool } = postgres

export class Database {

  private static readonly pool: postgres.Pool = new Pool({
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    host: config.dbAddress,
    port: Number(config.dbPort)
  })
  private client: postgres.Pool | postgres.PoolClient = Database.pool

  async initializeClient(): Promise<void> {
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
    return await this.client.query(q, params).catch((err: any) => {
      throw Error(`Database error on query ${q}: ${err.message}`)
    })
  }

}
