import { getStaticPosition, centeredText, Grid, CONFIG, GridCellFunction, ICONS, IDS, staticHeader, getIcon } from '../UiUtils.js'
import { trakman as tm } from '../../../src/Trakman.js'
import { maniakarma } from '../../maniakarma/Maniakarma.js'
import StaticComponent from '../StaticComponent.js'

export default class KarmaWidget extends StaticComponent {

  private readonly width: number = CONFIG.static.width
  private readonly height: number = CONFIG.karma.height
  private readonly positionX: number
  private readonly positionY: number
  private readonly headerH: number = CONFIG.staticHeader.height
  private readonly margin: number = CONFIG.marginSmall
  private readonly buttonW: number = 1.7
  private readonly options: number[] = [-3, -2, -1, 1, 2, 3]
  private readonly colours: string[] = ['0F0A', '0D0A', '0B0A', 'BOOA', 'D00A', 'F00A']
  private readonly icons: string[] = CONFIG.karma.icons
  private readonly grid: Grid

  constructor() {
    super(IDS.karma, 'race')
    const pos = getStaticPosition('karma')
    this.positionX = pos.x
    this.positionY = pos.y
    this.height - this.headerH
    this.grid = new Grid((this.width + this.margin - this.buttonW) / 2, this.margin + this.height - this.headerH, new Array(3).fill(1), new Array(3).fill(1),
      { background: CONFIG.static.bgColor, margin: this.margin })
    // setInterval(() => {
    //   this.updateXML()
    //   this.display()
    // }, 100)
    tm.addListener('Controller.KarmaVote', (): void => {
      this.display()
    })
    tm.addListener('Controller.BeginMap', (): void => {
      this.display()
    })
    maniakarma.onMapFetch(this.display.bind(this))
    maniakarma.onVote(this.display.bind(this))
    tm.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.answer > this.id && info.answer <= this.id + 6) {
        const index: number = info.answer - (this.id + 1)
        const votes: [3, 2, 1, -1, -2, -3] = [3, 2, 1, -1, -2, -3]
        tm.karma.add(info, votes[index])
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.constructXml(login), login)
  }

  private constructXml(login: string): string {
    const votes: TMVote[] = tm.karma.current
    const voteAmounts: number[] = []
    for (const e of this.options) {
      voteAmounts.unshift(votes.filter(a => a.vote === e).length)
    }
    const max: number = Math.max(...voteAmounts)
    const totalVotes: number = votes.length
    const karma: number = tm.maps.current.voteRatio
    const mkVotes = maniakarma.mapKarma
    const mkKarmaValue: number = maniakarma.mapKarmaRatio
    const totalMkVotes: number = Object.values(mkVotes).reduce((acc, cur) => acc += cur, 0)
    const maxMkAmount: number = Math.max(...Object.values(mkVotes))
    const personalVote = votes.find(a => a.login === login)?.vote
    return `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.karma.title, getIcon(CONFIG.karma.icon), false)}
        <frame posn="0 -${this.headerH + this.margin} 1">
          ${this.constructGraph(max, voteAmounts, totalVotes, maxMkAmount, mkVotes, totalMkVotes)}
        </frame>
        <frame posn="${(this.width - this.buttonW) / 2 - this.margin / 2} -${this.headerH} 1">
          ${this.constructInfo(totalVotes, karma, totalMkVotes, mkKarmaValue)}
        </frame>
        <frame posn="${this.width - this.buttonW} -${this.headerH + this.margin} 1">
          ${this.constructButtons(personalVote)}
        </frame>
      </frame>
    </manialink>`
  }

  private constructGraph(maxAmount: number, voteAmounts: number[], totalVotes: number, maxMkAmount: number, mkVotes: {
    fantastic: number;
    beautiful: number;
    good: number;
    bad: number;
    poor: number;
    waste: number;
  }, totalMkVotes: number): string {
    const width: number = (this.width + this.margin - this.buttonW) / 2 - this.margin
    const colours: string[] = ['0F0A', '0D0A', '0B0A', 'BOOA', 'D00A', 'F00A']
    let ret: string = `<quad posn="0 0 1" sizen="${width} ${this.height - (this.headerH + this.margin)}" bgcolor="${CONFIG.static.bgColor}"/>`
    const w: number = width - (this.margin * 2)
    const h: number = (this.height - (this.headerH + this.margin * 2)) / this.options.length
    const mkArr = ['fantastic', 'beautiful', 'good', 'bad', 'poor', 'waste']
    for (const [i, e] of voteAmounts.entries()) {
      if (totalVotes >= totalMkVotes) {
        const barW: number = maxAmount === 0 ? 0 : (e / maxAmount) * w
        ret += `<quad posn="${this.margin} -${this.margin + h * i} 3" sizen="${barW} ${h - this.margin}" bgcolor="${colours[i]}"/>`
      } else {
        const mkBarW: number = maxMkAmount === 0 ? 0 : ((mkVotes as any)[mkArr[i]] / maxMkAmount) * w
        ret += `<quad posn="${this.margin} -${this.margin + h * i} 3" sizen="${mkBarW} ${h - this.margin}" bgcolor="${colours[i]}"/>`
      }
    }
    return ret
  }

  private constructInfo(totalVotes: number, karma: number, totalMkVotes: number, mkKarmaValue: number): string {
    const colour: string = karma > 0 ? '$F00' : '$0F0' //TODO
    const mkKarma: string = maniakarma.isEnabled ? Math.round(mkKarmaValue).toString() : '-'
    const mkAmount: string = maniakarma.isEnabled ? totalMkVotes.toString() : '-'
    const arr: GridCellFunction[] = [
      (i, j, w, h) => ``,
      (i, j, w, h) => `<quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 2} ${h - this.margin * 2}" image="${getIcon(this.icons[0])}"/>`,
      (i, j, w, h) => `<quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 2} ${h - this.margin * 2}" image="${getIcon(this.icons[1])}"/>`,

      (i, j, w, h) => `<quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 2} ${h - this.margin * 2}" image="${getIcon(this.icons[2])}"/>`,
      (i, j, w, h) => centeredText(Math.round(karma).toString(), w, h, { padding: 0.1, textScale: 0.65 }),
      (i, j, w, h) => centeredText(mkKarma, w, h, { padding: 0.1, textScale: 0.65 }),

      (i, j, w, h) => `<quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 2} ${h - this.margin * 2}" image="${getIcon(this.icons[3])}"/>`,
      (i, j, w, h) => centeredText(totalVotes.toString(), w, h, { padding: 0.1, textScale: 0.65 }),
      (i, j, w, h) => centeredText(mkAmount, w, h, { padding: 0.1, textScale: 0.65 }),
    ]
    return this.grid.constructXml(arr)
  }

  private constructButtons(personalVote?: -3 | -2 | -1 | 1 | 2 | 3): string {
    let ret: string = `<quad posn="0 0 1" sizen="${this.buttonW} ${this.height - (this.headerH + this.margin)}" bgcolor="${CONFIG.static.bgColor}"/>`
    const selfColour = 'FF0A'
    const values: number[] = [3, 2, 1, -1, -2, -3]
    const options: string[] = ['+++', '++', '+', '-', '--', '---']
    const colours: string[] = ['0F0A', '0D0A', '0B0A', 'BOOA', 'D00A', 'F00A']
    const h: number = (this.height - (this.headerH + this.margin * 2)) / options.length
    for (const [i, e] of options.entries()) {
      const offsetFix: number = i > 2 ? -0.3 : 0
      const textScale: number = i > 2 ? 1 : 0.6
      const colour: string = values[i] === personalVote ? selfColour : colours[i]
      ret += `<quad posn="${this.margin} -${this.margin + h * i} 2" sizen="${this.buttonW - (this.margin * 2)} ${h - this.margin}" bgcolor="${colour}" action="${this.id + i + 1}"/>
      ${centeredText(e, this.buttonW - (this.margin * 2), h - this.margin, { xOffset: this.margin, yOffset: this.margin + h * i + offsetFix, padding: 0, textScale })}`
    }
    return ret
  }

}

