import RaceUi from "../config/RaceUi.js"
import ResultUi from "../config/ResultUi.js"
import { components, addKeyListener } from '../UI.js'

interface PlayerML { login: string | string[], xml: string }
type PlayerMLList = (string | PlayerML | void)[]
type MLLike = string | PlayerML | PlayerMLList

/**
 * Abstract class for static manialink components.
 */
export default abstract class StaticComponent {

  static components: {
    [mode in tm.GameMode | 'Result']: { [sideOrList in 'left' | 'right' | 'other']:
      { name: string, getHeight: () => number }[] }
  } =
    {
      TimeAttack: {
        left: [],
        right: [],
        other: []
      },
      Rounds: {
        left: [],
        right: [],
        other: []
      },
      Cup: {
        left: [],
        right: [],
        other: []
      },
      Laps: {
        left: [],
        right: [],
        other: []
      },
      Teams: {
        left: [],
        right: [],
        other: []
      },
      Stunts: {
        left: [],
        right: [],
        other: []
      },
      Result: {
        left: [],
        right: [],
        other: []
      }
    }
  static displayedComponents: {
    left: { name: string, getHeight: () => number }[],
    right: { name: string, getHeight: () => number }[],
    other: { name: string, getHeight: () => number }[]
  } = { left: [], right: [], other: [] }
  private _isDisplayed: boolean = true
  /** Component manialink ID */
  readonly id: number
  private static readonly componentCreateListeners: ((component: StaticComponent) => void)[] = []
  protected positionY: number
  protected positionX: number
  protected side: boolean
  static componentListCreated = false
  private static listeners: {
    event: keyof tm.Events,
    callback: (params: any) => MLLike | void
  }[] = []
  private static listenersAdded = false
  private static reduxModeEnabled = false
  private static panelHideList: string[] = []
  private static panelHideListeners: ((player: tm.Player) => any)[] = []

  /**
   * Abstract class for static manialink components
   * @param id Component manialink ID
   */
  constructor(id: number) {
    if (!StaticComponent.componentListCreated) {
      StaticComponent.initialize()
    }
    this.id = id
    this.renderOnEvent('EndMap', (info) => {
      if (info.isRestart && info.serverSideRankings[0]?.BestTime === -1) { return } // ignore the short restart
      this.updateIsDisplayed()
      this.updatePosition()
      return this._isDisplayed ? this.display() : this.hide()
    })
    this.renderOnEvent('BeginMap', () => {
      this.updateIsDisplayed()
      this.updatePosition()
      return this._isDisplayed ? this.display() : this.hide()
    })
    this.renderOnEvent('PlayerJoin', (info) => {
      if (this._isDisplayed) {
        return this.displayToPlayer(info.login)
      }
    })
    this.onReduxModeChange(() => {
      if (this._isDisplayed) {
        return this.display()
      }
    })
    this.updateIsDisplayed()
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    for (const e of StaticComponent.componentCreateListeners) {
      e(this)
    }
  }

  private static addListeners() {
    this.listenersAdded = true
    tm.addListener('*', ({ event, params }) => {
      const manialinks = []
      for (let i = 0; i < StaticComponent.listeners.length; i++) {
        if (StaticComponent.listeners[i].event === event) {
          const ret = StaticComponent.listeners[i].callback(params)
          if (Array.isArray(ret)) {
            manialinks.push(...ret)
          } else if (ret !== undefined) {
            manialinks.push(ret)
          }
        }
      }
      StaticComponent.sendMultipleManialinks(manialinks)
    })
    tm.addListener('EndMap', (info): void => {
      if (info.isRestart && info.serverSideRankings[0]?.BestTime === -1) { return } // ignore the short restart
      StaticComponent.updateDisplayedComponents()
    }, true)
    tm.addListener('BeginMap', (): void => {
      StaticComponent.updateDisplayedComponents()
    }, true)
    tm.addListener('PlayerJoin', () => this.updateReduxModeStatus())
    tm.addListener('PlayerLeave', (info) => {
      const index = this.panelHideList.indexOf(info.login)
      if (index !== -1) {
        this.panelHideList.splice(index)
        for (const e of this.panelHideListeners) {
          e(info)
        }
      }
      this.updateReduxModeStatus()
    })
    addKeyListener('F7', (info) => {
      const index = this.panelHideList.indexOf(info.login)
      if (index !== -1) {
        this.panelHideList.splice(index)
      } else {
        this.panelHideList.push(info.login)
      }
      for (const e of this.panelHideListeners) {
        e(info)
      }
    }, 1)
  }

