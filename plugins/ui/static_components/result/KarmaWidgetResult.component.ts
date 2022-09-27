import { centeredText, Grid, GridCellFunction, IDS, StaticHeader } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import { maniakarma } from '../../../maniakarma/Maniakarma.js'
import StaticComponent from '../../StaticComponent.js'
import config from './KarmaWidgetResult.config.js'

export default class KarmaWidgetResult extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly header: StaticHeader
  private readonly headerH: number
  private readonly options: number[] = [3, 2, 1, -1, -2, -3]
  private readonly grid: Grid

  constructor() {
    super(IDS.karma, 'result')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.header = new StaticHeader('result')
    this.headerH = this.header.options.height
    this.grid = new Grid((config.width + config.margin - config.buttonWidth) / 2, config.margin + config.height - this.headerH,
      new Array(3).fill(1), new Array(3).fill(1), { background: config.background, margin: config.margin })
    tm.addListener('KarmaVote', (): void => {
      this.display()
    })
    maniakarma.onMapFetch(this.display.bind(this))
    maniakarma.onVote(this.display.bind(this))
    tm.addListener('ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.actionId > this.id && info.actionId <= this.id + 6) {
        const index: number = info.actionId - (this.id + 1)
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
    const votes: TM.Vote[] = tm.karma.current
    const voteAmounts: number[] = []
    for (let i = this.options.length - 1; i >= 0; i--) {
      voteAmounts.unshift(votes.filter(a => a.vote === this.options[i]).length)
    }
    const totalVotes: number = votes.length
    const karma: number = tm.maps.current.voteRatio
    const mkVotes = maniakarma.mapKarma
    const mkKarmaValue: number = maniakarma.mapKarmaRatio
    const totalMkVotes: number = Object.values(mkVotes).reduce((acc, cur) => acc += cur, 0)
    const combined = Object.values(mkVotes).map((a: number, i) => a + voteAmounts[i])
    const max: number = Math.max(...combined)
    const personalVote = votes.find(a => a.login === login)?.vote
    return `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, false)}
        <frame posn="0 -${this.headerH + config.margin} 1">
          ${this.constructGraph(max, voteAmounts, mkVotes)}
        </frame>
        <frame posn="${(config.width - config.buttonWidth) / 2 - config.margin / 2} -${this.headerH} 1">
          ${this.constructInfo(totalVotes, karma, totalMkVotes, mkKarmaValue)}
        </frame>
        <frame posn="${config.width - config.buttonWidth} -${this.headerH + config.margin} 1">
          ${this.constructButtons(personalVote)}
        </frame>
      </frame>
    </manialink>`
  }

  private constructGraph(max: number, voteAmounts: number[], mkVotes: {
    fantastic: number;
    beautiful: number;
    good: number;
    bad: number;
    poor: number;
    waste: number;
  }): string {
    const width: number = (config.width + config.margin - config.buttonWidth) / 2 - config.margin
    let ret: string = `<quad posn="0 0 1" sizen="${width} ${config.height - (this.headerH + config.margin)}" bgcolor="${config.background}"/>`
    const w: number = width - (config.margin * 2)
    const h: number = (config.height - (this.headerH + config.margin * 2)) / this.options.length
    const mkArr = ['fantastic', 'beautiful', 'good', 'bad', 'poor', 'waste']
    for (const [i, e] of voteAmounts.entries()) {
      const barW: number = max === 0 ? 0 : (e / max) * w
      const mkBarW: number = max === 0 ? 0 : (mkVotes[mkArr[i] as keyof typeof mkVotes] / max) * w
      ret += `<quad posn="${config.margin} -${config.margin + h * i} 3" sizen="${barW} ${h - config.margin}" bgcolor="${config.colours[i]}"/>`
      ret += `<quad posn="${config.margin + barW} -${config.margin + h * i} 3" sizen="${mkBarW} ${h - config.margin}" bgcolor="${config.mkColours[i]}"/>`
    }
    return ret
  }

  private constructInfo(totalVotes: number, karma: number, totalMkVotes: number, mkKarmaValue: number): string {
    const mkKarma: string = maniakarma.isEnabled ? Math.round(mkKarmaValue).toString() : config.defaultText
    const mkAmount: string = maniakarma.isEnabled ? totalMkVotes.toString() : config.defaultText
    const options = { padding: config.textPadding, textScale: config.textScale }
    const arr: GridCellFunction[] = [
      (i, j, w, h) => ``,
      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[0]}"/>`,
      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4"
       sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[1]}"/>`,

      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[2]}"/>`,
      (i, j, w, h) => centeredText(karma === -1 ? config.defaultText : Math.round(karma).toString(), w, h, options),
      (i, j, w, h) => centeredText(mkKarma, w, h, options),

      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[3]}"/>`,
      (i, j, w, h) => centeredText(totalVotes.toString(), w, h, options),
      (i, j, w, h) => centeredText(mkAmount, w, h, options),
    ]
    return this.grid.constructXml(arr)
  }

  private constructButtons(personalVote?: -3 | -2 | -1 | 1 | 2 | 3): string {
    let ret: string = `<quad posn="0 0 1" sizen="${config.buttonWidth} ${config.height - (this.headerH + config.margin)}" bgcolor="${config.background}"/>`
    const h: number = (config.height - (this.headerH + config.margin * 2)) / config.options.length
    for (const [i, e] of config.options.entries()) {
      const offsetFix: number = i > 2 ? config.minus.offset : config.plus.offset
      const textScale: number = i > 2 ? config.minus.scale : config.plus.scale
      const colour: string = this.options[i] === personalVote ? config.selfColour : config.mkColours[i]
      ret += `<quad posn="${config.margin} -${config.margin + h * i} 2" 
      sizen="${config.buttonWidth - (config.margin * 2)} ${h - config.margin}" bgcolor="${colour}" action="${this.id + i + 1}"/>
      ${centeredText(e, config.buttonWidth - (config.margin * 2), h - config.margin,
        { xOffset: config.margin, yOffset: config.margin + h * i + offsetFix, padding: 0, textScale })}`
    }
    return ret
  }

}

