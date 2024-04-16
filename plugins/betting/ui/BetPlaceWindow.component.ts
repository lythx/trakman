import {
  DynamicComponent, StaticHeader, Grid, type GridCellFunction,
  centeredText, icons, addManialinkListener, componentIds, components
} from '../../ui/UI.js'
import config from './BetPlaceWindow.config.js'

export default class BetPlaceWindow extends DynamicComponent {

  private readonly header: StaticHeader
  private readonly headerRectW: number
  private posY!: number
  private height!: number
  prize?: number
  betLogins: string[] = []
  onBetStart: (player: tm.Player, amount: number) => void = () => undefined
  onBetAccept: (player: tm.Player) => void = () => undefined

  constructor() {
    super(componentIds.betPlaceWindow)
    this.headerRectW = config.width - (StaticHeader.racePreset.squareWidth +
      config.timerWidth + StaticHeader.racePreset.margin * 2)
    this.header = new StaticHeader('race', { rectangleWidth: this.headerRectW })
    this.updatePosYAndHeight()
    addManialinkListener(this.id + config.actionIdOffset,
      config.options.length, (info, offset) => {
        const amount = config.options[offset]
        this.onBetStart(info, amount)
      })
    addManialinkListener(this.id + config.actionIdOffset + config.options.length,
      async (info) => this.onBetAccept(info))
  }

  onBeginMap(): void {
    this.updatePosYAndHeight()
  }

  private updatePosYAndHeight(): void {
    const side = config.relativePos.side === true ? 'right' : 'left'
    const data = components.staticHeights[tm.getGameMode()]
    this.height = config.staticPos.height ?? data[side][config.relativePos.widgetNumber]?.getHeight() ?? 0
    this.posY = config.staticPos.posY ??
      (config.topBorder - data[side].slice(0, config.relativePos.widgetNumber)
        .reduce((acc, cur) => acc += cur.getHeight() + config.marginBig, 0))
  }

  displayToPlayer(login: string, params: { seconds: number, placedBet: boolean }): void {
    const grid = new Grid(config.width + config.margin * 2,
      this.height + config.margin - StaticHeader.raceHeight, [1, 1, 1], [1, 1], {
      background: config.background, margin: config.margin
    })
    const cell: GridCellFunction = (i, j, w, h) => {
      return `<quad posn="0 0 1" sizen="${w} ${h}" action="${this.id + j + (i * 3) + config.actionIdOffset}"/>
      ${centeredText(config.options[j + (i * 3)].toString(), w, h)}`
    }
    let content: string
    if (params.placedBet) {
      const h = grid.height - grid.margin * 2
      content = `<quad posn="${config.margin} ${-config.margin} 0" sizen="${config.width} ${h}" 
      bgcolor="${config.background}" action="${this.id + config.options.length + config.actionIdOffset}"/>
      ${centeredText(`Bet accepted`, config.width, h / 2, config.betAcceptedText)}
      ${centeredText(`Prize: $${tm.utils.palette.green}${(this.prize ?? 0) * this.betLogins.length}C`, config.width,
        h / 2, { yOffset: h / 2 + config.prizeText.yOffset, textScale: config.prizeText.textScale })}`
    } else if (this.prize === undefined) {
      const cells: GridCellFunction[] = []
      for (let i = 0; i < config.options.length; i++) { cells.push(cell) }
      content = grid.constructXml(cells)
    } else {
      const h = grid.height - grid.margin * 2
      content = `<quad posn="${config.margin} ${-config.margin} 0" sizen="${config.width} ${h}" 
      bgcolor="${config.background}" action="${this.id + config.options.length + config.actionIdOffset}"/>
      ${centeredText(`Bet $${config.prizeColour}${this.prize}C`, config.width, h, config.betAmountText)}`
    }
    const headerW = this.header.options.squareWidth + this.headerRectW + config.margin * 2
    const topRightW = config.width - headerW
    const countdownColour = this.getCountdownColour(params.seconds)
    tm.sendManialink(`
    <manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${this.posY} -1">
        ${this.header.constructXml(config.headerText, icons.placeholder, true)}
        <frame posn="${headerW} 0 0">
          <quad posn="0 0 1" sizen="${topRightW} ${this.header.options.height}" 
          bgcolor="${this.header.options.iconBackground}"/>
          ${centeredText('$' + countdownColour + params.seconds.toString(),
      topRightW, StaticHeader.raceHeight, config.countdownText)}
        </frame>
        <frame posn="${-config.margin} ${-StaticHeader.raceHeight} 0">
          ${content}
        </frame>
      </frame>
    </manialink>`, login)
  }

  private getCountdownColour(seconds: number) {
    if (seconds <= config.countdown.colourChanges[1]) {
      return config.countdown.colours[2]
    }
    if (seconds <= config.countdown.colourChanges[0]) {
      return config.countdown.colours[1]
    }
    return config.countdown.colours[0]
  }

}
