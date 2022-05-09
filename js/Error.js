'use strict'
import Logger from './Logger.js'

class Error {
  /**
    * Logs error and exit process with code 1
    * @param {String} str first line of log
    * @param {String} errstr error string
    * @param {Number} errcode error code
    */
  static fatal (str, errstr, errcode) {
    Logger.fatal(str)
    if (errstr && errcode) { Logger.fatal(`error code: ${errcode}, error: ${errstr}`) } else if (errstr && !errcode) { Logger.fatal(`error: ${errstr}`) } else if (!errstr && errcode) { Logger.fatal(`error code: ${errcode}`) }
    Logger.fatal('Aborting...')
    process.exit(1)
  }
}

export default Error
