'use strict'
export class Logger {
  static log (str: string) {
    console.log(`<Log>${str}`)
  }

  static warn (str: string) {
    console.log(`\u001b[33m<Warn>${str}\x1b[0m`)
  }

  static fatal (str: string) {
    console.log(`\u001b[31m<Fatal>${str}\x1b[0m`)
  }

  static error (str: string) {
    console.log(`\u001b[31m$<Fatal>${str}\x1b[0m`)
  }

  static trace (str: string) {
    console.log(`\u001b[35m<Trace>${str}\x1b[0m`)
  }

  static info (str: string) {
    console.log(`\u001b[32m<Info>${str}\x1b[0m`)
  }

  static debug (str: string) {
    console.log(`\u001b[36m<Debug>${str}\x1b[0m`)
  }
}
