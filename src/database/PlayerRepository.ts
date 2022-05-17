'use strict'
import { Repository } from './Repository.js'
import { Player } from '../services/PlayerService.js'
import { ErrorHandler } from '../ErrorHandler.js'

const createQuery = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    nickname varchar(45) not null,
    nation varchar(3) not null,
    wins int4 not null default 0,
    timePlayed int8 not null default 0,
    privilege int4 not null default 0
  );
`
const updateQuery = `UPDATE players SET 
        nickname=$1,
        nation=$2,
        wins=$3,
        timePlayed=$4
        WHERE login=$5;
`
const setTimeQuery = `UPDATE players SET 
        timePlayed=$1
        WHERE login=$2;
`
const getQuery = 'SELECT * FROM players WHERE login = $1'
const addQuery = 'INSERT INTO players(login, nickname, nation, wins, timePlayed) VALUES($1, $2, $3, $4, $5);'

export class PlayerRepository extends Repository {
  async initialize (): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  /**
   * Searches for a login name in the database
   * @param {String} login
   * @return {Promise<Object[]>}
   */
  async get (login: string): Promise<any> {
    const res = await this.db.query(getQuery, [login])
    if ((res?.rows) == null) {
      throw Error('Error getting player ' + login + ' from database.')
    }
    return res.rows
  }

  /**
   * Adds a player to the database
   * @param {Player} player the player
   * @return {Promise<Object[]>}
   */
  async add (player: Player): Promise<any> {
    const res = await this.db.query(addQuery, [player.login, player.nickName, player.nationCode, player.wins, player.timePlayed])
    if ((res?.rows) == null) {
      throw Error('Error adding player ' + player.login + ' to database.')
    }
    return res.rows
  }

  /**
   * Updates the player information in the database
   * @param {Player} player a player instance
   * @return {Promise<Object[]>}
   */
  async update (player: Player): Promise<any> {
    const res = await this.db.query(updateQuery, [player.nickName, player.nationCode, player.wins, player.timePlayed, player.login])
    if ((res?.rows) == null) {
      throw Error('Error updating player ' + player.login + "'s data in the database.")
    }
    return res
  }

  /**
   * Set a player's timePlayed after they leave.
   * @param login
   * @param timePlayed
   * @return {Promise<void>}
   */
  async setTimePlayed (login: string, timePlayed: number): Promise<void> {
    await this.db.query(setTimeQuery, [timePlayed, login]).catch(err => {
      ErrorHandler.error('Player ' + login + ' not found in the database.', err)
    })
  }

  async setPrivilege (login: string, privilege: number): Promise<any[]> {
    const res = await this.db.query('UPDATE players SET privilege = $1 WHERE login = $2', [privilege, login])
    return res.rows
  }

  async getOwner (): Promise<any[]> {
    const res = await this.db.query('SELECT * FROM players WHERE privilege = 4')
    return res.rows
  }

  async removeOwner (): Promise<any[]> {
    const res = await this.db.query('UPDATE players SET privilege = 0 WHERE privilege = 4')
    return res.rows
  }
}
