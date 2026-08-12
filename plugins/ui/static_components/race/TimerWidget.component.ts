/**
 * @author lythx
 * @since 0.1
 */

import { componentIds, StaticHeader, StaticComponent, centeredText, addManialinkListener } from '../../UI.js'
import config from './TimerWidget.config.js'

export default class TimerWidget extends StaticComponent {

  private readonly header: StaticHeader
  private dynamicTimerInterval: NodeJS.Timeout | undefined
  private headerXmlNoButtons: string = ''
  private headerXmlWithButtons: string = ''
  private timeXml: string = ''
  private readonly timeWidgetId = this.id + 4
  private readonly pauseButtonId = this.id + 1
  private readonly addButtonid = this.id + 2
  private readonly subtractButtonId = this.id + 3
  private isOnRestart = false
  private isPaused = false

  constructor() {
    super(componentIds.timer)
    this.header = new StaticHeader('race')
    this.headerXmlNoButtons = this.constructHeaderXml(false)
    this.headerXmlWithButtons = this.constructHeaderXml(true)
    this.timeXml = this.constructTimeXml()
    if (tm.timer.isDynamic) {
      this.startDynamicTimerInterval()
    }
    this.renderOnEvent('DynamicTimerStateChanged', (state) => {
      if (state === 'enabled') {
        this.startDynamicTimerInterval()
      } else {
        clearInterval(this.dynamicTimerInterval)
      }
      this.headerXmlNoButtons = this.constructHeaderXml(false)
      this.headerXmlWithButtons = this.constructHeaderXml(true)
      this.timeXml = this.constructTimeXml()
      return this.display()
    })
    this.renderOnEvent('EndMap', (info) => {
      if (info.isRestart) {
        this.isOnRestart = true
        this.headerXmlNoButtons = this.constructHeaderXml(false)
        this.headerXmlWithButtons = this.constructHeaderXml(true)
        this.timeXml = this.constructTimeXml()
        return this.display()
      }
    })
    this.renderOnEvent('BeginMap', () => {
      this.isOnRestart = false
      this.headerXmlNoButtons = this.constructHeaderXml(false)
      this.headerXmlWithButtons = this.constructHeaderXml(true)
      this.timeXml = this.constructTimeXml()
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
      this.headerXmlWithButtons = this.constructHeaderXml(true)
      this.timeXml = this.constructTimeXml()
      this.sendMultipleManialinks(this.display())
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
      this.timeXml = this.constructTimeXml()
      tm.sendManialink(this.timeXml)
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
      this.timeXml = this.constructTimeXml()
      tm.sendManialink(this.timeXml)
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
      if (!this.isDisplayed) { return }
      if (this.isPaused && tm.timer.isPaused) { return }
      this.timeXml = this.constructTimeXml()
      tm.sendManialink(this.timeXml)
      this.isPaused = tm.timer.isPaused
    }, 300)
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.isPaused && tm.timer.isPaused) { return }
    // if (tm.getGameMode() === 'Stunts' && !tm.timer.isDynamic) {
    //   return [this.hide()]
    // }
    const arr: (string | { xml: string, login: string })[] = [this.timeXml]
    for (const e of tm.players.list) {
      const ml = this.displayToPlayer(e.login, e.privilege)
      if (ml !== undefined) { arr.push(ml) }
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
      return { xml: this.headerXmlNoButtons, login }
    } else {
      return { xml: this.headerXmlWithButtons, login }
    }
  }

  hide(): string {
    return `<manialink id="${this.id}"></manialink><manialink id="${this.timeWidgetId}"></manialink>`
  }

  hideToPlayer(login: string): { xml: string, login: string } {
    return { xml: `<manialink id="${this.id}"></manialink><manialink id="${this.timeWidgetId}"></manialink>`, login }
  }

  protected onPositionChange(): void {
    this.headerXmlNoButtons = this.constructHeaderXml(false)
    this.headerXmlWithButtons = this.constructHeaderXml(true)
    this.timeXml = this.constructTimeXml()
    this.sendMultipleManialinks(this.display())
  }

  /**
   * Constructs the header manialink (icon, title, buttons, background quad).
   * Only rebuilt on state changes, not on every timer tick.
   * @param isDynamic Whether to include dynamic timer buttons
   * @returns Header manialink XML string
   */
  private constructHeaderXml(isDynamic: boolean): string {
    const headerHeight: number = this.header.options.height
    let headerXml = isDynamic ? this.getButtonsXml() :
      this.header.constructXml(config.title, config.icon, this.side)
    let bottomH = config.height - (headerHeight + config.margin)
    const isStunts = tm.getGameMode() === 'Stunts'
    if (!isDynamic && isStunts) {
      bottomH = config.stuntsHeight
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
        </frame>
      </frame>
    </manialink>`
  }

  /**
   * Constructs the time display manialink (just the countdown text).
   * Uses a separate manialink ID so the header doesn't need to be re-sent on every tick.
   * @returns Time manialink XML string
   */
  private constructTimeXml(): string {
    if (!tm.timer.isDynamic || this.isOnRestart) {
      return `<manialink id="${this.timeWidgetId}"></manialink>`
    }
    const headerHeight: number = this.header.options.height
    const bottomH: number = config.height - (headerHeight + config.margin)
    const isStunts = tm.getGameMode() === 'Stunts'
    const stuntsMargin = isStunts ? config.stuntsDynamicMarginTop : 0
    let timeXml = ''
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
    return `
    <manialink id="${this.timeWidgetId}">
      <frame posn="${this.positionX} ${this.positionY - stuntsMargin} -38">
        <frame posn="0 ${-headerHeight - config.margin} -40">
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