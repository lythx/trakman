import {
  DynamicComponent, StaticHeader, componentIds, centeredText, components
} from '../../ui/UI.js'
import config from './BetInfoWidget.config.js'

export default class BetInfoWidget extends DynamicComponent {

  readonly header: StaticHeader
  totalPrize: number = 1000
  posY!: number

  constructor() {
    super(componentIds.betInfoWidget)
    this.updatePosYAndHeight()
    this.header = new StaticHeader('race', {
      rectangleWidth: StaticHeader.racePreset.rectangleWidth -
        (config.prizeWidth + config.margin)
    })
    tm.addListener('EndMap', () => this.hide())
  }

  onBeginMap(): void {
    this.updatePosYAndHeight()
  }

  updatePosYAndHeight(): void {
    if (!config.placeAsLastComponent) {
      this.posY = config.posY
      return
    }
    const side = config.side === true ? 'right' : 'left'
    const data = components.staticHeights[tm.getGameMode()]
    this.posY = config.topBorder - data[side].reduce((acc, cur) =>
      acc += cur.getHeight() + config.marginBig, 0)
  }

  displayToPlayer(login: string): void {
    const w = config.prizeWidth
    const h = this.header.options.height
    const prizeXml = `<frame posn="${config.width - config.prizeWidth} 0 1">
    <quad posn="0 0 2" sizen="${w} ${h}" 
    bgcolor="${this.header.options.iconBackground}"/>
      ${centeredText('$' + config.prizeColour + this.totalPrize.toString() + 'C', w, h, {
      textScale: this.header.options.textScale
    })}
    </frame>`
    tm.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${this.posY} 2">
        ${this.header.constructXml(config.title, config.icon, config.side)}
        ${prizeXml}
      </frame>
    </manialink>`, login)
  }

  hide(): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
