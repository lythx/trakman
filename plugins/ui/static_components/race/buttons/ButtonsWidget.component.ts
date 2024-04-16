import { componentIds, Grid, staticButton, type GridCellFunction, StaticComponent } from '../../../UI.js'
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
  private readonly buttons: UiButton[] = []
  private xml: string = ''

  constructor() {
    super(componentIds.buttons)
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
      const xml = this.display()
      if(xml !== undefined) {
        tm.sendManialink(xml)
      }
    })
  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    this.constructXml()
    return this.xml
  }


  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }


  private constructXml(): void {
    const arr: GridCellFunction[] = []
    for (const e of this.buttons) {
      const data = e.buttonData
      arr.push((i, j, w, h) =>
        staticButton(data.icon, data.text1, data.text2, w - config.margin,
          h - config.margin, {
          iconWidth: data.iconWidth, iconHeight: data.iconHeight, topPadding: data.padding,
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
