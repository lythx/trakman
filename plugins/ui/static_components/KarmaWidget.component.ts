import { calculateStaticPositionY, centeredText, Grid, CONFIG, horizontallyCenteredText, ICONS, IDS, staticHeader, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
import StaticComponent from '../StaticComponent.js'

export default class KarmaWidget extends StaticComponent {

  private readonly width: number
  private readonly height: number
  private readonly positionX: number
  private readonly positionY: number
  private readonly headerH: number = CONFIG.staticHeader.height
  private readonly margin: number = CONFIG.static.marginSmall
  private readonly buttonW: number = 1.7
  private readonly options: number[] = [-3, -2, -1, 1, 2, 3]
  private xml: string = ''

  constructor() {
    super(IDS.KarmaWidget, 'race')
    this.width = CONFIG.static.width
    this.height = CONFIG.karma.height
    this.positionX = CONFIG.static.leftPosition
    this.positionY = calculateStaticPositionY('karma')
    this.updateXML()
    this.display()
    // setImmediate(() => {
    //   this.updateXML()
    //   this.display()
    // }, 100)
  }

  display(): void {
    this._isDisplayed = true
    TM.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    TM.sendManialink(this.xml, login)
  }

  private updateXML(): void {
    //const votes = TM.votes.filter(a => a.mapId === TM.map.id)
    const votes: { vote: number }[] = []
    const f: number[] = [-3, -2, -1, 1, 2, 3]
    for (let i: number = 0; i < 100; i++) {
      votes.push({ vote: f[Math.floor(Math.random() * 6)] })
    }
    const voteAmounts: number[] = []
    for (const e of this.options) {
      voteAmounts.push(votes.filter(a => a.vote === e).length)
    }
    const max: number = Math.max(...voteAmounts)
    const totalVotes: number = votes.length
    const karma: number = (voteAmounts.reduce((acc, cur, i): number => acc += cur * (this.options[i] / 3)) / totalVotes) * 100
    this.xml = `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.karma.title, stringToObjectProperty(CONFIG.karma.icon, ICONS), false)}
        <frame posn="0 -${this.headerH + this.margin} 1">
          ${this.constructGraph(max, voteAmounts)}
        </frame>
        <frame posn="${(this.width - this.buttonW) / 2 + this.margin / 2} -${this.headerH + this.margin} 1">
          ${this.constructInfo(totalVotes, karma, voteAmounts)}
        </frame>
        <frame posn="${this.width - this.buttonW} -${this.headerH + this.margin} 1">
          ${this.constructButtons()}
        </frame>
      </frame>
    </manialink>`
  }

  private constructGraph(maxAmount: number, voteAmounts: number[]): string {
    const width: number = (this.width + this.margin - this.buttonW) / 2 - this.margin
    const colours: string[] = ['F00A', 'D00A', 'BOOA', '0B0A', '0D0A', '0F0A']
    let ret: string = `<quad posn="0 0 1" sizen="${width} ${this.height - (this.headerH + this.margin)}" bgcolor="${CONFIG.static.bgColor}"/>`
    const w: number = width - (this.margin * 2)
    const h: number = (this.height - (this.headerH + this.margin * 2)) / this.options.length
    for (const [i, e] of voteAmounts.entries()) {
      ret += `<quad posn="${this.margin} -${this.margin + h * i} 3" sizen="${(e / maxAmount) * w} ${h - this.margin}" bgcolor="${colours[i]}"/>`
    }
    return ret
  }

  private constructInfo(totalVotes: number, karma: number, voteAmounts: number[]): string {
    const height: number = this.height - this.headerH
    const width: number = (this.width + this.margin - this.buttonW) / 2 - this.margin
    const colour: string = karma > 0 ? '$F00' : '$0F0'
    const grid: Grid = new Grid(width, height, new Array(3).fill(1), new Array(3).fill(1))
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = [
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="https://cdn.discordapp.com/attachments/793464821030322196/990589378457911327/LocalPin.png"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${ICONS.globe}"/>`,

      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${ICONS.heart}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(CONFIG.static.format + karma.toString().split('.')[0], w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(CONFIG.static.format + '-', w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,

      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="https://cdn.discordapp.com/attachments/502122268936110100/990585196288024576/Vote.png"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(CONFIG.static.format + totalVotes.toString(), w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(CONFIG.static.format + '-', w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
    ]


    // let ret = `<quad posn="0 0 1" sizen="${width} ${this.height - (this.headerH + this.margin)}" bgcolor="${CONFIG.static.bgColor}"/>

    // ${horizontallyCenteredText('Global', width, height, { textScale: 0.75, yOffset: 0.2 })}
    // ${horizontallyCenteredText(totalVotes.toString(), width / 2, height, { textScale: 0.6, yOffset: 1.3 })}
    // ${horizontallyCenteredText('Votes', width / 2, height, { textScale: 0.55, yOffset: 2.3 })}
    // <format textcolor="${colour}"/>
    // ${horizontallyCenteredText(karma.toString(), width / 2, height, { textScale: 0.6, yOffset: 1.3, xOffset: width / 2 })}
    // <format textcolor="FFFF"/>
    // ${horizontallyCenteredText('Karma', width / 2, height, { textScale: 0.55, yOffset: 2.3, xOffset: width / 2 })}`
    return grid.constructXml(arr)
  }

  private constructButtons(): string {
    let ret: string = `<quad posn="0 0 1" sizen="${this.buttonW} ${this.height - (this.headerH + this.margin)}" bgcolor="${CONFIG.static.bgColor}"/>`
    const options: string[] = ['---', '--', '-', '+', '++', '+++']
    const colours: string[] = ['F00A', 'D00A', 'BOOA', '0B0A', '0D0A', '0F0A']
    const h: number = (this.height - (this.headerH + this.margin * 2)) / options.length
    for (const [i, e] of options.entries()) {
      const offsetFix: number = i < 3 ? -0.3 : 0
      const textScale: number = i < 3 ? 1 : 0.6
      ret += `<quad posn="${this.margin} -${this.margin + h * i} 2" sizen="${this.buttonW - (this.margin * 2)} ${h - this.margin}" bgcolor="${colours[i]}"/>
      ${centeredText(CONFIG.static.format + e, this.buttonW - (this.margin * 2), h - this.margin, { xOffset: this.margin, yOffset: this.margin + h * i + offsetFix, padding: 0, textScale })}`
    }
    return ret
  }

}

