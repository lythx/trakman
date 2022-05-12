import Repository from './Repository.js'
import ErrorHandler from '../ErrorHandler.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS challenges(
    id VARCHAR(27) PRIMARY KEY NOT NULL,
    name VARCHAR(60) NOT NULL,
    author VARCHAR(25) NOT NULL,
    environment VARCHAR(7) NOT NULL
  );
`
const addQuery = 'INSERT INTO challenges(id, name, author, environment) VALUES'

class ChallengeRepository extends Repository {
  async initialize () {
    await this._db.query(createQuery)
  }

  /**
   * Adds an array of challenges to the database
   * @param {Object[]} objects the challenges
   * @return {Promise<any[]>}
   */
  async add (objects) {
    if (!(objects instanceof Array) || objects.length < 1) {
      ErrorHandler.fatal('Type error when adding challenges to database')
    }
    const p = "('"
    const m = "', '"
    const s = "'),"
    let query = addQuery
    for (const c of objects) {
      query += p + c.id + m + c.name + m + c.author + m + c.environment + s
    }
    query = query.slice(0, -1) + ' ON CONFLICT DO NOTHING;'
    await this._db.query(query)
  }
}

export default ChallengeRepository
