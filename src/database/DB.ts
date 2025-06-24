import 'dotenv/config'
import postgres from 'pg'
import { type CopyStreamQuery, from} from 'pg-copy-streams'
import { createQueries } from './CreateQueries.js'
import { Logger } from '../Logger.js'

const { Pool } = postgres

export class Database {

  private static readonly pool: postgres.Pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_IP,
    port: Number(process.env.DB_PORT),
    connectionTimeoutMillis: 15000
  })
  private static reconnectingPool: boolean = false
  private static reconnectTimeout: number
  private client: postgres.Pool | postgres.PoolClient = Database.pool
  static dbVersion: string
  static dbSize: string

  static async initialize(reconnectTimeout: number = 1000): Promise<void> {
    this.reconnectTimeout = reconnectTimeout
    for (const e of createQueries) {
      await this.pool.query(e).catch(async (err: Error) => {
        await Logger.fatal(`Database create query failed.`, `Error: ${err.message}`, err.stack, `Query:`, e)
      })
    }
    await this.getDBInfo()

    this.pool.on('error', (err: Error) => {
      if (err instanceof postgres.DatabaseError && err.code === '57P01') {
        if (this.reconnectingPool) {
          return
        }
        this.reconnectingPool = true
        Logger.error(`Lost connection to database, attempting to reconnect in ${this.reconnectTimeout/1000} second(s)`)
        setTimeout(async () => {
          Logger.debug('Reconnecting to database...')
          await this.pool.query(`select version();`).catch(async (err: Error) => {
            await Logger.fatal('Failed to reconnect to database', err.message)
          })
          await this.getDBInfo()
          Logger.info('Reconnected to database successfully')
          this.reconnectingPool = false
        }, this.reconnectTimeout)
      } else {
        Logger.error(err)
      }
    })
  }

  private static async getDBInfo(): Promise<void> {
    this.dbVersion = String((await this.pool.query(`select version();`) as any)?.rows[0]?.version?.split(` `, 2)[1])
    this.dbSize = String((await this.pool.query(`select pg_size_pretty(pg_database_size('${process.env.DB_NAME}'));`) as any)?.rows[0]?.pg_size_pretty)
  }

  async enableClient(): Promise<void> {
    this.client = await Database.pool.connect()
    this.client.on('error', (err: Error) => {
      if (this.client instanceof postgres.Pool) {
        Logger.error('handleClientError() called on a non-client')
        return
      }
      // this error code occurs when the database shuts down and must be re-enabled
      if (err instanceof postgres.DatabaseError && err.code === '57P01') {
        this.client.release(true)
        setTimeout(async () => {
          await this.enableClient()
          // no point handling errors here because
          // it just fires somewhere internally, and we have no way of catching it...
          // thankfully the timeout helps here
          await this.client.query(`select version();`)
          Logger.debug('Re-enabled DB client')
        }, Database.reconnectTimeout)
      } else {
        Logger.error(err)
      }
    })
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

  /**
   * Fast insertion query using COPY, requires client to be enabled!
   * @param q table name and column names in parentheses, ex. "maps(id, name, etc.)"
   * @returns a stream that can be piped into
   */
  stream(q: string): CopyStreamQuery | Error {
    if (this.client instanceof postgres.Pool) {
      return new Error('You must first call enableClient() on this instance before using this method')
    }
    return this.client.query(from(`COPY ${q} FROM STDIN;`))
  }

}
