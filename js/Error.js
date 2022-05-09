'use strict'
const logger = require('tracer').colorConsole()

class Error {
  /**
    * Logs error and exit process with code 1
    * @param {String} str first line of log
    * @param {String} errstr error string
    * @param {Number} errcode error code
    */
  static fatal (str, errstr, errcode) {
    logger.fatal(str)
    if (errstr && errcode) { logger.fatal(`error code: ${errcode}, error: ${errstr}`) } else if (errstr && !errcode) { logger.fatal(`error: ${errstr}`) } else if (!errstr && errcode) { logger.fatal(`error code: ${errcode}`) }
    logger.fatal('Aborting...')
    process.exit(1)
  }
}

module.exports = Error
