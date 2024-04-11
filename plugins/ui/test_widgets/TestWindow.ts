import fs from 'node:fs/promises'
import config from './TestWidget.config.js'

export default class TestWindow {

  private intervals: { login: string, interval: NodeJS.Timeout }[] = []

  constructor() {
    tm.commands.add(
      {
        aliases: config.commands.displaytest.aliases,
        help: config.commands.displaytest.help,
        callback: (info): void => {
          if (this.intervals.some(a => a.login === info.login)) { return }
          this.intervals.push({
            interval: setInterval((): void => {
              this.displayToPlayer(info.login)
            }, config.refreshTimeout),
            login: info.login
          })
        },
        privilege: config.commands.displaytest.privilege
      },
      {
        aliases: config.commands.hidetest.aliases,
        help: config.commands.hidetest.help,
        callback: (info): void => {
          const entry = this.intervals.find(a => a.login === info.login)
          if (entry !== undefined) {
            this.hideToPlayer(entry.login)
            clearInterval(entry.interval)
            this.intervals = this.intervals.filter(a => a.login !== info.login)
          }
        },
        privilege: config.commands.hidetest.privilege
      }
    )
  }

  async displayToPlayer(login: string): Promise<void> {
    if (!config.isEnabled) { return }
    const file: Buffer | Error = await fs.readFile(`./plugins/ui/test_widgets/${config.file}`).catch((err: Error) => err)
    if (file instanceof Error) { return }
    tm.sendManialink(`<manialink id="test">${file.toString()}</manialink>`, login)
  }

  hideToPlayer(login: string): void {
    tm.sendManialink(`<manialink id="test"></manialink>`, login)
  }

}
