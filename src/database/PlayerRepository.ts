import { Repository } from './Repository.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS players(
    login varchar(25) primary key not null,
    nickname varchar(45) not null,
    nation varchar(3) not null,
    wins int4 not null default 0,
    timePlayed int4 not null default 0,
    privilege int2 not null default 0,
    visits int4 not null default 1
  );
`

export class PlayerRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  /**
   * Searches for a player by login in the database
   */
  async get(login: string): Promise<PlayersDBEntry | undefined> {
    const query = 'SELECT * FROM players WHERE login = $1'
    const res = await this.db.query(query, [login])
    return res.rows[0]
  }

  /**
   * Adds a player to the database
   */
  async add(player: TMPlayer): Promise<void> {
    const query = 'INSERT INTO players(login, nickname, nation, wins, timePlayed, privilege) VALUES($1, $2, $3, $4, $5, $6);'
    await this.db.query(query, [player.login, player.nickName, player.nationCode, player.wins, player.timePlayed, player.privilege])
  }

  /**
   * Updates the player information in the database
   */
  async update(player: TMPlayer): Promise<void> {
    const query = `UPDATE players SET nickname=$1, nation=$2, wins=$3, timePlayed=$4, visits=$5 WHERE login=$6;`
    await this.db.query(query, [player.nickName, player.nationCode, player.wins, player.timePlayed, player.visits, player.login])
  }

  /**
   * Set a player's timePlayed after they leave.
   */
  async setTimePlayed(login: string, timePlayed: number): Promise<void> {
    const query = `UPDATE players SET timePlayed=$1 WHERE login=$2;`
    await this.db.query(query, [timePlayed, login])
  }

  async setPrivilege(login: string, privilege: number): Promise<void> {
    const query = 'UPDATE players SET privilege = $1 WHERE login = $2'
    const res = await this.db.query(query, [privilege, login])
  }

  async getOwner(): Promise<PlayersDBEntry | undefined> {
    const query = 'SELECT * FROM players WHERE privilege = 4'
    const res = await this.db.query(query)
    return res.rows[0]
  }

  async removeOwner(): Promise<void> {
    const query = 'UPDATE players SET privilege = 0 WHERE privilege = 4'
    await this.db.query(query)
  }

}
