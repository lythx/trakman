import { Repository } from './Repository.js'

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

const insertQuery: string = `
        INSERT INTO records(map, login, score, date, checkpoints)
        VALUES ($1, $2, $3, $4, $5);
      `

export class RecordRepository extends Repository {
  async initialize(): Promise<void> {
    await super.initialize()
    await this.db.query(createQuery)
  }

  async add(record: RecordInfo): Promise<void> {
    await this.db.query(insertQuery, [record.map, record.login, record.time, record.date, record.checkpoints])
  }

  async get(mapId: string): Promise<any[]> {
    const res = await this.db.query('SELECT * FROM records WHERE map=$1', [mapId])
    return res.rows
  }

  async getAll(): Promise<any[]> {
    const res = await this.db.query('SELECT * FROM records;')
    return res.rows
  }

  async remove(login: string, map: string): Promise<any[]> {
    const query: string = `DELETE FROM records WHERE login=$1 AND map=$2;`
    return (await this.db.query(query, [login, map])).rows
  }

  async removeAll(map: string): Promise<any[]> {
    const query: string = `DELETE FROM records WHERE map=$1;`
    return (await this.db.query(query, [map])).rows
  }

  async update(record: RecordInfo): Promise<void> {
    await this.db.query('UPDATE records SET score=$1, date=$2, checkpoints=$3 WHERE map=$4 AND login=$5',
      [record.time, record.date, record.checkpoints, record.map, record.login])
  }

  async getByLogin(mapId: string, login: string): Promise<any[]> {
    const res = await this.db.query('SELECT * FROM records WHERE map=$1 AND login=$2', [mapId, login])
    return res.rows
  }
}
