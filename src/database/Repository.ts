import { Database } from './DB.js'

export abstract class Repository {

  protected db: Database = new Database()

  async initialize(): Promise<void> {
    await this.db.initialize()
  }
  
}
