import { Database } from './DB.js'

/**
 * @abstract
 */
export abstract class Repository {

  protected db: Database = new Database()

  async initialize(): Promise<void> {
    await this.db.initialize()
  }
}
