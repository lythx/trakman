import { Repository } from "./Repository.js";

const createQuery = `CREATE TABLE IF NOT EXISTS player_ids(
  id INT4 GENERATED ALWAYS AS IDENTITY,
  login VARCHAR(25) NOT NULL,
  PRIMARY KEY(id)
);`

export class PlayerIdsRepository extends Repository {

  async initialize() {
    await super.initialize(createQuery)
  }

  async add(...playerLogins: string[]) {
    this.query(`INSERT INTO player_ids(login) ${this.getInsertValuesString(1, playerLogins.length)}`, ...playerLogins)
  }

}