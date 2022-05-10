'use strict'
import 'dotenv/config'
import postgres from 'pg'
import Error from '../Error.js'
import Logger from '../Logger.js'
const { Pool } = postgres
const createPlayers = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    nickname varchar(45) not null,
    nation varchar(3) not null,
    wins int4 not null default 0,
    timePlayed int8 not null default 0
  );
`

const createRecords = `
  CREATE TABLE IF NOT EXISTS records(
      id uuid primary key not null,
      challenge varchar(27) not null,
      login varchar(25) not null,
      score int4 not null,
      date timestamp not null,
      checkpoints int4[]
  );
`

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
    this.#client.query(createPlayers)
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
    return await this.#client.query(q).then(() => Logger.info('Query execution successful'))
      .catch(err => Error.error('Database error:', err))
  }
}

export default Database
