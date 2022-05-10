import Repository from './Repository.js'
import Error from '../Error.js'
import Logger from '../Logger.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    nickname varchar(45) not null,
    nation varchar(3) not null,
    wins int4 not null default 0,
    timePlayed int8 not null default 0
  );
`

const getQuery = 'SELECT wins, timePlayed FROM players WHERE login = '

const addQuery = 'INSERT INTO players(login, nickname, nation, wins, timePlayed) VALUES'

class PlayerRepository extends Repository {
  constructor () {
    super()
    this._db.query(createQuery)
  }

  get (login) {
    const query = `${getQuery}'${login}';`
    return new Promise(async (resolve, reject) => {
      const result = await this._db.query(query)
      resolve(result.rows)
    })
  }

  /**
     * Adds an array of challenges to the database
     * @param {Object[]} objects the challenges
     */
  add (player) {
    const p = "('"
    const m = "', '"
    const s = "')"
    let query = addQuery + p + player.login + m + player.nickName +
            m + player.nationCode + m + 0 + m + 0 + s
    query = query + ';'
    return new Promise(async (resolve, reject) => {
      resolve(await this._db.query(query))
    })
  }

  update (player) {
    const query = `UPDATE players SET 
        nickname='${player.nickName}',
        nation='${player.nationCode}',
        wins=${player.wins},
        timePlayed=${player.timePlayed}
        WHERE login='${player.login}';`
    return new Promise(async (resolve, reject) => {
      resolve(await this._db.query(query))
    })
  }
}

export default PlayerRepository
