'use strict'

import { Repository } from './Repository.js'

const createQuery = `
CREATE TABLE IF NOT EXISTS challenges(
  id VARCHAR(27) PRIMARY KEY NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(254) NOT NULL,
  author VARCHAR(25) NOT NULL,
  environment VARCHAR(7) NOT NULL,
  mood VARCHAR(100) NOT NULL,
  bronzetime INT4 NOT NULL,
  silvertime INT4 NOT NULL,
  goldtime INT4 NOT NULL,
  authortime INT4 NOT NULL,
  copperprice INT4 NOT NULL,
  laprace BOOLEAN NOT NULL,
  lapsamount INT2 NOT NULL,
  checkpointsamount INT2 NOT NULL
);
`

export class ChallengeRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add(...objects: TMChallenge[]): Promise<any> {
    if (objects.length === 0)
      return
    let query = 'INSERT INTO challenges(id, name, filename, author, environment, mood, bronzetime, silvertime, goldtime, authortime, copperprice, laprace, lapsamount, checkpointsamount) VALUES';
    const values = []
    let i = 1
    for (const c of objects) {
      query += '($' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() +
        ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() +
        ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + '),'
      values.push(c.id, c.name, c.fileName, c.author, c.environment, c.mood, c.bronzeTime, c.silverTime, c.goldTime, c.authorTime, c.copperPrice, c.lapRace, c.lapsAmount, c.checkpointsAmount)
    }
    query = query.slice(0, -1) + ';'
    await this.db.query(query, values)
  }

  async getAll(): Promise<any[]> {
    const query = 'SELECT * FROM challenges;'
    return (await this.db.query(query)).rows
  }

}
