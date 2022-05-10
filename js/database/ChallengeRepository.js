import Repository from './Repository.js'
import Error from '../Error.js'

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
  constructor () {
    super()
    this._db.query(createQuery)
  }

  /**
   * Adds an array of challenges to the database
   * @param {Object[]} objects the challenges
   */
  add (objects) {
    console.log(typeof objects)
    if (typeof objects !== 'object' || objects.length < 1) {
      Error.fatal('Type error when adding challenges to database')
    }
    const p = "('"
    const m = "', '"
    const s = "'),"
    let query = addQuery
    objects.forEach(challenge => {
      const c = challenge.member
      if (c === null || c.length !== 7) {
        query += p + c[0].value[0].string + m + c[1].value[0].string +
        m + c[4].value[0].string + m + c[3].value[0].string + s
      }
    })
    query = query.slice(0, -1) + ';'
    try {
      this._db.query(query)
    } catch (e) {
      Error.error('Error adding challenges to database', e)
    }
  }
}

export default ChallengeRepository
