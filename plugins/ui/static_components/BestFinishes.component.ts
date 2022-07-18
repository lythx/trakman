import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'
import { CONFIG, IDS, Grid, centeredText, verticallyCenteredText } from '../UiUtils.js'

export default class BestFinishes extends StaticComponent {

  private readonly width = CONFIG.bestFinishes.width
  private readonly positionX = CONFIG.static.rightPosition - (CONFIG.static.marginBig + CONFIG.bestFinishes.width)
  private readonly positionY = CONFIG.static.topBorder
  private readonly entries = CONFIG.bestFinishes.entries
  private readonly entryHeight = CONFIG.bestFinishes.entryHeight
  private readonly bestFinishes: { login: string, time: number, nickname: string }[] = []
  private readonly columnProportions = CONFIG.bestFinishes.columnProportions
  private readonly selfColour = CONFIG.bestFinishes.selfColour
  private readonly newestColour = CONFIG.bestFinishes.newestColour
  private readonly textScale = CONFIG.bestFinishes.textScale
  private readonly textPadding = CONFIG.bestFinishes.textPadding
  private readonly grid: Grid
  private newestFinish: number = -1
  private height = this.entries * this.entryHeight

  constructor() {
    super(IDS.bestFinishes, 'race')
    this.grid = new Grid(this.width, this.height, this.columnProportions, new Array(this.entries).fill(1))
    TM.addListener('Controller.PlayerFinish', (info: FinishInfo) => {
      let index = this.bestFinishes.findIndex(a => a.time > info.time)
      if (index === -1) { index = this.bestFinishes.length }
      if (index < this.entries) {
        this.bestFinishes.splice(index, 0, { login: info.login, time: info.time, nickname: info.nickName })
        this.bestFinishes.length = Math.min(this.entries, this.bestFinishes.length)
        this.newestFinish = index
        this.display()
      }
    })
    TM.addListener('Controller.BeginMap', (info: BeginMapInfo) => {
      this.newestFinish = -1
      this.bestFinishes.length = 0
      this.display()
    })
  }

  display(): void {
    this._isDisplayed = true
    for (const e of TM.players) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(`
    <manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1"/>
        ${this.constructText(login)}
      </frame>
    </manialink>`, login)
  }

  private constructText(login: string): string {

    const indexCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(`${i + 1}.`, w, h, { textScale: this.textScale, padding: this.textPadding })
    }

    const timeCell = (i: number, j: number, w: number, h: number): string => {
      const finish = this.bestFinishes[i]
      let format = finish.login === login ? `<format textcolor="${this.selfColour}"/>` : ''
      if (i === this.newestFinish) { format = `<format textcolor="${this.newestColour}"/>` }
      return format + centeredText(TM.Utils.getTimeString(this.bestFinishes[i].time), w, h, { textScale: this.textScale, padding: this.textPadding })
    }

    const nicknameCell = (i: number, j: number, w: number, h: number): string => {
      return verticallyCenteredText(TM.strip(this.bestFinishes[i].nickname, false), w, h, { textScale: this.textScale, padding: this.textPadding })
    }

    const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
    for (let i = 0; i < this.bestFinishes.length; i++) {
      arr.push(indexCell, timeCell, nicknameCell)
    }
    return this.grid.constructXml(arr)
  }

}

