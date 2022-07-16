import { Repository } from './Repository.js'

const createQuery: string = `
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

  async add(mapId: string, login: string, vote: number, date: Date): Promise<void> {
    const query: string = 'INSERT INTO votes(map, login, vote, date) VALUES($1, $2, $3, $4);'
    await this.db.query(query, [mapId, login, vote, date])
  }

  async update(mapId: string, login: string, vote: number, date: Date): Promise<void> {
    const query: string = 'UPDATE votes SET vote=$1, date=$2 WHERE map=$3 AND login=$4;'
    await this.db.query(query, [vote, date, mapId, login])
  }

  async getAll(): Promise<VotesDBEntry[]> {
    const query: string = 'SELECT * FROM votes;'
    const res = await this.db.query(query)
    return res.rows
  }

  async getOne(mapId: string, login: string): Promise<VotesDBEntry | undefined> {
    const query: string = 'SELECT * FROM votes WHERE map=$1 AND login=$2;'
    const res = await this.db.query(query, [mapId, login])
    return res.rows[0]
  }

  async get(mapId: string): Promise<VotesDBEntry[]> {
    const query: string = 'SELECT * FROM votes WHERE map=$1;'
    const res = await this.db.query(query, [mapId])
    return res.rows
  }

}
