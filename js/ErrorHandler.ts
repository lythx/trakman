import { Logger } from './Logger.js'

export class ErrorHandler extends Error {
  /**
     * Logs error and exit process with code 1
     * @param {(string | Error)[]} lines
     */
  static fatal(...lines: string[]) {
    for (const line of lines) { Logger.fatal(line) }
    Logger.fatal('Aborting...')
    process.exit(1)
  }

  /**
    * Logs error
    * @param {(string | Error)[]} lines
    */
  static error(...lines: string[]) {
    for (const line of lines) { Logger.error(line) }
  }
}
