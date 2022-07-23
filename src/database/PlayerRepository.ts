import { Repository } from './Repository.js'
import { MapIdsRepository } from './MapIdsRepository.js'
import { PlayerIdsRepository } from './PlayerIdsRepository.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS players(
    id INT4 GENERATED ALWAYS AS IDENTITY,
    player_id INT4,
    nickname VARCHAR(45) not null,
    nation VARCHAR(3) not null,
    wins INT4 NOT NULL DEFAULT 0,
    time_played INT4 NOT NULL DEFAULT 0,
    visits INT4 NOT NULL DEFAULT 1,
    PRIMARY KEY(id),
    CONSTRAINT fk_player_id
      FOREIGN KEY(player_id) 
	      REFERENCES player_ids(id)
  );
`

export class PlayerRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize(createQuery)
  }

  /**
   * Searches for a player by login in the database
   */
  async get(login: string): Promise<PlayersDBEntry | undefined> {
    const query = `SELECT * FROM players WHERE login=$1 
    INNER JOIN player_ids ON players.player_id=player_ids.id;`
    const res = await this.db.query(query, [login])
    return res.rows[0]
  }

  /**
   * Adds a player to the database
   */
  async add(player: TMPlayer): Promise<void> {
    const query = 'INSERT INTO players(player_id, nickname, nation, wins, timePlayed, privilege) VALUES($1, $2, $3, $4, $5, $6);'
    await this.db.query(query, [`(SELECT id FROM player_ids WHERE player_ids.login=${player.login})`
      , player.nickname, player.nationCode, player.wins, player.timePlayed, player.privilege])
  }

  /**
   * Updates the player information in the database
   */
  async update(player: TMPlayer): Promise<void> {
    const query = `UPDATE players SET nickname=$1, nation=$2, wins=$3, timePlayed=$4, visits=$5 WHERE login=$6;`
    await this.db.query(query, [player.nickname, player.nationCode, player.wins, player.timePlayed, player.visits, player.login])
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
    await this.db.query(query, [privilege, login])
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
