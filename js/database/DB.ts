'use strict'
import 'dotenv/config'
import postgres from 'pg'
import { ErrorHandler } from '../ErrorHandler.js'
const { Pool } = postgres

export class Database {
  #client = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: Number(process.env.DB_PORT)
  })

  async initialize() {
    await this.#client.connect().catch(err => ErrorHandler.fatal('Cannot connect to database', err))
  }

  /**
   * Send a query to the database
   * basically a wrapper
   * no need to sanitise since the library does that itself
   * @param {String} q the query
   * @param params
   * @throws a database error if something goes wrong with the query
   */
  async query(q: string, params: any[] = []) {
    return await this.#client.query(q, params)
      .catch(err => ErrorHandler.error(`Database error on query ${q}:`, err))
  }

  async query2(q: string, params: any[] = []): Promise<postgres.QueryResult<any> | Error> {
    const result = await this.#client.query(q, params)
      .catch(err => {
        ErrorHandler.error(`Database error on query ${q}`, err)
        return err
      })
    return result
  }
}
