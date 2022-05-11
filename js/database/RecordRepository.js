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
    const getQuery = `SELECT id, score FROM records
             WHERE login = '${record.login}' AND challenge = '${record.challenge}';`
    const getRes = (await this._db.query(getQuery)).rows
    let q
    if (getRes.length > 0) {
      if (getRes[0][1] < record.score) {
        return Promise.resolve(null)
      }
      const query = `
        UPDATE records
        SET score = $1,
            date = $2,
            checkpoints = $3
        WHERE id = $4
        RETURNING id;
      `
      q = this._db.query(query, [record.score, record.date, record.checkpoints, getRes[0][0]])
    } else {
      const query = `
        INSERT INTO records(id, challenge, login, score, date, checkpoints)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `
      q = this._db.query(query, [record.id, record.challenge, record.login, record.score, record.date, record.checkpoints])
    }
    return await q
  }
}

export default RecordRepository
