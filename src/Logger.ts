import fs from 'fs/promises'
import 'dotenv/config'
import fetch from 'node-fetch'

type Tag = 'warn' | 'fatal' | 'debug' | 'error' | 'info' | 'trace'

export abstract class Logger {

  private static logLevel: number = 3
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
  private static readonly discordColours = {
    black: 0x000000,
    red: 0xFF0000,
    green: 0x00FF00,
    yellow: 0xFFFF00,
    blue: 0x0000FF,
    magenta: 0xFF00FF,
    cyan: 0x00FFFF,
    white: 0xFFFFFF
  }
  private static readonly separator: string = '---------------------------------------------'
  private static readonly logDir: string = './logs'
  private static readonly logTypes = {
    fatal: {
      level: 1, colour: this.consoleColours.red,
      files: [`${this.logDir}/fatal.log`, `${this.logDir}/error.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.red
    },
    error: {
      level: 1, colour: this.consoleColours.red,
      files: [`${this.logDir}/error.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.red
    },
    warn: {
      level: 2, colour: this.consoleColours.yellow,
      files: [`${this.logDir}/warn.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.yellow
    },
    info: {
      level: 3, colour: this.consoleColours.green,
      files: [`${this.logDir}/info.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.green
    },
    trace: {
      level: 4, colour: this.consoleColours.magenta,
      files: [`${this.logDir}/trace.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.magenta
    },
    debug: {
      level: 5, colour: this.consoleColours.cyan,
      files: [`${this.logDir}/debug.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.cyan
    },
  }
  private static readonly users: string[] = process.env.DISCORD_TAGGED_USERS?.split(',') ?? []
  private static readonly thumbs: string[] = process.env.DISCORD_EMBED_IMAGES?.split(',') ?? []
  private static readonly embedTitle: string = process.env.DISCORD_EMBED_TITLE ?? 'Trakman Log'
  private static readonly embedTitleUrl: string = process.env.DISCORD_EMBED_TITLE_URL ?? ''
  private static readonly embedTitleIconUrl: string = process.env.DISCORD_EMBED_TITLE_ICON_URL ?? ''
  private static crashed: boolean = false
  private static readonly useDiscord: boolean = process.env.DISCORD_LOG_ENABLED === 'YES'
  private static discordLogLevel: number = 2
  private static isFirstLog: boolean = true
  private static consoleQueue: string[] = []
  private static consoleDisabled: boolean = process.env.CONSOLE_LOG_DISABLED === 'YES'
  private static consoleOn: boolean = !this.consoleDisabled

  static async initialize(): Promise<void> {
    const envLogLevel = Number(process.env.LOG_LEVEL)
    if (isNaN(envLogLevel)) {
      this.warn(`LOG_LEVEL is undefined or not a number, default value (${this.logLevel})` +
        ` will be used. Check your .env file to change it`)
    } else if (envLogLevel < 0 || envLogLevel > 5) {
      this.warn(`LOG_LEVEL needs to be >=0 and <=5, received ${envLogLevel}.` +
        ` Default value (${this.logLevel}) will be used. Check your .env file to change it`)
    } else {
      this.logLevel = envLogLevel
    }
    await fs.mkdir(this.logDir).catch((err: Error): void => {
      if (!err.message.startsWith('EEXIST') && err.name !== "EEXIST") { // ignore dir exists error
        throw new Error(`Error while creating log directory\n${err.message}\n\n${err.stack}`)
      }
    })
    process.on('uncaughtException', (err: Error): void => {
      void this.fatal('Uncaught exception occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n'))) // indent fix
    })
    process.on('unhandledRejection', (err: Error): void => {
      void this.fatal('Unhandled rejection occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n')))
    })
    if (this.useDiscord) {
      const envDcLog = Number(process.env.DISCORD_LOG_LEVEL)
      const envDcWebhook = process.env.DISCORD_WEBHOOK_URL
      if (isNaN(envDcLog)) {
        this.warn(`DISCORD_LOG_LEVEL is undefined or not a number, ` +
          `default value (${this.discordLogLevel}) will be used. Check your .env file to change it`)
      } else if (envDcLog < 0 || envDcLog > 5) {
        this.warn(`DISCORD_LOG_LEVEL needs to be >=0 and <=5, received ${envDcLog}. ` +
          `Default value (${this.discordLogLevel}) will be used. Check your .env file to change it`)
      } else {
        this.discordLogLevel = envDcLog
      }
      if (envDcWebhook?.length === 0 || envDcWebhook === undefined) {
        this.error('DISCORD_WEBHOOK_URL is undefined. Check your .env file to use discord logging')
        return
      }
    }
  }

  /**
   * Adds a fatal error message into the log and exits the process
   * @param lines Message lines
   */
  static async fatal(...lines: any[]): Promise<void> {
    if (this.crashed) { return }
    this.crashed = true
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    // In case discord message hangs the process it exits after 10 seconds anyway
    setTimeout(() => process.exit(1), 10000)
    await this.writeLog('fatal', location, date, lines, true)
    process.exit(1)
  }

  /**
   * Adds an error message into the log
   * @param lines Message lines
   */
  static error(...lines: any[]): void {
    if (this.crashed) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    void this.writeLog('error', location, date, lines)
  }

  /**
   * Adds a warn message into the log
   * @param lines Message lines
   */
  static warn(...lines: any[]): void {
    if (this.crashed) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    void this.writeLog('warn', location, date, lines)
  }

  /**
   * Adds an info message into the log
   * @param lines Message lines
   */
  static info(...lines: any[]): void {
    if (this.crashed) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    void this.writeLog('info', location, date, lines)
  }

  /**
   * Adds a debug message into the log
   * @param lines Message lines
   */
  static debug(...lines: any[]): void {
    if (this.crashed) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    void this.writeLog('debug', location, date, lines)
  }

  /**
   * Adds a trace message into the log
   * @param lines Message lines
   */
  static trace(...lines: any[]): void {
    if (this.crashed) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    void this.writeLog('trace', location, date, lines)
  }

  /**
   * Try to print a message to the console
   * @param message
   * @param force
   */
  static consoleLog(message: string, force: boolean) {
    if (message !== '') {
      this.consoleQueue.push(message)
    }
    if (this.consoleQueue.length > 1000) {
      this.warn("Command input mode has been on for too long, re-enabling console logging")
    }
    if (force || this.consoleOn || this.consoleQueue.length > 1000) {
      this.consoleOn = true
      for (const m of this.consoleQueue) {
        console.log(m)
      }
      this.consoleQueue = []
    }
  }

  static disableConsole() {
    this.consoleOn = false
  }

  static enableConsole() {
    if (!this.consoleDisabled) {
      this.consoleLog('', true)
    }
  }

  private static async writeLog(tag: Tag, location: string, date: string, lines: any[], force = false): Promise<void> {
    if (lines.length === 0 || this.logTypes[tag].level > this.logLevel) { return }
    const logStr: string = this.getLogfileString(tag, lines, location, date)
    if (!this.consoleDisabled) {
      this.consoleLog(this.getConsoleString(tag, lines, location, date), force)
    }
    for (const file of this.logTypes[tag].files) {
      await fs.appendFile(file, logStr)
    }
    // This in theory should work but regex is weird. Maybe just remove the characters then?
    let str: string = lines.join('\n').replace(/[_*~|>`]/g, '\\$&')
    if (str.length > 500) {
      str = `${str.substring(0, 500)} [${str.length - 500} more characters]...`
    }
    if (this.useDiscord && this.logTypes[tag].level <= this.discordLogLevel) {
      const message = JSON.stringify({
        content: tag === 'fatal' ? this.users.join(' ') : (this.isFirstLog ? this.separator : undefined),
        embeds: [{
          author: {
            name: this.embedTitle,
            url: this.embedTitleUrl,
            icon_url: this.embedTitleIconUrl
          },
          title: `${tag.toUpperCase()} on server ${tm.utils.strip(tm.config.server.name, true)}`,
          timestamp: new Date(),
          color: this.logTypes[tag].discordColour,
          thumbnail: {
            url: this.thumbs.length === 0 ? undefined : this.thumbs[~~(Math.random() * this.thumbs.length)]
          },
          footer: {
            text: `📅`,
          },
          fields: [
            {
              name: `➡️ ${location}`,
              value: `⚠️ ${str}`,
            },
          ],
        }]
      })
      await this.sendDiscordMessage(message)
      this.isFirstLog = false
    }
  }

  private static async sendDiscordMessage(message: string) {
    const response: Response | Error = await fetch(process.env.DISCORD_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: message
    }).catch(e => e)
    if (response instanceof Error) {
      this.error('Could not send message to Discord.', response)
      return
    }
    if (!response.ok) {
      this.error('Discord log response not ok, status: ' + response.status)
    }
  }

  private static getLogfileString(tag: Tag, lines: string[], location: string, date: string): string {
    let ret: string = `<${tag.toUpperCase()}> [${date.substring(5, date.length - 4)}] (${location}) ${lines[0]}\n`
    for (let i: number = 1; i < lines.length; i++) {
      ret += `\t${lines[i]}\n`
    }
    return ret
  }

  private static getConsoleString(tag: Tag, lines: string[], location: string, date: string): string {
    const colour: string = this.logTypes[tag].colour
    const colourString: string = `\u001b${colour}`
    let ret: string = `<${colourString}${tag.toUpperCase()}\x1b[0m> [\u001b[34m${date.substring(5, date.length - 4)}\x1b[0m] (\u001b[36m${location}\x1b[0m) ${lines[0]}`
    for (let i: number = 1; i < lines.length; i++) {
      ret += `\n\t${lines[i]}`
    }
    return ret
  }

  private static getLocation(): string {
    const stack: string | undefined = new Error().stack
    if (stack === undefined) {
      return ''
    }
    let s: string[] = stack.split('\n')[3].split(' ').filter(a => a !== '')
    s = s[s.length - 1].split('/')
    const str: string = s[s.length - 1]
    return str.split(':').slice(0, 2).join(':')
  }

}
