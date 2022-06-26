import { Repository } from './Repository.js'

const createQuery = `
CREATE TABLE IF NOT EXISTS votes(
    map varchar(27) NOT NULL,
    login varchar(25) NOT NULL,
    vote int2 NOT NULL,
    date timestamp NOT NULL,
    PRIMARY KEY(login, map)
);
`

export class VoteRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add(mapId: string, login: string, vote: number, date: Date): Promise<any> {
    const query = 'INSERT INTO votes(map, login, vote, date) VALUES($1, $2, $3, $4);'
    return (await this.db.query(query, [mapId, login, vote, date])).rows
  }

  async update(mapId: string, login: string, vote: number, date: Date): Promise<any> {
    const query = 'UPDATE votes SET vote=$1, date=$2 WHERE map=$3 AND login=$4;'
    return (await this.db.query(query, [vote, date, mapId, login])).rows
  }

  async getAll(): Promise<any[]> {
    const query = 'SELECT * FROM votes;'
    return (await this.db.query(query)).rows
  }

  async getOne(mapId: string, login: string): Promise<any[]> {
    const query = 'SELECT * FROM votes WHERE map=$1 AND login=$2;'
    return (await this.db.query(query, [mapId, login])).rows
  }

  async get(mapId: string): Promise<any[]> {
    const query = 'SELECT * FROM votes WHERE map=$1;'
    return (await this.db.query(query, [mapId])).rows
  }

}
