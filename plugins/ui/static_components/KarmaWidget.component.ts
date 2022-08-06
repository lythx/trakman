import { getStaticPosition, centeredText, Grid, CONFIG, horizontallyCenteredText, ICONS, IDS, staticHeader, stringToObjectProperty } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'
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
  private readonly icons: string[] = CONFIG.karma.icons

  constructor() {
    super(IDS.karma, 'race')
    const pos = getStaticPosition('karma')
    this.positionX = pos.x
    this.positionY = pos.y
    // setInterval(() => {
    //   this.updateXML()
    //   this.display()
    // }, 100)
    TM.addListener('Controller.KarmaVote', (): void => {
      this.display()
    })
    TM.addListener('Controller.BeginMap', (): void => {
      this.display()
    })
    TM.addListener('Controller.ManiakarmaVotes', (): void => {
      this.display()
    })
    TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo): void => {
      if (info.answer > this.id && info.answer <= this.id + 6) {
        const index: number = info.answer - (this.id + 1)
        const votes: [3, 2, 1, -1, -2, -3] = [3, 2, 1, -1, -2, -3]
        TM.karma.add(TM.maps.current.id, info.login, votes[index])
      }
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const e of TM.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    TM.sendManialink(this.constructXml(login), login)
  }

  private constructXml(login: string): string {
    const votes: TMVote[] = TM.votes.filter(a => a.mapId === TM.maps.current.id)
    const voteAmounts: number[] = []
    for (const e of this.options) {
      voteAmounts.unshift(votes.filter(a => a.vote === e).length)
    }
    const max: number = Math.max(...voteAmounts)
    const totalVotes: number = votes.length
    const karma: number = TM.voteRatios.find(a => a.mapId === TM.maps.current.id)?.ratio ?? 0
    const mkVotes = TM.mkMapKarma
    const mkKarmaValue: number = TM.mkMapKarmaValue
    const totalMkVotes: number = Object.values(mkVotes).reduce((acc, cur) => acc += cur, 0)
    const maxMkAmount: number = Math.max(...Object.values(mkVotes))
    const personalVote = votes.find(a => a.login === login)?.vote
    return `<manialink id="${this.id}">
    <frame posn="${this.positionX} ${this.positionY} 1">
        <format textsize="1" textcolor="FFFF"/> 
        ${staticHeader(CONFIG.karma.title, stringToObjectProperty(CONFIG.karma.icon, ICONS), false)}
        <frame posn="0 -${this.headerH + this.margin} 1">
          ${this.constructGraph(max, voteAmounts, totalVotes, maxMkAmount, mkVotes, totalMkVotes)}
        </frame>
        <frame posn="${(this.width - this.buttonW) / 2 + this.margin / 2} -${this.headerH + this.margin} 1">
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
    const height: number = this.height - this.headerH
    const width: number = (this.width + this.margin - this.buttonW) / 2 - this.margin
    const colour: string = karma > 0 ? '$F00' : '$0F0' //TODO
    const mkKarma: string = process.env.USE_MANIAKARMA === 'YES' ? Math.round(mkKarmaValue).toString() : '-'
    const mkAmount: string = process.env.USE_MANIAKARMA === 'YES' ? totalMkVotes.toString() : '-'
    const grid: Grid = new Grid(width, height, new Array(3).fill(1), new Array(3).fill(1))
    const arr: ((i: number, j: number, w: number, h: number) => string)[] = [
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${stringToObjectProperty(this.icons[0], ICONS)}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${stringToObjectProperty(this.icons[1], ICONS)}"/>`,

      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${stringToObjectProperty(this.icons[2], ICONS)}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(Math.round(karma).toString(), w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(mkKarma, w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,

      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      <quad posn="${this.margin} ${-this.margin} 4" sizen="${w - this.margin * 3} ${h - this.margin * 3}" image="${stringToObjectProperty(this.icons[3], ICONS)}"/>`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(totalVotes.toString(), w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
      (i: number, j: number, w: number, h: number): string => `<quad posn="0 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${CONFIG.static.bgColor}"/>
      ${centeredText(mkAmount, w - this.margin, h - this.margin, { padding: 0.1, textScale: 0.65 })}`,
    ]
    return grid.constructXml(arr)
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

