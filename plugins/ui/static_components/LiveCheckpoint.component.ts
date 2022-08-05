import StaticComponent from '../StaticComponent.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import { IDS, CONFIG, getStaticPosition, staticHeader, stringToObjectProperty, ICONS, centeredText } from '../UiUtils.js'

export default class LiveCheckpoint extends StaticComponent {

  private readonly bg: string = CONFIG.static.bgColor
  private readonly width: number = CONFIG.static.width
  private readonly height: number = CONFIG.liveCheckpoint.height
  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean = CONFIG.liveCheckpoint.side
  private readonly title: string = CONFIG.liveCheckpoint.title
  private readonly icon: string = CONFIG.liveCheckpoint.icon
  private readonly headerHeight: number = CONFIG.staticHeader.height
  private readonly margin: number = CONFIG.marginSmall
  private readonly colours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }

  constructor() {
    super(IDS.liveCheckpoint, 'race')
    const pos = getStaticPosition('liveCheckpoint')
    this.positionX = pos.x
    this.positionY = pos.y
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo): void => {
      const pb: TMRecord | undefined = TM.getPlayerRecord(info.player.login)
      if (pb !== undefined) {
        const cpIndex: number = info.index
        const diff: number = pb.checkpoints[cpIndex] - info.time
        this.displayToPlayer(info.player.login, info.time, diff)
      } else {
        this.displayToPlayer(info.player.login, info.time)
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    const iconUrl: string = stringToObjectProperty(this.icon, ICONS)
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 6" sizen="${this.width} ${this.height}" action="${IDS.currentCps}"/> 
        <format textsize="1"/>
        ${staticHeader(this.title, iconUrl, this.side)}
        <frame posn="0 ${-(this.headerHeight + this.margin)} 1">
          <quad posn="0 0 0" sizen="${this.width} ${this.height - (this.headerHeight + this.margin)}" bgcolor="${this.bg}"/>
        </frame>
      </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, checkpointTime?: number, difference?: number): void {
    if (this.isDisplayed === false) { return }
    const iconUrl: string = stringToObjectProperty(this.icon, ICONS)
    let timeString: string = ''
    if (checkpointTime !== undefined) {
      timeString = TM.utils.getTimeString(checkpointTime)
    }
    let differenceString: string = ''
    if (difference !== undefined) {
      if (difference > 0) {
        differenceString = `(${this.colours.better}-${TM.utils.getTimeString(difference)}$FFF)`
      } else if (difference === 0) {
        differenceString = `(${this.colours.equal}${TM.utils.getTimeString(difference)}$FFF)`
      } else {
        differenceString = `(${this.colours.worse}+${TM.utils.getTimeString(Math.abs(difference))}$FFF)`
      }
    }
    const txt: string = timeString + differenceString
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 6" sizen="${this.width} ${this.height}" action="${IDS.currentCps}"/>
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