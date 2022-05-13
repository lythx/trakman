import { Logger } from './Logger.js'

export class ErrorHandler extends Error {
  /**
     * Logs error and exit process with code 1
     * @param {(string | Error)[]} lines
     */
  static fatal (...lines: string[]) {
    for (const line of lines) { Logger.fatal(line) }
    Logger.fatal('Aborting...')
    process.exit(1)
  }

  /**
     * Logs error without exiting
     * @param {String} str first line of log
     * @param {String} errstr error string
     * @param {Number} errcode error code
     */
  static error (str: string, errstr: string, errcode: number) {
    Logger.warn(str)
    if (errstr && errcode) {
      Logger.warn(`error code: ${errcode}, error: ${errstr}`)
    } else if (errstr && !errcode) {
      Logger.warn(`error: ${errstr}`)
    } else if (!errstr && errcode) {
      Logger.warn(`error code: ${errcode}`)
    }
  }
}
