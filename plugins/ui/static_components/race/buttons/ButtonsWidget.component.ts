import { getStaticPosition, IDS, Grid, constuctButton, GridCellFunction } from '../../../UiUtils.js'
import { trakman as tm } from '../../../../../src/Trakman.js'
import StaticComponent from '../../../StaticComponent.js'
import { VisitCounter } from './VisitCounter.js'
import { TimeButton } from './TimeButton.js'
import { PlayerCounter } from './PlayerCounter.js'
import { VersionButton } from './VersionButton.js'
import { MapsButton } from './MapsButton.js'
import { PayReplay } from './PayReplay.js'
import { PaySkip } from './PaySkip.js'
import { VoteReplay } from './VoteReplay.js'
import { VoteSkip } from './VoteSkip.js'
import { StatsButton } from './StatsButton.js'
import { CommandListButton } from './CommandListButton.js'
import { SectorsButton } from './SectorsButton.js'
import { UiButton } from './UiButton.js'
import config from './ButtonsWidget.config.js'

export default class ButtonsWidget extends StaticComponent {

  private readonly width: number = config.width
  private readonly height: number = config.height
  private readonly grid: Grid
  private readonly positionX: number
  private readonly positionY: number
  private readonly buttons: UiButton[] = []
  private xml: string = ''

  constructor() {
    super(IDS.buttons, 'race')
    const pos = getStaticPosition(this)
    this.positionX = pos.x
    this.positionY = pos.y
    this.grid = new Grid(this.width + config.margin, this.height + config.margin,
      new Array(config.columns).fill(1), new Array(config.rows).fill(1))
    const allButtons = [
      new VisitCounter(),
      new TimeButton(),
      new PlayerCounter(),
      new VersionButton(),
      new MapsButton(),
      new StatsButton(),
      new CommandListButton(),
      new SectorsButton(),
      new PayReplay(this.id),
      new PaySkip(this.id),
      new VoteReplay(this.id),
      new VoteSkip(this.id)
    ]
    for (const e of config.order) {
      const b = allButtons.find(a => a.constructor.name === e)
      if (b === undefined) { throw new Error(`Can't find button named ${e}`) }
      this.buttons.push(b)
    }
    UiButton.onUpdate(() => {
      this.constructXml()
      this.display()
    })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    this.constructXml()
    tm.sendManialink(this.xml)
  }


  displayToPlayer(login: string): void {
    if (this.isDisplayed === false) { return }
    tm.sendManialink(this.xml, login)
  }


  private constructXml(): void {
    const arr: GridCellFunction[] = []
    for (const e of this.buttons) {
      const data = e.buttonData
      arr.push((i, j, w, h) =>
        constuctButton(data.icon, data.text1, data.text2, w - config.margin,
          h - config.margin, data.iconWidth, data.iconHeight, data.padding, {
          equalTexts: data.equalTexts === true ? true : undefined,
          actionId: data.actionId, link: data.link
        }))
    }
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }


}
