import { calculateStaticPositionY, CONFIG, IDS, Grid, constuctButton, ICONS, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class VisitorAmount extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly iconData: { icon: string, text1: string, text2: string, equalText?: true }[] = []
  private xml: string = ''
  private readonly grid: Grid

  constructor() {
    super(IDS.ButtonsWidget, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.buttons.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('buttons')
    this.grid = new Grid(this.width, this.height, new Array(4).fill(1), new Array(3).fill(1))
  }

  async display(): Promise<void> {
    if (this.xml === '') {
      await this.initialize()
    }
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private constructXml(): void {
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    const marginSmall = CONFIG.static.marginSmall
    for (const e of this.iconData) {
      arr.push((i: number, j: number, w: number, h: number) => constuctButton(w - marginSmall, h - marginSmall, e.icon, e.text1, e.text2, { equalTexts: e.equalText }))
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }

  private initialize = async (): Promise<void> => {
    // Visit counter
    const res = await TM.queryDB('SELECT count(*) FROM players;')
    if (res instanceof Error) {
      throw new Error('Failed to fetch players from database.')
    }
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[0], ICONS),
      text1: res[0].count,
      text2: CONFIG.buttons.titles[0]
    })
    // Player and spectator counter
    const all = TM.players
    const players = all.filter(a => !a.isSpectator).length
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[1], ICONS),
      text1: `${all.length - players} ${CONFIG.buttons.titles[1].split(' ')[0]}`,
      text2: `${players} ${CONFIG.buttons.titles[1].split(' ')[1]}`,
      equalText: true
    })
    // Version
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[2], ICONS),
      text1: '0.0.1',
      text2: CONFIG.buttons.titles[2]
    })
    this.constructXml()
  }

}