  private static initialize() {
    this.updateReduxModeStatus()
    if (!this.listenersAdded) {
      this.addListeners()
    }
    StaticComponent.refreshStaticLayouts()
  }

  private static updateReduxModeStatus() {
    let prev = this.reduxModeEnabled
    if (this.reduxModeEnabled) {
      this.reduxModeEnabled = tm.players.count > RaceUi.reduxModeDisablePlayerAmount
    } else {
      this.reduxModeEnabled = tm.players.count >= RaceUi.reduxModeEnablePlayerAmount
    }
    if (prev !== this.reduxModeEnabled) {
      const manialinks = []
      for (const e of this.reduxModeChangeListeners) {
        const ret = e()
        if (Array.isArray(ret)) {
          manialinks.push(...ret)
        } else if (ret !== undefined) {
          manialinks.push(ret)
        }
      }
      this.sendMultipleManialinks(manialinks)
    }
  }

  /**
   * Gets component height. Used for static UI positioning
   * @returns Component height
   */
  abstract getHeight(): number

  /**
   * Updates positionX, positionY, and side props, calls onPositionChange
   */
  updatePosition(): void {
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.side = pos.side
    this.onPositionChange()
  }

  /**
   * Executed on static UI layout change, by default calls the display() method
   */
  protected onPositionChange(): void {
    const obj = this.display()
    if (obj !== undefined) {
      this.sendMultipleManialinks(obj)
    }
  }

  private static updateDisplayedComponents() {
    if (tm.getState() === 'result') {
      this.displayedComponents = this.components.Result
    } else {
      this.displayedComponents = this.components[tm.getGameMode()]
    }
  }

  /**
   * Updates _isDisplayed prop based on current static UI layout
   */
  updateIsDisplayed(): void {
    this._isDisplayed = (StaticComponent.displayedComponents.left.some(a => a.name === this.constructor.name) ||
      StaticComponent.displayedComponents.right.some(a => a.name === this.constructor.name) ||
      StaticComponent.displayedComponents.other.some(a => a.name === this.constructor.name))
  }

  private static mapComponentHeight(names: (string | number)[]): { name: string, getHeight: () => number }[] {
    const ret: { name: string, getHeight: () => number }[] = []
    for (const e of names) {
      if (typeof e === 'number') {
        ret.push({ name: '__margin__', getHeight: () => e })
      } else {
        const comp = components.findStatic(e)
        if (comp === undefined) { continue }
        ret.push({ name: e, getHeight: comp.getHeight.bind(comp) })
      }
    }
    return ret
  }

  /**
   * Refreshes static UI layouts and updates displayed components
   */
  static refreshStaticLayouts(): void {
    const c = this.components
    const r = RaceUi
    const res = ResultUi
    const f = this.mapComponentHeight
    c.TimeAttack = {
      left: f(r.leftSideOrder),
      right: f(r.rightSideOrder),
      other: f(r.otherComponents)
    }
    c.Rounds = {
      left: f(r.roundsLeftSideOrder),
      right: f(r.roundsRightSideOrder),
      other: f(r.roundsOtherComponents)
    }
    c.Cup = {
      left: f(r.cupLeftSideOrder),
      right: f(r.cupRightSideOrder),
      other: f(r.cupOtherComponents)
    }
    c.Teams = {
      left: f(r.teamsLeftSideOrder),
      right: f(r.teamsRightSideOrder),
      other: f(r.teamsOtherComponents)
    }
    c.Laps = {
      left: f(r.lapsLeftSideOrder),
      right: f(r.lapsRightSideOrder),
      other: f(r.lapsOtherComponents)
    }
    c.Stunts = {
      left: f(r.stuntsLeftSideOrder),
      right: f(r.stuntsRightSideOrder),
      other: f(r.stuntsOtherComponents)
    }
    c.Result = {
      left: f(res.leftSideOrder),
      right: f(res.rightSideOrder),
      other: f(res.otherComponents)
    }
    this.updateDisplayedComponents()
  }

