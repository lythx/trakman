'use strict'
class Logger {
  static log (str) {
    console.log(`<Log>${str}`)
  }

  static warn (str) {
    console.log(`\u001b[33m<Warn>${str}\x1b[0m`)
  }

  static fatal (str) {
    console.log(`\u001b[31m<Fatal>${str}\x1b[0m`)
  }

  static error (str) {
    console.log(`\u001b[31m$<Fatal>${str}\x1b[0m`)
  }

  static trace (str) {
    console.log(`\u001b[35m<Trace>${str}\x1b[0m`)
  }

  static info (str) {
    console.log(`\u001b[32m<Info>${str}\x1b[0m`)
  }

  static debug (str) {
    console.log(`\u001b[36m<Debug>${str}\x1b[0m`)
  }
}

export default Logger
