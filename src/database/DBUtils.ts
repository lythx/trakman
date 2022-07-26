import { Database } from './DB.js'

export abstract class Repository {

  protected db: Database = new Database()

  async initialize(): Promise<void> {
    await this.db.initialize()
  }

  protected async selectQuery(tableName: string): Promise<any[]>

  protected async selectQuery(tableName: string, whereStatement: `WHERE ${string}`, whereStatementValues: any[]): Promise<any[]>

  protected async selectQuery(tableName: string, whereStatement?: `WHERE ${string}`, whereStatementValues: any[] = []): Promise<any[]> {
    let query: string = `SELECT * FROM ${tableName}`
    if (whereStatement !== undefined) {
      query += ` ${whereStatement}`
    }
    return (await this.db.query(query, [...whereStatementValues])).rows
  }

  protected async insertQuery<T extends { [valueName: string]: any }>(tableName: string, order: (keyof T)[], objects: T[]): Promise<void> {
    let query: string = `INSERT INTO ${tableName}(${order.join(', ')}) VALUES`
    const values: any = []
    let i: number = 1
    for (const e of objects) {
      query += '($'
      for (let j = 0; j < order.length; j++) {
        query += (i++).toString() + ',$'
        values.push(e[order[i]])
      }
      query = query.slice(0, -2) + '),'
    }
    await this.db.query(query.slice(0, -1), values)
  }

  protected async updateQuery<T extends { [valueName: string]: any }>(tableName: string,
    valuesToSet: T, whereStatement: `WHERE ${string}`, whereStatementValues: any[]): Promise<void> {
    let setStr = ''
    let setIndex = 1
    const values: any[] = []
    for (const [k, v] of Object.entries(valuesToSet)) {
      setStr += `${k}=$${setIndex++} `
      values.push(v)
    }
    const query: string = `UPDATE ${tableName} SET ${setStr} ${whereStatement}`
    await this.db.query(query, [...whereStatementValues, ...values])
  }

  protected async deleteQuery(tableName: string, whereStatement: `WHERE ${string}`, whereStatementValues: any[]): Promise<void> {
    const query: string = `DELETE FROM ${tableName} ${whereStatement}`
    await this.db.query(query, [...whereStatementValues])
  }

}
