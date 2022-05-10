import Repository from './Repository.js'
const addQuery = 'INSERT INTO challenges(id, name, author, environment) VALUES'

class ChallengeRepository extends Repository {
  add (objects) {
    const p = "('"
    const m = "', '"
    const s = "'),"
    let query = addQuery
    objects.forEach(challenge => {
      const c = challenge['member']
      query += p + c[0]['value'][0]['string'] + m + c[1]['value'][0]['string']
        + m + c[4]['value'][0]['string'] + m + c[3]['value'][0]['string'] + s
    })
    query = query.slice(0, -1) + ';'
    this._db.query(query)
  }
}

export default ChallengeRepository