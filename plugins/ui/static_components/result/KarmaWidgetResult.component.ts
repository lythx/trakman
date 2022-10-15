import { centeredText, Grid, GridCellFunction, IDS, StaticHeader, addManialinkListener } from '../../UiUtils.js'
import { maniakarma } from '../../../maniakarma/Maniakarma.js'
import StaticComponent from '../../StaticComponent.js'
import config from './KarmaWidgetResult.config.js'

export default class KarmaWidgetResult extends StaticComponent {

  private readonly positionX: number
  private readonly positionY: number
  private readonly header: StaticHeader
  private readonly headerH: number
  private readonly options = [3, 2, 1, -1, -2, -3] as const
  private readonly mkOptions = ['fantastic', 'beautiful', 'good', 'bad', 'poor', 'waste'] as const
  private readonly grid: Grid

  constructor() {
    super(IDS.karmaResult, 'result')
    const pos = this.getRelativePosition()
    this.positionX = pos.x
    this.positionY = pos.y
    this.header = new StaticHeader('result')
    this.headerH = this.header.options.height
    this.grid = new Grid((config.width + config.margin - config.buttonWidth) / 2, config.margin + config.height - this.headerH,
      new Array(3).fill(1), new Array(3).fill(1), { background: config.background, margin: config.margin })
    tm.addListener('KarmaVote', (): void => this.display())
    maniakarma.onMapFetch((): void => this.display())
    maniakarma.onVote((): void => this.display())
    addManialinkListener(this.id + 1, 6, (info, offset): void => tm.karma.add(info, this.options[offset]))
    tm.addListener('VotesPrefetch', (): void => this.display())
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
    let max = 0
    const votes: tm.Vote[] = tm.karma.current
    const karma: number = tm.maps.current.voteRatio
    const voteAmounts: number[] = []
    const mkVotes = maniakarma.mapKarma
    const mkKarma: number = maniakarma.mapKarmaRatio
    const mkVoteAmounts: number[] = []
    let mkVoteCount = 0
    for (let i = 0; i < this.options.length; i++) {
      voteAmounts[i] = votes.filter(a => a.vote === this.options[i]).length
      mkVoteAmounts[i] = mkVotes[this.mkOptions[i]]
      mkVoteCount += mkVoteAmounts[i]
      const sum = mkVoteAmounts[i] + voteAmounts[i]
      if (sum > max) { max = sum }
    }
    const personalVote = votes.find(a => a.login === login)?.vote
    return `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${this.header.constructXml(config.title, config.icon, false)}
        <frame posn="0 -${this.headerH + config.margin} 1">
          ${this.constructGraph(max, voteAmounts, mkVoteAmounts)}
        </frame>
        <frame posn="${(config.width - config.buttonWidth) / 2 - config.margin / 2} -${this.headerH} 1">
          ${this.constructInfo(votes.length, karma, mkVoteCount, mkKarma)}
        </frame>
        <frame posn="${config.width - config.buttonWidth} -${this.headerH + config.margin} 1">
          ${this.constructButtons(personalVote)}
        </frame>
      </frame>
    </manialink>`
  }

  private constructGraph(max: number, voteAmounts: number[], mkVoteAmounts: number[]): string {
    const width: number = (config.width + config.margin - config.buttonWidth) / 2 - config.margin
    let ret: string = `<quad posn="0 0 1" sizen="${width} ${config.height - (this.headerH + config.margin)}" bgcolor="${config.background}"/>`
    const w: number = width - (config.margin * 2)
    const h: number = (config.height - (this.headerH + config.margin * 2)) / this.options.length
    for (let i = 0; i < voteAmounts.length; i++) {
      const barW: number = max === 0 ? 0 : (voteAmounts[i] / max) * w
      const mkBarW: number = max === 0 ? 0 : (mkVoteAmounts[i] / max) * w
      ret += `<quad posn="${config.margin} -${config.margin + h * i} 3" sizen="${barW} ${h - config.margin}" bgcolor="${config.colours[i]}"/>
        <quad posn="${config.margin + barW} -${config.margin + h * i} 3" sizen="${mkBarW} ${h - config.margin}" bgcolor="${config.mkColours[i]}"/>`
    }
    return ret
  }

  private constructInfo(voteCount: number, karma: number, mkVoteCount: number, mkKarma: number): string {
    const karmaStr = karma !== -1 ? (~~karma).toString() : config.defaultText
    const mkKarmaStr: string = mkVoteCount !== 0 ? (~~mkKarma).toString() : config.defaultText
    const mkCountStr: string = maniakarma.isEnabled ? mkVoteCount.toString() : config.defaultText
    const options = { padding: config.textPadding, textScale: config.textScale }
    const arr: GridCellFunction[] = [
      (i, j, w, h) => ``,
      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[0]}"/>`,
      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4"
       sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[1]}"/>`,

      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[2]}"/>`,
      (i, j, w, h) => centeredText(karmaStr, w, h, options),
      (i, j, w, h) => centeredText(mkKarmaStr, w, h, options),

      (i, j, w, h) => `<quad posn="${config.margin} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[3]}"/>`,
      (i, j, w, h) => centeredText(voteCount.toString(), w, h, options),
      (i, j, w, h) => centeredText(mkCountStr, w, h, options),
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

