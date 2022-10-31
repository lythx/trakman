import {
  DynamicComponent, StaticHeader, Grid, GridCellFunction,
  centeredText, icons, addManialinkListener
} from '../ui/UI.js'
import config from './Config.js'

const p = tm.utils.palette

// TODO finish

export default class BettingWindow extends DynamicComponent {

  private readonly header: StaticHeader
  private readonly grid: Grid
  private iftimehasrunout = true
  private readonly bets: string[] = []
  private prize: number | undefined
  private readonly headerRectW: number

  constructor() {
    super(config.id)
    this.headerRectW = config.width - (StaticHeader.racePreset.squareWidth + config.timerWidth + StaticHeader.racePreset.margin * 2)
    this.header = new StaticHeader('race', { rectangleWidth: this.headerRectW })
    this.grid = new Grid(config.width + config.margin * 2, config.height - (StaticHeader.raceHeight), [1, 1, 1], [1, 1], {
      background: config.background, margin: config.margin
    })
    tm.addListener('ServerStateChanged', (state) => {
      if (state !== 'race') { return }
      tm.sendMessage('betting has doing the begun')
      this.bets.length = 0
      this.iftimehasrunout = false
      this.prize = undefined
      const unitedPlayers = tm.players.list.filter(a => a.isUnited)
      for (const e of unitedPlayers) {
        this.displayToPlayer(e.login)
      }
      const interval = setInterval(() => {
        for (const e of unitedPlayers) {
          this.displayToPlayer(e.login)
        }
        if (tm.state.raceTimeLimit - tm.state.remainingRaceTime < config.time) { return }
        this.iftimehasrunout = true
        if (this.prize === undefined) { // TODO handle one player
          tm.sendMessage(`${p.server}No bets have been placed. Try again next round.`)
        } else {
          tm.sendMessage(`${p.server}Time to accept the bet has run out.`)
        }
        for (const e of unitedPlayers) {
          this.hideToPlayer(e.login)
        }
        clearInterval(interval)
      }, 1000)
    })
    tm.addListener('EndMap', () => {
      if (this.prize === undefined) { return }
      const bestRecord = tm.records.live.find(a => this.bets.includes(a.login))
      if (bestRecord === undefined) {
        for (const i of this.bets) {
          tm.utils.payCoppers(i, this.prize * 0.75, 'maybe finish next time if you plan on betting??')
          tm.sendMessage(`${p.server}No player has won the bet. Bet amounts have been returned.`)
        }
        return
      }
      tm.utils.payCoppers(bestRecord.login, this.prize * this.bets.length * 0.75, 'GG FOR BET')
      tm.sendMessage(`${p.admin}${bestRecord.nickname} ${p.server}Has won ${p.admin}${this.prize * this.bets.length} ${p.server}coppers.`)
    })
    addManialinkListener(this.id + config.actionIdOffset, config.options.length, async (info, offset) => {
      const amount = config.options[offset]
      const status = await tm.utils.sendCoppers(info.login, amount, 'GG') // TODO check
      if (status === true) {
        this.bets.push(info.login)
        this.prize = amount
        tm.sendMessage(`${p.server}${tm.utils.strip(info.nickname)} Has started a bet with ${p.admin}${this.prize} ${p.server}coppers.`)
        const unitedPlayers = tm.players.list.filter(a => a.isUnited)
        this.hideToPlayer(info.login)
        for (const e of unitedPlayers) {
          this.displayToPlayer(e.login)
        }
      }
    })
    addManialinkListener(this.id + config.actionIdOffset + config.options.length, async (info) => {
      if (this.prize === undefined) { return }
      const check = await tm.utils.sendCoppers(info.login, this.prize, 'GG')
      if (check === true) {
        this.bets.push(info.login)
        tm.sendMessage(`${p.admin}${info.nickname} ${p.server}has accepted the bet.`)
        this.hideToPlayer(info.login)
      }
    })
  }

  displayToPlayer(login: string): void {
    const cell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="0 0 1" sizen="${w} ${h}" bgcolor="${config.background}" action="${this.id + j + (i * 3) + config.actionIdOffset}"/>
      ${centeredText(config.options[j + (i * 3)].toString(), w, h)}`
    }
    let content: string
    if (this.bets.includes(login)) {
      content = `<quad posn="${config.margin} 0 0" sizen="${config.width} ${this.grid.height}" 
      background="${config.background}" action="${this.id + config.options.length + config.actionIdOffset}"/>
      ${centeredText(`Bet accepted. Prize: ${(this.prize ?? 0) * this.bets.length}`, config.width, this.grid.height)}`
    } else if (this.prize === undefined) {
      const cells: GridCellFunction[] = []
      for (let i = 0; i < config.options.length; i++) { cells.push(cell) }
      content = this.grid.constructXml(cells)
    } else {
      content = `<quad posn="${config.margin} 0 0" sizen="${config.width} ${this.grid.height}" 
      background="${config.background}" action="${this.id + config.options.length + config.actionIdOffset}"/>
      ${centeredText(`Bet ${this.prize}`, config.width, this.grid.height)}`
    }
    const headerW = this.header.options.squareWidth + this.headerRectW + config.margin * 2
    const topRightW = config.width - headerW
    tm.sendManialink(`
    <manialink this.id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${config.posY} -1">
        ${this.header.constructXml(config.headerText, icons.placeholder, true)}
        <frame posn="${headerW} 0 0">
          <quad posn="0 0 1" sizen="${topRightW} ${this.header.options.height}" bgcolor="${config.background}"/>
          ${centeredText((tm.state.raceTimeLimit - tm.state.remainingRaceTime).toString(), topRightW, StaticHeader.raceHeight)}
        </frame>
        <frame posn="${-config.margin} ${-StaticHeader.raceHeight} 0">
          ${content}
        </frame>
      </frame>
    </manialink>`, login)
  }

  hide(): void {
    tm.sendManialink(`<manialink this.id="${this.id}"></manialink>`)
  }

}

if (config.enabled) {
  new BettingWindow()
}
