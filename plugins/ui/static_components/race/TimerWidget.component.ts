/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, StaticHeader, StaticComponent, centeredText, rightAlignedText } from '../../UI.js'
import config from './TimerWidget.config.js'

export default class TimerWidget extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly side: boolean
  private readonly header: StaticHeader
  private flexiTimeInterval: NodeJS.Timer | undefined
  private xml: string = ''

  constructor() {
    super(componentIds.timer, 'race')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.header = new StaticHeader('race')
    this.constructXml()
    if (tm.state.flexiTimeEnabled) {
      this.startDynamicTimerInterval()
    }
    tm.addListener('DynamicTimerStateChanged', (state) => {
      if (state === 'enabled') {
        this.startDynamicTimerInterval()
      } else {
        clearInterval(this.flexiTimeInterval)
      }
    })
  }

  private startDynamicTimerInterval() {
    clearInterval(this.flexiTimeInterval)
    this.flexiTimeInterval = setInterval(() => {
      this.constructXml()
      this.display()
    }, 300)
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    const headerHeight: number = this.header.options.height
    let timeXml = ''
    const bottomH = config.height - (headerHeight + config.margin)
    if (tm.state.flexiTimeEnabled) {
      const time = tm.state.remainingRaceTime
      const hoursAmount = ~~(time / (60 * 60 * 1000))
      const hours = hoursAmount === 0 ? '' : `${hoursAmount.toString()}:`
      const minutes = (~~(time / (60 * 1000)) % 60).toString().padStart(2, '0')
      const seconds = (~~(time / 1000) % 60).toString().padStart(2, '0')
      const timeStr = hoursAmount < 100 ? `${hours}${minutes}:${seconds}` : `${hoursAmount} hours`
      timeXml = centeredText(timeStr, config.width, bottomH, { specialFont: true, yOffset: -0.3 })
    }
    this.xml = `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, this.side)}
        <frame posn="0 ${-headerHeight - config.margin} -40">
          <quad posn="0 0 -45" sizen="${config.width} ${bottomH}" bgcolor="${config.background}"/>
          ${timeXml}
        </frame>
      </frame>
    </manialink>`
  }

}
