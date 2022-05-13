'use strict'
import {Repository} from './Repository.js'
import {Record} from "../services/RecordService.js";

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
const updateQuery = `
        UPDATE records
        SET score = $1,
            date = $2,
            checkpoints = $3
        WHERE id = $4
        RETURNING id;
      `
const insertQuery = `
        INSERT INTO records(id, challenge, login, score, date, checkpoints)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `
const getQuery = 'SELECT id, score FROM records WHERE login = $1 AND challenge = $2;'

export class RecordRepository extends Repository {

  async initialize () {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add (record: Record) {
    const getRes = (await this.db.query(getQuery, [record.login, record.challenge]))?.rows
    let q
    if (getRes && getRes.length > 0) {
      if (getRes[0].score < record.score) {
        return Promise.resolve(null)
      }
      q = this.db.query(updateQuery, [record.score, record.date, record.checkpoints, getRes[0].id])
    } else {
      q = this.db.query(insertQuery, [record.id, record.challenge, record.login, record.score, record.date, record.checkpoints])
    }
    return await q
  }
}
