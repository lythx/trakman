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
  private skipCost = CONFIG.buttons.paySkip.costs[0]
  private resCost = CONFIG.buttons.payRes.costs[0]

  constructor() {
    super(IDS.buttons, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.buttons.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('buttons')
    this.grid = new Grid(this.width + CONFIG.static.marginSmall, this.height + CONFIG.static.marginSmall, new Array(4).fill(1), new Array(3).fill(1))
    TM.addListener('Controller.BeginMap', (info: BeginMapInfo) => {
      const cfg = CONFIG.buttons.payRes
      if (this.resCost !== -1) {
        this.iconData[cfg.index] = {
          icon: stringToObjectProperty(cfg.icon, ICONS),
          text1: cfg.title1.replace(/\$COST\$/, this.resCost.toString()),
          text2: cfg.title2,
          iconWidth: cfg.width,
          iconHeight: cfg.height,
          padding: cfg.padding,
          actionId: this.id + 4
        }
      } else {
        this.iconData[cfg.index] = {
          icon: stringToObjectProperty(cfg.icon, ICONS),
          text1: cfg.title3,
          text2: cfg.title4,
          iconWidth: cfg.width,
          iconHeight: cfg.height,
          padding: cfg.padding,
          equalTexts: true
        }
      }
      this.constructXml()
      this.display()
    })
    TM.addListener('Controller.ManialinkClick', async (info: ManialinkClickInfo): Promise<void> => {
      switch (info.answer - this.id) {
        case 1:
          break
        case 2:
          break
        case 3:
          break
        case 4: this.onResButtonClick(info.login, info.nickName)
      }
    })
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
    const marginSmall: number = CONFIG.static.marginSmall
    for (const e of this.iconData) {
      arr.push((i: number, j: number, w: number, h: number): string => constuctButton(e.icon, CONFIG.static.format + e.text1, CONFIG.static.format + e.text2, w - marginSmall, h - marginSmall, e.iconWidth, e.iconHeight, e.padding, { equalTexts: e.equalTexts, actionId: e.actionId, link: e.link }))
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }

  private onResButtonClick = async (login: string, nickname: string): Promise<void> => {
    const res = await TM.sendCoppers(login, this.resCost, 'Pay to restart the ongoing map')
    if (res instanceof Error) {
      TM.sendMessage(`${TM.palette.error}Failed to pay for map restart.`)
    } else if (res === true) {
      TM.sendMessage(`${nickname}$s$z${TM.palette.donation} paid ${this.resCost} to restart the ongoing map.`)
      TM.addToJukebox(TM.map.id)
      this.resCost = CONFIG.buttons.payRes.costs[CONFIG.buttons.payRes.costs.indexOf(this.resCost) + 1] ?? -1
      const cfg = CONFIG.buttons.payRes
      this.iconData[cfg.index] = {
        icon: stringToObjectProperty(cfg.icon, ICONS),
        text1: cfg.title5,
        text2: cfg.title6,
        iconWidth: cfg.width,
        iconHeight: cfg.height,
        padding: cfg.padding
      }
      this.constructXml()
      this.display()
    }
  }

  private initialize = async (): Promise<void> => {
    // Visit counter
    const res: any[] | Error = await TM.queryDB('SELECT count(*) FROM players;')
    if (res instanceof Error) {
      throw new Error('Failed to fetch players from database.')
    }
    const cfg = CONFIG.buttons
    this.iconData[cfg.visitors.index] = {
      icon: stringToObjectProperty(cfg.visitors.icon, ICONS),
      text1: res[0].count,
      text2: cfg.visitors.title,
      iconWidth: cfg.visitors.width,
      iconHeight: cfg.visitors.height,
      padding: cfg.visitors.padding
    }
    // Player and spectator counter
    const all: TMPlayer[] = TM.players
    const players: number = all.filter(a => !a.isSpectator).length
    this.iconData[cfg.players.index] = {
      icon: stringToObjectProperty(cfg.players.icon, ICONS),
      text1: `${all.length - players} ${cfg.players.title1}`,
      text2: `${players} ${cfg.players.title2}`,
      iconWidth: cfg.players.width,
      iconHeight: cfg.players.height,
      padding: cfg.players.padding,
      equalTexts: true
    }
    // Version
    this.iconData[cfg.version.index] = {
      icon: stringToObjectProperty(cfg.version.icon, ICONS),
      text1: '0.0.1',
      text2: cfg.version.title,
      iconWidth: cfg.version.width,
      iconHeight: cfg.version.height,
      padding: cfg.version.padding,
    }
    // Time
    this.iconData[cfg.time.index] = {
      icon: stringToObjectProperty(cfg.time.icon, ICONS),
      text1: `${new Date().getUTCHours().toString().padStart(2, '0')}:${new Date().getUTCMinutes().toString().padStart(2, '0')}`,
      text2: cfg.time.title,
      iconWidth: cfg.time.width,
      iconHeight: cfg.time.height,
      padding: cfg.time.padding,
    }
    // Map list
    this.iconData[cfg.maps.index] = {
      icon: stringToObjectProperty(cfg.maps.icon, ICONS),
      text1: TM.maps.length.toString(),
      text2: cfg.maps.title,
      iconWidth: cfg.maps.width,
      iconHeight: cfg.maps.height,
      padding: cfg.maps.padding,
      actionId: IDS.mapList
    }
    // Stats
    this.iconData[cfg.stats.index] = {
      icon: stringToObjectProperty(cfg.stats.icon, ICONS),
      text1: cfg.stats.title1,
      text2: cfg.stats.title2,
      iconWidth: cfg.stats.width,
      iconHeight: cfg.stats.height,
      padding: cfg.stats.padding,
      actionId: IDS.localCps,
      equalTexts: true
    }
    // Sector records
    this.iconData[cfg.sectorRecords.index] = {
      icon: stringToObjectProperty(cfg.sectorRecords.icon, ICONS),
      text1: cfg.sectorRecords.title1,
      text2: cfg.sectorRecords.title2,
      iconWidth: cfg.sectorRecords.width,
      iconHeight: cfg.sectorRecords.height,
      padding: cfg.sectorRecords.padding,
      actionId: IDS.dediCps,
      equalTexts: true
    }
    // Github repo
    this.iconData[cfg.github.index] = {
      icon: stringToObjectProperty(cfg.github.icon, ICONS),
      text1: cfg.github.title1,
      text2: cfg.github.title2,
      iconWidth: cfg.github.width,
      iconHeight: cfg.github.height,
      padding: cfg.github.padding,
      link: `github.com/felacek/trakman/`,
      equalTexts: true
    }
    // Vote to skip
    this.iconData[cfg.voteSkip.index] = {
      icon: stringToObjectProperty(cfg.voteSkip.icon, ICONS),
      text1: cfg.voteSkip.title1,
      text2: cfg.voteSkip.title2,
      iconWidth: cfg.voteSkip.width,
      iconHeight: cfg.voteSkip.height,
      padding: cfg.voteSkip.padding,
      actionId: this.id + 1
    }
    // Vote to replay
    this.iconData[cfg.voteRes.index] = {
      icon: stringToObjectProperty(cfg.voteRes.icon, ICONS),
      text1: cfg.voteRes.title1,
      text2: cfg.voteRes.title2,
      iconWidth: cfg.voteRes.width,
      iconHeight: cfg.voteRes.height,
      padding: cfg.voteRes.padding,
      actionId: this.id + 2
    }
    // Pay to skip
    this.iconData[cfg.paySkip.index] = {
      icon: stringToObjectProperty(cfg.paySkip.icon, ICONS),
      text1: cfg.paySkip.title1.replace(/\$COST\$/, this.skipCost.toString()),
      text2: cfg.paySkip.title2,
      iconWidth: cfg.paySkip.width,
      iconHeight: cfg.paySkip.height,
      padding: cfg.paySkip.padding,
      actionId: this.id + 3
    }
    // Pay to replay
    this.iconData[cfg.payRes.index] = {
      icon: stringToObjectProperty(cfg.payRes.icon, ICONS),
      text1: cfg.payRes.title1.replace(/\$COST\$/, this.resCost.toString()),
      text2: cfg.payRes.title2,
      iconWidth: cfg.payRes.width,
      iconHeight: cfg.payRes.height,
      padding: cfg.payRes.padding,
      actionId: this.id + 4
    }
    this.constructXml()
  }

}
