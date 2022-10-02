import fs from 'fs/promises'
import config from '../config/Logging.js'
import { WebhookClient, EmbedBuilder } from 'discord.js'

type Tag = 'warn' | 'fatal' | 'debug' | 'error' | 'info' | 'trace'

export abstract class Logger {

  private static logLevel: number = 0
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
    debug: {
      level: 4, colour: this.consoleColours.cyan,
      files: [`${this.logDir}/debug.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.cyan
    },
    trace: {
      level: 5, colour: this.consoleColours.magenta,
      files: [`${this.logDir}/trace.log`, `${this.logDir}/combined.log`], discordColour: this.discordColours.magenta
    },
  }
  private static crashed: boolean = false
  private static readonly useDiscord: boolean = config.discordEnabled === true
  private static webhook: WebhookClient
  private static discordLogLevel: number
  private static isFirstLog: boolean = true

  static async initialize(): Promise<void> {
    this.logLevel = Number(config.logLevel)
    if (isNaN(this.logLevel)) {
      throw new Error('Error while initializing logger: LOG_LEVEL is not a number. Check if its set in the .env file.')
    }
    await fs.mkdir(this.logDir).catch((err: Error): void => {
      if (err.message.startsWith('EEXIST') === false) { // ignore dir exists error
        throw new Error(`Error while creating log directory\n${err.message}\n\n${err.stack}`)
      }
    })
    process.on('uncaughtException', (err: Error): void => {
      void this.fatal('Uncaught exception occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n'))) // indent fix
    })
    process.on('unhandledRejection', (err: Error): void => {
      void this.fatal('Unhandled rejection occured: ', err.message, ...(err.stack === undefined ? '' : err.stack.split('\n')))
    })
    if (this.useDiscord === true) {
      this.discordLogLevel = Number(config.discordLogLevel)
      if (isNaN(this.discordLogLevel)) {
        await this.fatal('DISCORD_LOG_LEVEL is undefined or not a number. Check your .env file')
        return
      }
      if (config.discordWebhookUrl === undefined) {
        await this.fatal('DISCORD_WEEBHOOK_URL is undefined. Check your .env file')
        return
      }
      this.webhook = new WebhookClient({ url: config.discordWebhookUrl })
    }
  }

  /**
   * Outputs an error message into the console and exits the process
   * @param lines Error messages
   */
  static async fatal(...lines: any[]): Promise<void> {
    if (this.crashed === true) { return }
    this.crashed = true
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'fatal'
    await this.writeLog(tag, location, date, lines)
    process.exit(1)
  }

  /**
   * Outputs an error message into the console
   * @param lines Error messages
   */
  static error(...lines: any[]): void {
    if (this.crashed === true) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'error'
    void this.writeLog(tag, location, date, lines)
  }

  static warn(...lines: any[]): void {
    if (this.crashed === true) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'warn'
    void this.writeLog(tag, location, date, lines)
  }

  static info(...lines: any[]): void {
    if (this.crashed === true) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'info'
    void this.writeLog(tag, location, date, lines)
  }

  static debug(...lines: any[]): void {
    if (this.crashed === true) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'debug'
    void this.writeLog(tag, location, date, lines)
  }

  static trace(...lines: any[]): void {
    if (this.crashed === true) { return }
    const date: string = new Date().toUTCString()
    const location: string = this.getLocation()
    const tag: Tag = 'trace'
    void this.writeLog(tag, location, date, lines)
  }

  private static async writeLog(tag: Tag, location: string, date: string, lines: any[]): Promise<void> {
    if (lines.length === 0 || this.logTypes[tag].level > this.logLevel) { return }
    const logStr: string = this.getLogfileString(tag, lines, location, date)
    console.log(this.getConsoleString(tag, lines, location, date))
    // This in theory should work but regex is weird. Maybe just remove the characters then?
    let str: string = lines.join('\n').replace(/[_*~|>`]/g, '\\$&')
    if (str.length > 500) {
      str = `${str.substring(0, 500)} [${str.length - 500} more characters]...`
    }
    for (const file of this.logTypes[tag].files) {
      await fs.appendFile(file, logStr)
    }
    if (this.useDiscord === true && this.logTypes[tag].level <= this.discordLogLevel) {
      const users: string[] = config.discordTaggedUsers.length === 0 ? [] : config.discordTaggedUsers
      const thumbs: string[] = config.discordEmbedImages.length === 0 ? [] : config.discordEmbedImages
      const embed: EmbedBuilder = new EmbedBuilder()
        .setTitle(`${tag.toUpperCase()} on server ${tm.state.serverConfig.login}`)
        .setColor(this.logTypes[tag].discordColour)
        .setTimestamp(new Date())
        .setThumbnail(thumbs[~~(Math.random() * thumbs.length)])
        .addFields([
          {
            name: location,
            value: str
          }
        ]
        )
      const separator: string | undefined = this.isFirstLog === false ? undefined : '---------------------------------------------'
      if (tag === 'fatal') {
        await this.webhook.send({
          content: (separator ?? '') + '\n' + users.join(' '),
          embeds: [embed]
        })
      } else {
        await this.webhook.send({
          content: separator,
          embeds: [embed]
        })
      }
      this.isFirstLog = false
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
