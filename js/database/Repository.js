'use strict'
import Database from './DB.js'
import ErrorHandler from '../ErrorHandler.js'

/**
 * @abstract
 */
class Repository {
  _db = new Database()

  constructor () {
    if (this.constructor === Repository) {
      ErrorHandler.fatal("Abstract class Repository cannot be instantiated directly.")
    }
  }

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
