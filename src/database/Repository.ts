import { Database } from './DB.js'

export abstract class Repository {

  protected db: Database = new Database()

  async query(q: string, ...params: any[]): Promise<any[]> {
    return (await (this.db.query(q, ...params))).rows
  }

  protected getInsertValuesString(columns: number, rows: number = 1): `VALUES ${string}` {
    let ret: `VALUES ${string}` = `VALUES `
    let index: number = 1
    for (let i = 0; i < rows; i++) {
      ret += '($'
      for (let j = 1; j <= columns; j++) {
        ret += (index++).toString() + ',$'
      }
      ret = ret.slice(0, -2) + '),' as any
    }
    return ret.slice(0, -1) as any
  }
  
}
