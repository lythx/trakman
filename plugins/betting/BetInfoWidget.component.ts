import {
  DynamicComponent, StaticHeader, componentIds
} from '../ui/UI.js'
import config from './BetInfoWidget.config.js'

export default class BetInfoWidget extends DynamicComponent {

  readonly header: StaticHeader

  constructor() {
    super(componentIds.betInfoWidget)
    this.header = new StaticHeader('race', {
      rectangleWidth: StaticHeader.racePreset.rectangleWidth - config.prizeWidth
    })
    tm.addListener('EndMap', () => this.hide())
  }

  displayToPlayer(login: string): void {
    tm.sendManialink(`<manialink id="${this.id}">
      <format textsize="1"/>
      <frame posn="${config.posX} ${config.posY} 2">
        ${this.header.constructXml(config.title, config.icon, config.side)}
      </frame>
    </manialink>`, login)
  }

  hide(): void {
    tm.sendManialink(`<manialink id="${this.id}"></manialink>`)
  }

}
