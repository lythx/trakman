/**
 * @author lythx
 * @since 0.1
 */

import { centeredText, Grid, GridCellFunction, componentIds, StaticHeader, addManialinkListener, StaticComponent } from '../../UI.js'
import { maniakarma, MKMapVotes } from '../../../maniakarma/Maniakarma.js'
import config from './KarmaWidget.config.js'
import { actions } from '../../../actions/Actions.js'

export default class KarmaWidget extends StaticComponent {

  private readonly header: StaticHeader
  private readonly headerH: number
  private readonly options = [3, 2, 1, -1, -2, -3] as const
  private readonly mkOptions = ['fantastic', 'beautiful', 'good', 'bad', 'poor', 'waste'] as const
  private readonly grid: Grid

  constructor() {
    super(componentIds.karma)
    this.header = new StaticHeader('race')
    this.headerH = this.header.options.height
    this.grid = new Grid((config.width + config.margin - config.buttonWidth) / 2, config.margin + config.height - this.headerH,
      new Array(3).fill(1), new Array(3).fill(1), { background: config.background, margin: config.margin })
    this.renderOnEvent('KarmaVote', () => this.display())
    maniakarma.onMapFetch(() => this.sendMultipleManialinks(this.display()))
    maniakarma.onVote(() => this.sendMultipleManialinks(this.display()))
    addManialinkListener(this.id + 1, 6, (info, offset): void => actions.addVote(info, this.options[offset]))
    this.renderOnEvent('VotesPrefetch', () => this.display())
  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    if (this.reduxModeEnabled) { return this.displayToPlayer('')?.xml }
    const arr = []
    for (const e of tm.players.list) {
      arr.push(this.displayToPlayer(e.login))
    }
    return arr
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.constructXml(login), login }
  }

  private constructXml(login: string): string {
    let max: number = 0
    const votes: tm.Vote[] = tm.karma.current
    const karma: number = tm.maps.current.voteRatio
    const voteAmounts: number[] = []
    const mkVotes: MKMapVotes = maniakarma.mapKarma
    const mkKarma: number = maniakarma.mapKarmaRatio
    const mkVoteAmounts: number[] = []
    let mkVoteCount: number = 0
    for (let i: number = 0; i < this.options.length; i++) {
      voteAmounts[i] = votes.filter(a => a.vote === this.options[i]).length
      mkVoteAmounts[i] = mkVotes[this.mkOptions[i]]
      mkVoteCount += mkVoteAmounts[i]
      const sum: number = mkVoteAmounts[i] + voteAmounts[i]
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
    for (let i: number = 0; i < voteAmounts.length; i++) {
      const barW: number = max === 0 ? 0 : (voteAmounts[i] / max) * w
      const mkBarW: number = max === 0 ? 0 : (mkVoteAmounts[i] / max) * w
      ret += `<quad posn="${config.margin} -${config.margin + h * i} 3" sizen="${barW} ${h - config.margin}" bgcolor="${config.colours[i]}"/>
        <quad posn="${config.margin + barW} -${config.margin + h * i} 3" sizen="${mkBarW} ${h - config.margin}" bgcolor="${config.mkColours[i]}"/>`
    }
    return ret
  }

  private constructInfo(voteCount: number, karma: number, mkVoteCount: number, mkKarma: number): string {
    const karmaStr: string = karma !== -1 ? (~~karma).toString() : config.defaultText
    const mkKarmaStr: string = mkVoteCount !== 0 ? (~~mkKarma).toString() : config.defaultText
    const mkCountStr: string = maniakarma.isEnabled ? mkVoteCount.toString() : config.defaultText
    const options = { padding: config.textPadding, textScale: config.textScale }
    const arr: GridCellFunction[] = [
      (i, j, w, h): string => ``,
      (i, j, w, h): string => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[0]}"/>`,
      (i, j, w, h): string => `<quad posn="${config.margin} ${-config.margin} 4"
       sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[1]}"/>`,

      (i, j, w, h): string => `<quad posn="${config.margin} ${-config.margin} 4" 
      sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[2]}"/>`,
      (i, j, w, h): string => centeredText(karmaStr, w, h, options),
      (i, j, w, h): string => centeredText(mkKarmaStr, w, h, options),

      (i, j, w, h): string => `<quad posn="${config.margin} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" image="${config.icons[3]}"/>`,
      (i, j, w, h): string => centeredText(voteCount.toString(), w, h, options),
      (i, j, w, h): string => centeredText(mkCountStr, w, h, options),
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

