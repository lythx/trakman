import { componentIds, Grid, type GridCellFunction, staticButton, StaticComponent } from '../../../UI.js'
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
import { MedalButton } from "./MedalButton.js";
import { FavouriteButton } from "./FavouriteButton.js";
import config from './ButtonsWidget.config.js'

export default class ButtonsWidget extends StaticComponent {

  private readonly width: number = config.width
  private readonly height: number = config.height
  private readonly grid: Grid
  private readonly buttons: UiButton[] = []
  private xml: string = ''

  constructor() {
    super(componentIds.buttons)
    this.grid = new Grid(this.width + config.margin, this.height + config.margin, new Array(config.columns).fill(1),
      new Array(config.rows).fill(1))
    const allButtons = [new VisitCounter(), new TimeButton(), new PlayerCounter(), new VersionButton(),
      new MapsButton(), new StatsButton(), new CommandListButton(), new SectorsButton(), new FavouriteButton(),
      new PayReplay(this.id), new PaySkip(this.id), new VoteReplay(this.id), new VoteSkip(this.id), new MedalButton()]
    for (const e of config.order) {
      const b = allButtons.find(a => a.constructor.name === e)
      if (b === undefined) {
        throw new Error(`Can't find button named ${e}`)
      }
      this.buttons.push(b)
    }
    const perPlayerButtonExists = this.buttons.some(b => b.buttonData.perPlayer)
    // Use per-player dedicated server calls only if necessary to improve performance
    if (perPlayerButtonExists) {
      UiButton.onUpdate(() => {
        let calls = []
        if (this.isDisplayed) {
          for (const player of tm.players.list) {
            calls.push({
              method: 'SendDisplayManialinkPageToLogin',
              params: [{ string: player.login }, { string: this.constructXml(player.login) }, { int: 0 },
                { boolean: false }]
            })
          }

          if (calls.length > 0) {
            tm.client.call('system.multicall', calls)
          }
        }
      })
      this.onPanelHide((player) => { // todo: this does not work properly due to button update
        this.sendMultipleManialinks(this.displayToPlayer(player.login))
      })
    } else {
      UiButton.onUpdate(() => {
        const xml = this.display()
        if (xml !== undefined) {
          tm.sendManialink(xml)
        }
      })
    }

  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    return this.constructXml()
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    if (config.hidePanel && this.hasPanelsHidden(login)) {
      return this.hideToPlayer(login)
    }
    return {
      xml: this.xml,
      login
    }
  }

  private constructXml(login?: string): string {
    const arr: GridCellFunction[] = []
    for (const e of this.buttons) {
      const data = e.buttonData
      if (e.buttonData.perPlayer) {
        arr.push((i, j, w, h) => e.renderForPlayer(login ?? "", i, j, w, h))
      } else {
        arr.push((i, j, w, h) => staticButton(data.icon, data.text1, data.text2, w - config.margin, h - config.margin, {
          iconWidth: data.iconWidth,
          iconHeight: data.iconHeight,
          topPadding: data.padding,
          equalTexts: data.equalTexts === true ? true : undefined,
          actionId: data.actionId,
          link: data.link
        }))
      }
    }
    return `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        ${this.grid.constructXml(arr)}
      </frame>
    </manialink>`
  }

}
