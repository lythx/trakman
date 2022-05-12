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
    await super.initialize()
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
    let query = addQuery
    const values = []
    let i = 1
    for (const c of objects) {
      query += '($' + i++ + ', $' + i++ + ', $' + i++ + ', $' + i++ + '),'
      values.push(c.id, c.name, c.author, c.environment)
      console.log(i)
    }
    query = query.slice(0, -1) + ' ON CONFLICT DO NOTHING;'
    await this._db.query(query, values)
  }
}

export default ChallengeRepository
