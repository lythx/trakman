import fs from 'fs/promises'
import 'dotenv/config'

type Tag = 'warn' | 'fatal' | 'debug' | 'error' | 'info' | 'trace'

export abstract class Logger {

  private static logLevel = 0
  private static readonly consoleColours = {
    black: '\u001b[30m',
    red: '\u001b[31m',
    green: '\u001b[32m',
    yellow: '\u001b[33m',
    blue: '\u001b[34m',
    magenta: '\u001b[35m',
    cyan: '\u001b[36m',
    white: '\u001b[37m',
  } as const
  private static readonly logDir = './logs'
  private static readonly logTypes = {
    fatal: { level: 1, colour: this.consoleColours.red, files: [`${this.logDir}/fatal.log`, `${this.logDir}/error.log`, `${this.logDir}/combined.log`] },
    error: { level: 1, colour: this.consoleColours.red, files: [`${this.logDir}/error.log`, `${this.logDir}/combined.log`] },
    warn: { level: 2, colour: this.consoleColours.yellow, files: [`${this.logDir}/warn.log`, `${this.logDir}/combined.log`] },
    info: { level: 3, colour: this.consoleColours.green, files: [`${this.logDir}/info.log`, `${this.logDir}/combined.log`] },
    debug: { level: 4, colour: this.consoleColours.cyan, files: [`${this.logDir}/debug.log`, `${this.logDir}/combined.log`] },
    trace: { level: 5, colour: this.consoleColours.magenta, files: [`${this.logDir}/trace.log`, `${this.logDir}/combined.log`] },
  }
  private static crashed: boolean = false

  static async initialize(): Promise<void> {
    this.logLevel = Number(process.env.LOG_LEVEL)
    if (isNaN(this.logLevel)) {
      throw new Error('Error while initializing logger: LOG_LEVEL is not a number. Check if its set in the .env file.')
    }
    await fs.mkdir(this.logDir).catch((err: Error) => {
      if (err.message.startsWith('EEXIST') === false) { // ignore dir exists error
        throw new Error(`Error while creating log directory\n${err.message}\n\n${err.stack}`)
      }
    })
    process.on('uncaughtException', (err: Error) => {
      void Logger.fatal('Uncaught exception occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n'))) // indent fix
    })
    process.on('unhandledRejection', (err: Error) => {
      void Logger.fatal('Unhandled rejection occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n')))
    })
  }

  static async fatal(...lines: string[]): Promise<void> {
    if (this.crashed === true) { return }
    this.crashed = true
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'fatal'
    await this.writeLog(tag, location, date, lines)
    process.exit(1)
  }

  static error(...lines: string[]): void {
    if (this.crashed === true) { return }
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'error'
    this.writeLog(tag, location, date, lines)
  }

  static warn(...lines: string[]): void {
    if (this.crashed === true) { return }
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'warn'
    void this.writeLog(tag, location, date, lines)
  }

  static info(...lines: string[]): void {
    if (this.crashed === true) { return }
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'info'
    this.writeLog(tag, location, date, lines)
  }

  static debug(...lines: string[]): void {
    if (this.crashed === true) { return }
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'debug'
    this.writeLog(tag, location, date, lines)
  }

  static trace(...lines: string[]): void {
    if (this.crashed === true) { return }
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'trace'
    this.writeLog(tag, location, date, lines)
  }

  private static async writeLog(tag: Tag, location: string, date: string, lines: string[]): Promise<void> {
    if (lines.length === 0 || this.logTypes[tag].level > this.logLevel) { return }
    const logStr = this.getLogfileString(tag, lines, location, date)
    console.log(this.getConsoleString(tag, lines, location, date))
    for (const file of this.logTypes[tag].files) {
      await fs.appendFile(file, logStr)
    }
  }

  private static getLogfileString(tag: Tag, lines: string[], location: string, date: string): string {
    let ret = `<${tag.toUpperCase()}> [${date.substring(5, date.length - 4)}] (${location}) ${lines[0]}\n`
    for (let i = 1; i < lines.length; i++) {
      ret += `\t${lines[i]}\n`
    }
    return ret
  }

  private static getConsoleString(tag: Tag, lines: string[], location: string, date: string): string {
    const colour = this.logTypes[tag].colour
    const colourString = `\u001b${colour}`
    let ret = `<${colourString}${tag.toUpperCase()}\x1b[0m> [\u001b[34m${date.substring(5, date.length - 4)}\x1b[0m] (\u001b[36m${location}\x1b[0m) ${lines[0]}`
    for (let i = 1; i < lines.length; i++) {
      ret += `\n\t${lines[i]}`
    }
    return ret
  }

  private static getLocation(): string {
    const stack = new Error().stack
    if (stack === undefined) {
      return ''
    }
    const s = stack.split('\n')[3].split(' ').filter(a => a !== '')[2].split('/')
    const str = s[s.length - 1]
    return str.split(':').slice(0, 2).join(':')
  }

}
