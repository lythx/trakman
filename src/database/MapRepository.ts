import { Repository } from './Repository.js'

const createQuery: string = `
CREATE TABLE IF NOT EXISTS maps(
  id VARCHAR(27) PRIMARY KEY NOT NULL,
  name VARCHAR(60) NOT NULL,
  filename VARCHAR(254) NOT NULL,
  author VARCHAR(25) NOT NULL,
  environment VARCHAR(7) NOT NULL,
  mood VARCHAR(8) NOT NULL,
  bronzetime INT4 NOT NULL,
  silvertime INT4 NOT NULL,
  goldtime INT4 NOT NULL,
  authortime INT4 NOT NULL,
  copperprice INT4 NOT NULL,
  laprace BOOLEAN NOT NULL,
  lapsamount INT2 NOT NULL,
  checkpointsamount INT2 NOT NULL,
  adddate TIMESTAMP NOT NULL
);
`

export class MapRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add(...maps: TMMap[]): Promise<void> {
    if (maps.length === 0) { return }
    let query: string = 'INSERT INTO maps(id, name, filename, author, environment, mood, bronzetime, silvertime, goldtime, authortime, copperprice, laprace, lapsamount, checkpointsamount, adddate) VALUES'
    const values: any[] = []
    let i: number = 1
    for (const e of maps) {
      query += '($' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() +
        ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() +
        ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + ', $' + (i++).toString() + '),'
      values.push(e.id, e.name, e.fileName, e.author, e.environment, e.mood, e.bronzeTime, e.silverTime, e.goldTime, e.authorTime, e.copperPrice, e.lapRace, e.lapsAmount, e.checkpointsAmount, e.addDate)
    }
    query = query.slice(0, -1) + ';'
    await this.db.query(query, values)
  }

  async getAll(): Promise<MapsDBEntry[]> {
    const query: string = 'SELECT * FROM maps;'
    const res = await this.db.query(query)
    return res.rows
  }

  async get(id: string): Promise<MapsDBEntry | undefined> {
    const query: string = 'SELECT * FROM maps WHERE id=$1;'
    const res = await this.db.query(query, [id])
    return res.rows[0]
  }

}
