require('dotenv').config()
const { DBClient } = require('pg')
const createChallenges = `
  CREATE TABLE IF NOT EXISTS challenges(
    id VARCHAR(27) PRIMARY KEY NOT NULL,
    name VARCHAR(60) NOT NULL,
    author VARCHAR(25) NOT NULL,
    environment VARCHAR(7) NOT NULL
  );
`
const createPlayers = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    game varchar(3) not null,
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
  #client = new DBClient({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_SERVER,
    port: process.env.DB_PORT
  })

  constructor () {
    this.#client.connect()
    this.#client.query(createChallenges)
    this.#client.query(createPlayers)
    this.#client.query(createRecords)
  }
}

module.exports = Database
