'use strict'
import Database from './DB.js'

class Repository {
  _db = new Database()

  async initialize () {
    await this._db.initialize()
  }

  /**
   * Adds an array of objects to the database
   * @param {Object[]} objects the objects
   * @return {Promise<any[]>} query result
   */
  async add (objects) { }
}

export default Repository
