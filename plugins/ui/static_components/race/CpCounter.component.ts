

import StaticComponent from '../../StaticComponent.js'
import { IDS, centeredText, verticallyCenteredText, rightAlignedText } from '../../UiUtils.js'
import { trakman as tm } from '../../../../src/Trakman.js'
import config from './CpCounter.config.js'

export default class CpCounter extends StaticComponent {

  constructor() {
    super(IDS.cpCounter, 'race')
    tm.addListener('PlayerCheckpoint', (info) => {
      this.displayToPlayer(info.player.login, info.index + 1)
    })
    tm.addListener('TrackMania.PlayerFinish', (params: [any, any, number]) => {
      if (params[2] === 0) {
        this.displayToPlayer(params[1], 0)
      }
    }, true)
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    const cps = tm.maps.current.checkpointsAmount - 1
    let xml: string = ''

    if (cps === 0) {
      xml += centeredText(`${tm.utils.palette.tmGreen}No CPs`, config.width, config.height)
    } else {
      xml += rightAlignedText('0' + '/' + cps.toString(), config.width, config.height)
    }

    tm.sendManialink(`
    <manialink id="${this.id}">
        <frame posn="12 -40 1">
        ${verticallyCenteredText('CPS', config.width, config.height)}
        ${xml}
            <quad posn="0 0 1" sizen="${config.width} ${config.height}" bgcolor="${config.background}"/>
        </frame>
    </manialink>`)
  }

  displayToPlayer(login: string, params?: number): void | Promise<void> {
    if (this.isDisplayed === false) { return }

    const cps = tm.maps.current.checkpointsAmount - 1
    let xml: string = ''

    if (cps === 0) {
      xml += centeredText(`${tm.utils.palette.tmGreen}No CPs`, config.width, config.height)
    } else if (params === cps) {
      xml += rightAlignedText(tm.utils.palette.tmGreen + params + '/' + cps, config.width, config.height)
    } else {
      xml += rightAlignedText(params + '/' + cps.toString(), config.width, config.height)
    }

    tm.sendManialink(`
        <manialink id="${this.id}">
            <frame posn="${config.posX} ${config.posY} 4">
            ${verticallyCenteredText(config.text, config.width, config.height)}
            ${xml}
                <quad posn="0 0 4" sizen="${config.width} ${config.height}" bgcolor="${config.background}"/>
            </frame>
        </manialink>`, login)
  }
}