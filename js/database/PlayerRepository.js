'use strict'
import Repository from './Repository.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    nickname varchar(45) not null,
    nation varchar(3) not null,
    wins int4 not null default 0,
    timePlayed int8 not null default 0
  );
`

const getQuery = 'SELECT wins, timePlayed FROM players WHERE login = $1'
const addQuery = 'INSERT INTO players(login, nickname, nation, wins, timePlayed) VALUES($1, $2, $3, $4, $5);'

class PlayerRepository extends Repository {
  async initialize () {
    await super.initialize()
    await this._db.query(createQuery)
  }

  /**
   * Searches for a login name in the database
   * @param {String} login
   * @return {Promise<Object[]>}
   */
  async get (login) {
    return (await this._db.query(getQuery, [login])).rows
  }

  /**
   * Adds an array of challenges to the database
   * @param {Player} player the player
   * @return {Promise<Object[]>}
   */
  async add (player) {
    return (await this._db.query(addQuery, [player.login, player.nickName, player.nationCode, player.wins, player.timePlayed])).rows
  }

  /**
   * Updates the player information in the database
   * @param {Player} player a player instance
   * @return {Promise<Object[]>}
   */
  async update (player) {
    const query = `UPDATE players SET 
        nickname=$1,
        nation=$2,
        wins=$3,
        timePlayed=$4
        WHERE login=$5;`
    return (await this._db.query(query, [player.nickName, player.nationCode, player.wins, player.timePlayed, player.login])).rows
  }

  async setTimePlayed (login, timePlayed) {
    const query = `UPDATE players SET 
        timePlayed=$1
        WHERE login=$2;`
    return (await this._db.query(query, [timePlayed, login])).rows
  }
}

export default PlayerRepository
