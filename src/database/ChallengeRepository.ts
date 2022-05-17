import { Repository } from './Repository.js'
import { Challenge } from '../services/ChallengeService.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS challenges(
    id VARCHAR(27) PRIMARY KEY NOT NULL,
    name VARCHAR(60) NOT NULL,
    author VARCHAR(25) NOT NULL,
    environment VARCHAR(7) NOT NULL
  );
`
const addQuery = 'INSERT INTO challenges(id, name, author, environment) VALUES'

export class ChallengeRepository extends Repository {
  async initialize (): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  /**
   * Adds an array of challenges to the database
   * @param {Object[]} objects the challenges
   * @return {Promise<any[]>}
   */
  async add (objects: Challenge[]): Promise<any> {
    if (objects.length === 0) {
      throw Error('No challenges in list.')
    }
    let query = addQuery
    const values = []
    let i = 1
    for (const c of objects) {
      query += '($' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + '),'
      values.push(c.id, c.name, c.author, c.environment)
    }
    query = query.slice(0, -1) + ' ON CONFLICT DO NOTHING;'
    await this.db.query(query, values)
  }
}
