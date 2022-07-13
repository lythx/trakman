import fs from 'fs/promises'

type Tag = 'Log' | 'Warn' | 'Fatal' | 'Debug' | 'Error' | 'Trace' | 'Info'

// TODO: make logs appearance and file locations customizable in config

export class Logger {

  static readonly tagConsoleColours = {
    Warn: '[33m',
    Fatal: '[31m',
    Error: '[31m',
    Trace: '[35m',
    Info: '[32m',
    Debug: '[36m'
  } as const

  static log(str: string): void {
    console.log(`<Log>${str}`)
  }

  static warn(str: string): void {
    const date = new Date().toUTCString()
    const s = `<Warn> [${date.substring(5, date.length - 4)}] ${str}`
    fs.appendFile('./logs/warnLog.txt', s)
    console.log(`\u001b[33m${s}\x1b[0m`)
  }

  static fatal(str: string): void {
    console.log(`\u001b[31m<Fatal>${str}\x1b[0m`)
  }

  static error(str: string): void {
    fs.appendFile('./logs/errorLog.txt', `<${new Date().toUTCString()}>${str}`)
    console.log(`\u001b[31m<Fatal>${str}\x1b[0m`)
  }

  static trace(str: string): void {
    console.log(`\u001b[35m<Trace>${str}\x1b[0m`)
  }

  static info(str: string): void {
    console.log(`\u001b[32m<Info>${str}\x1b[0m`)
  }

  static debug(str: string): void {
    console.log(`\u001b[36m<Debug>${str}\x1b[0m`)
  }

  private static formatString(tag: Tag, str: string): string {
    const date = new Date().toUTCString()
    const colour = (this.tagConsoleColours as any)[tag]
    const colourString = colour === undefined ? `\u001b${colour}` : ``
    return `${colourString}<${tag}> [${date.substring(5, date.length - 4)}] ${str}\x1b[0m`
  }

}

process.on('uncaughtException', async (err: Error) => {
  Logger.fatal('Uncaught exception occured: ')
  console.log(err.message + '\n' + err?.stack)
  await fs.appendFile('./logs/crashLog.txt', `${new Date().toUTCString()}\n${err.message}\n${err?.stack}\n\n`)
  process.exit(1)
})
