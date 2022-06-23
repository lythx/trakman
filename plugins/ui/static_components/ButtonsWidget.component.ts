import { calculateStaticPositionY, CONFIG, IDS, Grid, constuctButton, ICONS, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class VisitorAmount extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly iconData: { icon: string, text1: string, text2: string }[] = []
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
    for (const e of this.iconData) {
      arr.push((i: number, j: number, w: number, h: number) => constuctButton(w, h, e.icon, e.text1, e.text2))
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }

  private initialize = async (): Promise<void> => {
    const res = await TM.queryDB('SELECT count(*) FROM players;')
    if (res instanceof Error) {
      throw new Error('Failed to fetch players from database.')
    }
    const icon = stringToObjectProperty(CONFIG.buttons.icons[0], ICONS)
    this.iconData.push({ icon, text1: res[0].count, text2: CONFIG.buttons.titles[0] })
    this.constructXml()
  }

}
