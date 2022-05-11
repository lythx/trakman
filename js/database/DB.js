'use strict'
import 'dotenv/config'
import postgres from 'pg'
import Error from '../Error.js'
const { Pool } = postgres


class Database {
  #client = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT
  })

  constructor () {
    this.#client.connect()
    this.#client.query(createRecords)
  }

  /**
   * Send a query to the database
   * basically a wrapper
   * no need to sanitise since the library does that itself
   * @param {String} q the query
   * @throws a database error if something goes wrong with the query
   * @return {Promise<void>}
   */
  async query (q) {
    if (typeof q !== 'string') {
      Error.error('Database query is not a string')
      return
    }
    return await this.#client.query(q)
      .catch(err => Error.error('Database error:', err))
  }
}

export default Database
