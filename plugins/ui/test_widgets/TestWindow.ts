import fs from 'node:fs/promises'
import config from './TestWidget.config.js'

export default class TestWindow {

  private intervals: { login: string, interval: NodeJS.Timer }[] = []

  constructor() {
    tm.commands.add({
      aliases: ['displaytest'],
      help: 'Displays current test window',
      callback: (info): void => {
        if (this.intervals.some(a => a.login === info.login)) { return }
        this.intervals.push({
          interval: setInterval((): void => {
            this.displayToPlayer(info.login)
          }, config.refreshTimeout),
          login: info.login
        })
      },
      privilege: 3
    })
    tm.commands.add({
      aliases: ['hidetest'],
      help: 'Hides current test window',
      callback: (info): void => {
        const entry = this.intervals.find(a => a.login === info.login)
        if (entry !== undefined) {
          clearInterval(entry.interval)
          this.intervals = this.intervals.filter(a => a.login !== info.login)
        }
      },
      privilege: 3
    })
  }

  async displayToPlayer(login: string): Promise<void> {
    if (config.isEnabled === false) { return }
    const file: Buffer | Error = await fs.readFile(`./plugins/ui/test_widgets/${config.file}`).catch((err: Error) => err)
    if (file instanceof Error) { return }
    tm.sendManialink(file.toString(), login)
  }

}
