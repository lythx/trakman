import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, calculateStaticPositionY, staticHeader, stringToObjectProperty, ICONS, centeredText } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg = CONFIG.static.bgColor
  private readonly width = CONFIG.static.width
  private readonly height = CONFIG.liveCheckpoint.height
  private readonly positionX = CONFIG.static.rightPosition
  private readonly positionY: number
  private readonly side = CONFIG.liveCheckpoint.side
  private readonly title = CONFIG.liveCheckpoint.title
  private readonly icon = CONFIG.liveCheckpoint.icon
  private readonly headerHeight = CONFIG.staticHeader.height
  private readonly margin = CONFIG.static.marginSmall
  private readonly colours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }

  constructor() {
    super(IDS.LiveCheckpoint, 'race')
    this.positionY = calculateStaticPositionY('liveCheckpoint')
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      const pb = TM.getPlayerRecord(info.player.login)
      if (pb !== undefined) {
        const cpIndex = info.index
        console.log(pb.checkpoints[cpIndex])
        console.log(cpIndex)
        const diff = pb.checkpoints[cpIndex] - info.time
        this.displayToPlayer(info.player.login, info.time, diff)
      } else {
        this.displayToPlayer(info.player.login, info.time)
      }
    })
  }

  display(): void {
    this._isDisplayed = true
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, checkpointTime?: number, difference?: number): void {
    const iconUrl = stringToObjectProperty(this.icon, ICONS)
    let timeString = ''
    if (checkpointTime !== undefined) {
      timeString = TM.Utils.getTimeString(checkpointTime)
    }
    let differenceString = ''
    if (difference !== undefined) {
      if (difference > 0) {
        differenceString = `(${this.colours.better}-${TM.Utils.getTimeString(difference)}$FFF)`
      } else if (difference === 0) {
        differenceString = `(${this.colours.equal}${TM.Utils.getTimeString(difference)}$FFF)`
      } else {
        differenceString = `(${this.colours.worse}+${TM.Utils.getTimeString(Math.abs(difference))}$FFF)`
      }
    }
    const txt = timeString + differenceString
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
          ${centeredText(txt, this.width, this.height - (this.headerHeight + this.margin), { textScale: 1.5 })}
        </frame>
      </frame>
    </manialink>`, login)
  }

}