  /**
   * Gets position relative to other static manialinks based on current static UI layout.
   * @returns Object containing coordinates and side of the component
   */
  private getRelativePosition(): { x: number, y: number, side: boolean } {
    const widgetName: string = this.constructor.name
    let cfg
    if (tm.getState() === 'result') {
      cfg = ResultUi
    } else {
      cfg = RaceUi
    }
    const left = StaticComponent.displayedComponents.left
    const right = StaticComponent.displayedComponents.right
    let side: boolean = false
    if (right.some(a => a.name === widgetName)) { side = true }
    const order: { name: string; getHeight: () => number; }[] = side ? right : left
    let positionSum: number = 0
    for (const e of order) {
      if (e.name === widgetName) { break }
      positionSum += e.getHeight() + cfg.marginBig
    }
    return { y: cfg.topBorder - positionSum, x: side ? cfg.rightPosition : cfg.leftPosition, side }
  }

  /**
   * Boolean indicating whether component should be displayed according to preset display mode.
   */
  get isDisplayed(): boolean {
    return this._isDisplayed
  }

  /**
   * Displays the manialink to all the players
   * @param params Optional params
   */
  abstract display(params?: any): MLLike | void

  /**
   * Displays the manialink to given player
   * @param login Player login
   * @param params Optional params
   */
  abstract displayToPlayer(login: string, params?: any): PlayerML | void

  /**
   * Hides the manialink for all players
   */
  hide(): string | void {
    return `<manialink id="${this.id}"></manialink>`
  }

  hideToPlayer(login: string): PlayerML {
    return { xml: `<manialink id="${this.id}"></manialink>`, login }
  }

  /**
   * Add a callback function to execute when new component object gets created 
   * @param callback Function to execute on event
   */
  static onComponentCreated(callback: (component: StaticComponent) => void): void {
    this.componentCreateListeners.push(callback)
  }

  protected renderOnEvent<T extends keyof tm.Events>(event: T, callback: (params: tm.Events[T]) => MLLike | void) {
    StaticComponent.listeners.push({ event, callback })
  }

  static reduxModeChangeListeners: (() => MLLike | void)[] = []

  protected onReduxModeChange(callback: () => MLLike | void) {
    StaticComponent.reduxModeChangeListeners.push(callback)
  }

  protected async sendMultipleManialinks(manialinks?: MLLike | undefined) {
    await StaticComponent.sendMultipleManialinks(manialinks)
  }

  static async sendMultipleManialinks(manialinks?: MLLike | void) {
    if (manialinks === undefined) { return }
    if (typeof manialinks === 'string') {
      tm.sendManialink(manialinks)
      return
    }
    if (this.isPlayerML(manialinks)) {
      tm.sendManialink(manialinks.xml, manialinks.login)
      return
    }
    if (Array.isArray(manialinks)) {
      manialinks = manialinks.filter(a => a !== undefined)
    }
    let xmls: { [login: string]: string } = {}
    for (let i = 0; i < manialinks.length; i++) {
      const ml: string | PlayerML | void = manialinks[i]
      let login: string | string[] = (ml as any).login ?? '*'
      if (Array.isArray(login)) { login = login.join(',') }
      if (!(login in xmls)) {
        xmls[login] = ''
      } else if ((xmls[login] + ml).length > 64000) {
        if (login === '*') {
          tm.sendManialink('<manialinks>' + xmls[login] + '</manialinks>')
        } else {
          tm.sendManialink('<manialinks>' + xmls[login] + '</manialinks>', login)
        }
        await new Promise(r => setImmediate(r))
        xmls[login] = ''
      }
      xmls[login] += (ml as any).xml ?? ml
    }
    const entries = Object.entries(xmls)
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][1] !== '') {
        if (entries[i][0] === '*') {
          tm.sendManialink('<manialinks>' + entries[i][1] + '</manialinks>')
        } else {
          tm.sendManialink('<manialinks>' + entries[i][1] + '</manialinks>', entries[i][0])
        }
      }
    }
  }

  private static isPlayerML(obj: any): obj is PlayerML {
    return typeof obj.xml === 'string'
  }

  protected get reduxModeEnabled() {
    return StaticComponent.reduxModeEnabled
  }

  protected onPanelHide(callback: (player: tm.Player) => any) {
    StaticComponent.panelHideListeners.push(callback)
  }

  protected hasPanelsHidden(login: string) {
    return StaticComponent.panelHideList.includes(login)
  }

  protected get panelHideList() {
    return [...StaticComponent.panelHideList]
  }

}
