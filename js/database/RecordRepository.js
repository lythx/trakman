'use strict'
import Repository from './Repository.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS records(
      id uuid primary key not null,
      challenge varchar(27) not null,
      login varchar(25) not null,
      score int4 not null,
      date timestamp not null,
      checkpoints int4[]
  );
`

class RecordRepository extends Repository {

  async initialize () {
    await this._db.query(createQuery)
  }

  async add (record) {

  }
}

export default RecordRepository
