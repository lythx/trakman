import { RESULTCONFIG as RCFG, IDS, Grid, CONFIG, staticHeader, ICONS, getStaticPosition, stringToObjectProperty, GridCellFunction } from '../UiUtils.js'
import countries from '../../../src/data/Countries.json' assert {type: 'json'}
import flags from '../config/FlagIcons.json' assert {type: 'json'}
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { Logger } from '../../../src/Logger.js'

export default class MapWidget extends StaticComponent {

  private width = CONFIG.static.width
  private height: number
  private positionX: number
  private positionY: number
  private xml: string = ''
  private authorNickname: string | undefined
  private authorNation: string | undefined
  private nextAuthorNickname: string | undefined
  private nextAuthorNation: string | undefined

  constructor() {
    super(IDS.map)
    // Here height is 4 (or 5 if result screen) headers instead of config height
    // To set correct height in config after changing header height copy this.height from debbuger / console.log()
    this.height = (CONFIG.staticHeader.height + CONFIG.marginSmall) * 4 + CONFIG.marginSmall
    const pos = getStaticPosition('map')
    this.positionX = pos.x
    this.positionY = pos.y
    if (process.env.USE_WEBSERVICES === "YES") {
      void this.fetchWebservices(TM.map.author)
      this.authorNickname = this.nextAuthorNickname
      this.authorNation = this.nextAuthorNation
      void this.fetchWebservices(TM.mapQueue[0].id)
      TM.addListener('Controller.BeginMap', async () => {
        this.setClassVars('race')
        this.authorNickname = this.nextAuthorNickname
        this.authorNation = this.nextAuthorNation
        this.nextAuthorNickname = undefined
        this.nextAuthorNation = undefined
        void this.fetchWebservices(TM.mapQueue[0].id)
        this.display()
      })
      TM.addListener('Controller.JukeboxChanged', (queue) => {
        console.log(queue[0].name)
        void this.fetchWebservices(queue[0].id)
      })
    } else {
      TM.addListener('Controller.BeginMap', async () => {
        this.setClassVars('race')
        this.display()
      })
      TM.addListener('Controller.JukeboxChanged', () => {
        void this.display()
      })
    }
    TM.addListener('Controller.EndMap', async () => {
      this.setClassVars('result')
      this.display()
    })
    TM.addListener('Controller.TMXQueueChanged', () => {
      this.display()
    })
  }

  setClassVars(state: 'race' | 'result') {
    const rows = state === 'race' ? 4 : 5
    this.height = (RCFG.staticHeader.height + RCFG.marginSmall) * rows + RCFG.marginSmall
    const pos = getStaticPosition('map')
    this.positionX = pos.x
    this.positionY = pos.y
  }

  private async fetchWebservices(author: string) {
    const regex: RegExp = /[A-Z\'^£$%&*()}{@#~?><>,|=+¬ ]/
    if (regex.test(author) === true) { return }
    const json: any = await TM.fetchWebServices(author)
    if (json instanceof Error) { // UNKOWN PLAYER MOMENT
      Logger.warn(`Failed to fetch nickname for login ${author}`, json.message)
    } else {
      this.nextAuthorNickname = json?.nickname
      this.nextAuthorNation = countries.find(a => a.name === json?.path?.split('|')[1])?.code
    }
    if (this._isDisplayed === true) {
      this.display()
    }
  }

  async display(): Promise<void> {
    this.updateXML()
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    const isRace = TM.serverState === 'race'
    const rows = isRace ? 4 : 5
    this.height = (CONFIG.staticHeader.height + CONFIG.marginSmall) * rows + CONFIG.marginSmall
    const map = isRace ? TM.map : TM.mapQueue[0]
    const author: string = this.authorNickname ?? map.author
    const cfg = isRace ? CONFIG.map : RCFG.map
    const tmxmap = isRace ? TM.TMXCurrent : TM.TMXNext[0]
    const date: Date | undefined = tmxmap?.lastUpdateDate
    const tmxwr = tmxmap?.replays?.[0]?.time
    const grid = new Grid(this.width, this.height - CONFIG.marginSmall, [1], new Array(rows).fill(1))
    const texts: (string | undefined)[] = [
      cfg.title,
      TM.safeString(map.name),
      TM.safeString(author),
      TM.Utils.getTimeString(map.authorTime),
      date === undefined ? undefined : TM.formatDate(date),
      tmxmap?.awards === undefined ? undefined : tmxmap?.awards.toString(),
      tmxwr === undefined ? undefined : TM.Utils.getTimeString(tmxwr)
    ]
    const icons: string[] = cfg.icons.map(a => stringToObjectProperty(a, ICONS))
    if (this.authorNation !== undefined) {
      icons[2] = (flags as any)[this.authorNation] // cope typescript
    }
    const headerCFG = CONFIG.staticHeader
    const cell = (i: number, j: number, w: number, h: number): string => {
      if (i === 3) {
        return `
        <frame posn="0 0 1">
          ${staticHeader(texts[i] ?? '', icons[i] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: cfg.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
        </frame>
        <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
          headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
          ${staticHeader(texts[i + 1] ?? cfg.noDateText, icons[i + 1] ?? '', true, {
            rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
            textScale: cfg.textScale,
            centerText: true,
            textBackgrund: CONFIG.static.bgColor
          })}
        </frame>`
      }
      return `
      <frame posn="0 0 1">
        ${i === 0 ? staticHeader(texts[i] ?? '', icons[i] ?? '', true) :
          staticHeader(TM.strip(texts[i] ?? '', false), icons[i] ?? '', true, {
            textScale: cfg.textScale,
            textBackgrund: CONFIG.static.bgColor,
            centerVertically: true,
            horizontalPadding: 0.3
          })}
      </frame>`
    }
    const resultCell: GridCellFunction = (i, j, w, h) => {
      return `<frame posn="0 0 1">
      ${staticHeader(texts[i + 1] ?? cfg.noDateText, icons[i + 1] ?? '', true, {
        rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
        textScale: cfg.textScale,
        centerText: true,
        textBackgrund: CONFIG.static.bgColor
      })}
    </frame>
    <frame posn="${(headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)) +
        headerCFG.squareWidth + (headerCFG.margin * 2)} 0 1">
      ${staticHeader(texts[i + 2] ?? cfg.noDateText, icons[i + 2] ?? '', true, {
          rectangleWidth: (headerCFG.rectangleWidth / 2) - (headerCFG.margin + (headerCFG.squareWidth / 2)),
          textScale: cfg.textScale,
          centerText: true,
          textBackgrund: CONFIG.static.bgColor
        })}
    </frame>`
    }
    const arr: any[] = new Array(4).fill(cell)
    if (!isRace) {
      arr.push(resultCell)
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${grid.constructXml(arr)}
      </frame>
      </manialink>`
  }

}