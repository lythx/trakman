'use strict'
import Database from './DB.js'

class Repository {
  _db = new Database()

  /**
   * Adds an array of objects to the database
   * @param {Object[]} objects the objects
   * @return {Promise<any[]>} query result
   */
  async add (objects) { }
}

export default Repository
