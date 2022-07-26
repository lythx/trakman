import { Database } from './OldDB.js'

export abstract class Repository {

  protected db: Database = new Database()

  async initialize(): Promise<void> {
    await this.db.initialize()
  }
  
}
