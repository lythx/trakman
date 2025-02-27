/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, StaticHeader, StaticComponent, centeredText, addManialinkListener } from '../../UI.js'
import config from './TimerWidget.config.js'

export default class TimerWidget extends StaticComponent {

  private readonly header: StaticHeader
  private dynamicTimerInterval: NodeJS.Timeout | undefined
  private noButtonXml: string = ''
  private xmlWithButtons: string = ''
  private readonly pauseButtonId = this.id + 1
  private readonly addButtonid = this.id + 2
  private readonly subtractButtonId = this.id + 3
  private isOnRestart = false
  private isPaused = false

  constructor() {
    super(componentIds.timer)
    this.header = new StaticHeader('race')
    this.noButtonXml = this.constructXml(false)
    this.xmlWithButtons = this.constructXml(true)
    if (tm.timer.isDynamic) {
      this.startDynamicTimerInterval()
    }
    this.renderOnEvent('DynamicTimerStateChanged', (state) => {
      if (state === 'enabled') {
        this.startDynamicTimerInterval()
      } else {
        clearInterval(this.dynamicTimerInterval)
      }
      this.noButtonXml = this.constructXml(false)
      this.xmlWithButtons = this.constructXml(true)
      return this.display()
    })
    this.renderOnEvent('EndMap', (info) => {
      if (info.isRestart) {
        this.isOnRestart = true
        this.noButtonXml = this.constructXml(false)
        this.xmlWithButtons = this.constructXml(true)
        return this.display()
      }
    })
    this.renderOnEvent('BeginMap', () => {
      this.isOnRestart = false
      this.noButtonXml = this.constructXml(false)
      this.xmlWithButtons = this.constructXml(true)
      return this.display()
    })
    addManialinkListener(this.pauseButtonId, (info) => {
      if (info.privilege < config.timerActionsPrivilege) { return }
      if (!tm.timer.isDynamic) {
        tm.sendMessage(config.notDynamic, info.login)
        return
      }
      const strObject = {
        title: info.title,
        adminName: tm.utils.strip(info.nickname)
      }
      if (tm.timer.isPaused) {
        tm.sendMessage(tm.utils.strVar(config.resume, strObject))
        tm.timer.resume()
      } else {
        tm.sendMessage(tm.utils.strVar(config.pause, strObject))
        tm.timer.pause()
      }
    })
    addManialinkListener(this.addButtonid, (info) => {
      if (info.privilege < config.timerActionsPrivilege) { return }
      if (!tm.timer.isDynamic) {
        tm.sendMessage(config.notDynamic, info.login)
        return
      }
      tm.timer.addTime(config.timeAddedOnClick)
      const strObject = {
        title: info.title,
        adminName: tm.utils.strip(info.nickname),
        time: tm.utils.getVerboseTime(tm.timer.remainingRaceTime)
      }
      tm.sendMessage(tm.utils.strVar(config.set, strObject))
    })
    addManialinkListener(this.subtractButtonId, (info) => {
      if (info.privilege < config.timerActionsPrivilege) { return }
      if (!tm.timer.isDynamic) {
        tm.sendMessage(config.notDynamic, info.login)
        return
      }
      const subtracted: boolean = tm.timer.subtractTime(config.timeSubtractedOnClick)
      if (!subtracted) { return }
      const strObject = {
        title: info.title,
        adminName: tm.utils.strip(info.nickname),
        time: tm.utils.getVerboseTime(tm.timer.remainingRaceTime)
      }
      tm.sendMessage(tm.utils.strVar(config.set, strObject))
    })
  }

  getHeight(): number {
    const isStunts = tm.getGameMode() === "Stunts"
    if (isStunts && tm.timer.isDynamic) {
      return config.height + config.stuntsDynamicMarginTop
    }
    if (isStunts) {
      return config.stuntsHeight
    }
    return config.height
  }

