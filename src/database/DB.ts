import 'dotenv/config'
import postgres from 'pg'
import { type CopyStreamQuery, from } from 'pg-copy-streams'
import { createQueries } from './CreateQueries.js'
import { Logger } from '../Logger.js'

const { Pool } = postgres

export class Database {

  private static pool: postgres.Pool = Database.createPool(process.env.DB_NAME ?? '')

  private static reconnectingPool: boolean = false
  private static reconnectTimeout: number = 1000

  static dbVersion: string
  static dbSize: string

  private client: postgres.Pool | postgres.PoolClient = Database.pool

  private static createPool(dbName: string): postgres.Pool {
    if (!dbName) {
      throw new Error('DB_NAME environment variable is not set')
    }

    return new Pool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: dbName,
      host: process.env.DB_IP,
      port: Number(process.env.DB_PORT),
      connectionTimeoutMillis: 15000
    })
  }

  constructor() {
    this.client = Database.pool
  }

  private static async initPoolAndDatabase(): Promise<void> {
    const dbName = process.env.DB_NAME
    if (!dbName) {
      throw new Error('DB_NAME environment variable is not set')
    }

    try {
      await this.pool.query('select 1;')
    } catch(err: any) {
      if (err instanceof postgres.DatabaseError && err.code === '3D000') {
        await Logger.error(`Database "${dbName}" does not exist, attempting to create it...`, err.message)

        await this.pool.end().catch(() => {
        })

        const adminPool = new Pool({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: 'postgres',
          host: process.env.DB_IP,
          port: Number(process.env.DB_PORT),
          connectionTimeoutMillis: 15000
        })

        try {
          await adminPool.query(`CREATE DATABASE "${dbName}"`)
          await Logger.info(`Database "${dbName}" created successfully.`)
        } catch(createErr: any) {
          await Logger.fatal('Failed to create database.', `Error: ${createErr.message}`, createErr.stack)
          await adminPool.end().catch(() => {
          })
          throw createErr
        } finally {
          await adminPool.end().catch(() => {
          })
        }

        this.pool = this.createPool(dbName)

        await this.pool.query('select 1;')
      } else {
        throw err
      }
    }
  }

  static async initialize(reconnectTimeout: number = 1000): Promise<void> {
    this.reconnectTimeout = reconnectTimeout
    await this.initPoolAndDatabase()
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
        Logger.error(
          `Lost connection to database, attempting to reconnect in ${this.reconnectTimeout / 1000} second(s)`)
        setTimeout(async () => {
          Logger.debug('Reconnecting to database...')
          try {
            await this.pool.query('select version();')
            await this.getDBInfo()
            Logger.info('Reconnected to database successfully')
          } catch(reErr: any) {
            await Logger.fatal('Failed to reconnect to database', reErr.message, reErr.stack)
          } finally {
            this.reconnectingPool = false
          }
        }, this.reconnectTimeout)
      } else {
        Logger.error(err)
      }
    })
  }

  private static async getDBInfo(): Promise<void> {
    const versionRes = await this.pool.query('select version();') as any
    this.dbVersion = String(versionRes?.rows[0]?.version?.split(' ', 2)[1])

    const sizeRes = await this.pool.query('select pg_size_pretty(pg_database_size($1));', [process.env.DB_NAME]) as any
    this.dbSize = String(sizeRes?.rows[0]?.pg_size_pretty)
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
