import fs from 'fs/promises'

type Tag = 'warn' | 'fatal' | 'debug' | 'error' | 'info' | 'trace'

export class Logger {

  private static readonly tagConsoleColours = {
    warn: '[33m',
    fatal: '[31m',
    error: '[31m',
    info: '[32m',
    debug: '[36m',
    trace: '[35m'
  } as const
  private static readonly logDir = './logs'
  private static readonly logs = {
    combined: `${this.logDir}/combined.log`,
    fatal: `${this.logDir}/fatal.log`,
    error: `${this.logDir}/error.log`,
    warn: `${this.logDir}/warn.log`,
    info: `${this.logDir}/info.log`,
    trace: `${this.logDir}/trace.log`,
    debug: `${this.logDir}/debug.log`
  } as const

  static async initialize(): Promise<void> {
    await fs.mkdir(this.logDir).catch((err: Error) => {
      if (err.message.startsWith('EEXIST') === false) { // ignore dir exists error
        throw new Error(`Error while creating log directory\n${err.message}\n\n${err.stack}`)
      }
    })
    process.on('uncaughtException', async (err: Error) => {
      Logger.fatal('Uncaught exception occured: ', err.message, err.stack ?? '')
    })
    process.on('unhandledRejection', async (err: Error) => {
      Logger.fatal('Unhandled rejection occured: ', err.message, err.stack ?? '')
    })
  }

  static warn(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'warn'
    this.writeLog(tag, location, date, lines)
  }

  static fatal(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'fatal'
    if (lines.length === 0) { return }
    const logStr = this.getLogfileString(tag, lines, location, date)
    console.log(this.getConsoleString(tag, lines, location, date))
    void fs.appendFile(this.logs[tag], logStr)
    void fs.appendFile(this.logs.error, logStr) // Fatal errors are appended to error log too
    void fs.appendFile(this.logs.combined, logStr)
    process.exit(1)
  }

  static error(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'error'
    this.writeLog(tag, location, date, lines)
  }

  static trace(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'trace'
    this.writeLog(tag, location, date, lines)
  }

  static info(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'info'
    this.writeLog(tag, location, date, lines)
  }

  static debug(...lines: string[]): void {
    const date = new Date().toUTCString()
    const location = this.getLocation()
    const tag: Tag = 'debug'
    this.writeLog(tag, location, date, lines)
  }

  private static writeLog(tag: Tag, location: string, date: string, lines: string[]) {
    if (lines.length === 0) { return }
    const logStr = this.getLogfileString(tag, lines, location, date)
    console.log(this.getConsoleString(tag, lines, location, date))
    void fs.appendFile(this.logs[tag], logStr)
    void fs.appendFile(this.logs.combined, logStr)
  }

  private static getLogfileString(tag: Tag, lines: string[], location: string, date: string): string {
    let ret = `<${tag.toUpperCase()}> [${date.substring(5, date.length - 4)}] (${location}) ${lines[0]}\n`
    for (let i = 1; i < lines.length; i++) {
      ret += `\t${lines[i]}\n`
    }
    return ret
  }

  private static getConsoleString(tag: Tag, lines: string[], location: string, date: string): string {
    const colour = this.tagConsoleColours[tag]
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
