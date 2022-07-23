import { Repository } from './OldRepository.js'

const createQuery: string = `
  CREATE TABLE IF NOT EXISTS records(
      map varchar(27) not null,
      login varchar(25) not null,
      score int4 not null,
      date timestamp not null,
      checkpoints int4[],
      PRIMARY KEY(login, map)
  );
`

export class RecordRepository extends Repository {

  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add(record: RecordInfo): Promise<void> {
    const query: string = `INSERT INTO records(map, login, score, date, checkpoints) VALUES ($1, $2, $3, $4, $5);`
    await this.db.query(query, [record.map, record.login, record.time, record.date, record.checkpoints])
  }

  async get(mapId: string): Promise<RecordsDBEntry[]> {
    const query: string = `SELECT * FROM records WHERE map=$1`
    const res = await this.db.query(query, [mapId])
    return res.rows
  }

  async getAll(): Promise<RecordsDBEntry[]> {
    const query: string = 'SELECT * FROM records;'
    const res = await this.db.query(query)
    return res.rows
  }

  async remove(login: string, map: string): Promise<void> {
    const query: string = `DELETE FROM records WHERE login=$1 AND map=$2;`
    await this.db.query(query, [login, map])
  }

  async removeAll(map: string): Promise<void> {
    const query: string = `DELETE FROM records WHERE map=$1;`
    await this.db.query(query, [map])
  }

  async update(record: RecordInfo): Promise<void> {
    const query = 'UPDATE records SET score=$1, date=$2, checkpoints=$3 WHERE map=$4 AND login=$5'
    await this.db.query(query, [record.time, record.date, record.checkpoints, record.map, record.login])
  }

  async getByLogin(mapId: string, login: string): Promise<RecordsDBEntry | undefined> {
    const query: string = 'SELECT * FROM records WHERE map=$1 AND login=$2'
    const res = await this.db.query(query, [mapId, login])
    return res.rows[0]
  }
}
