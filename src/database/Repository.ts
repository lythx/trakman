import { Database } from './DB.js'

/**
 * @abstract
 */
export abstract class Repository {
  protected db = new Database()

  async initialize(): Promise<void> {
    await this.db.initialize()
  }

  /**
   * Adds an array of objects to the database
   * @param {Object[]} objects the objects
   * @return {Promise<any[]>} query result
   */
  abstract add(objects: Object): Promise<any>
}
