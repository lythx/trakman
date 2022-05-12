'use strict'
import 'dotenv/config'
import postgres from 'pg'
import ErrorHandler from '../ErrorHandler.js'
const { Pool } = postgres

class Database {
  #client = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT
  })

  async initialize () {
    await this.#client.connect().catch(err => ErrorHandler.fatal('Cannot connect to database', err))
  }

  /**
   * Send a query to the database
   * basically a wrapper
   * no need to sanitise since the library does that itself
   * @param {String} q the query
   * @param params
   * @throws a database error if something goes wrong with the query
   * @return {Promise<void>}
   */
  async query (q, params = []) {
    if (typeof q !== 'string') {
      ErrorHandler.error('Database query is not a string')
      return
    }
    return await this.#client.query(q, params)
      .catch(err => ErrorHandler.error(`Database error on query ${q}:`, err))
  }
}

export default Database
