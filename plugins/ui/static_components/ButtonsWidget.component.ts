import { calculateStaticPositionY, CONFIG, IDS, Grid, constuctButton, ICONS, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class VisitorAmount extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly iconData: { icon: string, text1: string, text2: string, iconWidth: number, iconHeight: number, padding: number, equalTexts?: true, actionId?: number, link?: string }[] = []
  private xml: string = ''
  private readonly grid: Grid

  constructor() {
    super(IDS.ButtonsWidget, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.buttons.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('buttons')
    this.grid = new Grid(this.width + CONFIG.static.marginSmall, this.height + CONFIG.static.marginSmall, new Array(4).fill(1), new Array(3).fill(1))
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
      arr.push((i: number, j: number, w: number, h: number) => constuctButton(e.icon, CONFIG.static.format + e.text1, CONFIG.static.format + e.text2, w - marginSmall, h - marginSmall, e.iconWidth, e.iconHeight, e.padding, { equalTexts: e.equalTexts, actionId: e.actionId, link: e.link }))
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
      icon: stringToObjectProperty(CONFIG.buttons.icons[0].name, ICONS),
      text1: res[0].count,
      text2: CONFIG.buttons.titles[0],
      iconWidth: CONFIG.buttons.icons[0].width,
      iconHeight: CONFIG.buttons.icons[0].height,
      padding: CONFIG.buttons.icons[0].padding
    })
    // Player and spectator counter
    const all = TM.players
    const players = all.filter(a => !a.isSpectator).length
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[1].name, ICONS),
      text1: `${all.length - players} ${CONFIG.buttons.titles[1].split(' ')[0]}`,
      text2: `${players} ${CONFIG.buttons.titles[1].split(' ')[1]}`,
      iconWidth: CONFIG.buttons.icons[1].width,
      iconHeight: CONFIG.buttons.icons[1].height,
      padding: CONFIG.buttons.icons[1].padding,
      equalTexts: true
    })
    // Version
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[2].name, ICONS),
      text1: '0.0.1',
      text2: CONFIG.buttons.titles[2],
      iconWidth: CONFIG.buttons.icons[2].width,
      iconHeight: CONFIG.buttons.icons[2].height,
      padding: CONFIG.buttons.icons[2].padding
    })
    // Time
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[3].name, ICONS),
      text1: `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`,
      text2: CONFIG.buttons.titles[3],
      iconWidth: CONFIG.buttons.icons[3].width,
      iconHeight: CONFIG.buttons.icons[3].height,
      padding: CONFIG.buttons.icons[3].padding
    })
    // Map list
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[4].name, ICONS),
      text1: TM.maps.length.toString(),
      text2: CONFIG.buttons.titles[4],
      iconWidth: CONFIG.buttons.icons[4].width,
      iconHeight: CONFIG.buttons.icons[4].height,
      padding: CONFIG.buttons.icons[4].padding,
      actionId: IDS.JukeboxWindow
    })
    // Stats
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[5].name, ICONS),
      text1: CONFIG.buttons.titles[5].split(' ')[0],
      text2: CONFIG.buttons.titles[5].split(' ')[1],
      iconWidth: CONFIG.buttons.icons[5].width,
      iconHeight: CONFIG.buttons.icons[5].height,
      padding: CONFIG.buttons.icons[5].padding,
      actionId: IDS.LocalCps,
      equalTexts: true
    })
    // Sector records
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[6].name, ICONS),
      text1: CONFIG.buttons.titles[6].split(' ')[0],
      text2: CONFIG.buttons.titles[6].split(' ')[1],
      iconWidth: CONFIG.buttons.icons[6].width,
      iconHeight: CONFIG.buttons.icons[6].height,
      padding: CONFIG.buttons.icons[6].padding,
      actionId: IDS.DediCps,
      equalTexts: true
    })
    this.constructXml()
    // Github repo
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[7].name, ICONS),
      text1: CONFIG.buttons.titles[7].split(' ')[0],
      text2: CONFIG.buttons.titles[7].split(' ')[1],
      iconWidth: CONFIG.buttons.icons[7].width,
      iconHeight: CONFIG.buttons.icons[7].height,
      padding: CONFIG.buttons.icons[7].padding,
      link: `github.com/felacek/trakman/`,
      equalTexts: true
    })
    // Vote to skip
    const s = CONFIG.buttons.titles[8].split(' ')
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[8].name, ICONS),
      text1: s.shift() as any,
      text2: s.join(' '),
      iconWidth: CONFIG.buttons.icons[8].width,
      iconHeight: CONFIG.buttons.icons[8].height,
      padding: CONFIG.buttons.icons[8].padding,
      actionId: IDS.TMXWindow
    })
    // Vote to replay
    const s2 = CONFIG.buttons.titles[9].split(' ')
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[9].name, ICONS),
      text1: s2.shift() as any,
      text2: s2.join(' '),
      iconWidth: CONFIG.buttons.icons[9].width,
      iconHeight: CONFIG.buttons.icons[9].height,
      padding: CONFIG.buttons.icons[9].padding,
      actionId: IDS.TMXWindow
    })
    // Pay to skip
    const title = CONFIG.buttons.titles[10]
    const s3 = title.replace(/\$\$/, '300').split(' ')
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[10].name, ICONS),
      text1: (s3.shift() as any) + ' ' + (s3.shift() as any),
      text2: s3.join(' '),
      iconWidth: CONFIG.buttons.icons[10].width,
      iconHeight: CONFIG.buttons.icons[10].height,
      padding: CONFIG.buttons.icons[10].padding,
      actionId: IDS.TMXWindow
    })
    // Pay to replay
    const title2 = CONFIG.buttons.titles[11]
    const s4 = title2.replace(/\$\$/, '100').split(' ')
    this.iconData.push({
      icon: stringToObjectProperty(CONFIG.buttons.icons[11].name, ICONS),
      text1: (s4.shift() as any) + ' ' + (s4.shift() as any),
      text2: s4.join(' '),
      iconWidth: CONFIG.buttons.icons[11].width,
      iconHeight: CONFIG.buttons.icons[11].height,
      padding: CONFIG.buttons.icons[11].padding,
      actionId: IDS.TMXWindow
    })
    this.constructXml()
  }

}