  private startDynamicTimerInterval() {
    clearInterval(this.dynamicTimerInterval)
    this.dynamicTimerInterval = setInterval(() => {
      this.noButtonXml = this.constructXml(false)
      this.xmlWithButtons = this.constructXml(true)
      this.sendMultipleManialinks(this.display())
    }, 300)
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.isPaused && tm.timer.isPaused) { return }
    // if (tm.getGameMode() === 'Stunts' && !tm.timer.isDynamic) {
    //   return [this.hide()]
    // }
    const arr = []
    for (const e of tm.players.list) {
      arr.push(this.displayToPlayer(e.login, e.privilege))
    }
    this.isPaused = tm.timer.isPaused
    return arr
  }

  displayToPlayer(login: string, privilege?: number) {
    if (!this.isDisplayed) { return }
    // if (tm.getGameMode() === 'Stunts' && !tm.timer.isDynamic) {
    //   return { xml: this.hide() ?? '', login }
    // }
    privilege ??= tm.players.get(login)?.privilege ?? 0
    if (this.isOnRestart || !tm.timer.isDynamic || privilege < config.timerActionsPrivilege) {
      return { xml: this.noButtonXml, login }
    } else {
      return { xml: this.xmlWithButtons, login }
    }
  }

  protected onPositionChange(): void {
    this.noButtonXml = this.constructXml(false)
    this.xmlWithButtons = this.constructXml(true)
    this.sendMultipleManialinks(this.display())
  }

  private constructXml(isDynamic: boolean): string {
    const headerHeight: number = this.header.options.height
    let headerXml = isDynamic ? this.getButtonsXml() :
      this.header.constructXml(config.title, config.icon, this.side)
    let timeXml = ''
    let bottomH = config.height - (headerHeight + config.margin)
    const isStunts = tm.getGameMode() === 'Stunts'
    if (!isDynamic && isStunts) {
      bottomH = config.stuntsHeight
    }
    if (tm.timer.isDynamic && !this.isOnRestart) {
      if (tm.timer.isPaused) {
        timeXml = centeredText(config.pausedText, config.width, bottomH,
          { specialFont: true, yOffset: -0.3, xOffset: 0.2 })
      } else {
        const time = Math.floor(tm.timer.remainingRaceTime / 1000)
        let timeColour = config.timeColours[0]
        if (time < config.colourChangeThresholds[1]) {
          timeColour = config.timeColours[2]
        } else if (time < config.colourChangeThresholds[0]) {
          timeColour = config.timeColours[1]
        }
        const hoursAmount = ~~(time / (60 * 60))
        const hours = hoursAmount === 0 ? '' : `${hoursAmount.toString()}:`
        const minutes = (~~(time / 60) % 60).toString().padStart(2, '0')
        const seconds = (time % 60).toString().padStart(2, '0')
        const timeStr = hoursAmount < 100 ? `${hours}${minutes}:${seconds}` : `${hoursAmount} hours`
        timeXml = centeredText('$' + timeColour + timeStr, config.width, bottomH,
          { specialFont: true, yOffset: config.textYOffset })
      }
    }
    let stuntsMargin = (isStunts && isDynamic) ? config.stuntsDynamicMarginTop : 0
    if (isStunts && !isDynamic) {
      return `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY - stuntsMargin} -38">
        <format textsize="1" textcolor="FFFF"/> 
        <frame posn="0 0 -40">
          <quad posn="0 0 -45" sizen="${config.width} ${bottomH}" bgcolor="${config.background}"/>
        </frame>
      </frame>
    </manialink>`
    }
    return `
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY - stuntsMargin} -38">
        <format textsize="1" textcolor="FFFF"/> 
        ${headerXml}
        <frame posn="0 ${-headerHeight - config.margin} -40">
          <quad posn="0 0 1" sizen="${config.width} ${bottomH}" action="${this.pauseButtonId}"/>
          <quad posn="0 0 -45" sizen="${config.width} ${bottomH}" bgcolor="${config.background}"/>
          ${timeXml}
        </frame>
      </frame>
    </manialink>`
  }

  private getButtonsXml(): string {
    const headerW = config.width - 3 * (config.buttonWidth + config.margin)
    const headerRectWidth = headerW - (this.header.options.squareWidth + this.header.options.margin)
    let buttonXml = ''
    for (const [i, e] of config.buttonOrder.entries()) {
      const x = headerW + config.margin + (config.margin + config.buttonWidth) * i
      const w = config.buttonWidth
      const h = this.header.options.height
      const m = config.iconPadding
      let icon!: string
      let hoverIcon!: string
      let id!: number
      if (e === 'pause') {
        icon = tm.timer.isPaused ? config.icons.resume : config.icons.pause
        hoverIcon = tm.timer.isPaused ? config.iconsHover.resume : config.iconsHover.pause
        id = this.pauseButtonId
      } else if (e === 'add') {
        icon = config.icons.add
        hoverIcon = config.iconsHover.add
        id = this.addButtonid
      } else if (e === 'subtract') {
        icon = config.icons.subtract
        hoverIcon = config.iconsHover.subtract
        id = this.subtractButtonId
      }
      buttonXml += `<quad posn="${x} 0 0" sizen="${w} ${h}" bgcolor="${this.header.options.iconBackground}" />
      <quad posn="${x + m} ${-m} 1" sizen="${w - 2 * m} ${h - 2 * m}" imagefocus="${hoverIcon}" image="${icon}" action="${id}"/>`
    }
    return this.header.constructXml(config.title, config.icon,
      this.side, { rectangleWidth: headerRectWidth }) + buttonXml
  }

}
