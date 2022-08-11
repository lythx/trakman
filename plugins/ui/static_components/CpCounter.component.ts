

import StaticComponent from '../StaticComponent.js'
import { CONFIG, IDS, centeredText, getStaticPosition } from '../UiUtils.js'
import { trakman as tm } from '../../../src/Trakman.js'

export default class CpCounter extends StaticComponent {

    private readonly bg = CONFIG.static.bgColor
    private readonly width = CONFIG.cpCounter.width
    private readonly height = CONFIG.cpCounter.height
    private readonly posX = CONFIG.static.leftPosition + CONFIG.marginBig + CONFIG.static.width
    private readonly posY: number

    constructor() {
        super(IDS.cpCounter, 'race')
        const pos = getStaticPosition('rank')
        this.posY = pos.y
        tm.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
            this.displayToPlayer(info.player.login, info.index + 1)
        })
        tm.addListener('TrackMania.PlayerFinish', (params: any[]) => {
            if (params[2] === 0) {
                this.displayToPlayer(params[1], '0')
            }
        }, true)
    }

    display(): void {
        if (this.isDisplayed === false) { return }
        const cps = tm.maps.current.checkpointsAmount - 1
        let xml: string = ''

        if (cps === 0) {
            xml += centeredText(`${tm.utils.palette.tmGreen}No CPs`, this.width, this.height, { yOffset: 1 })
        } else {
            xml += centeredText('0' + '/' + cps.toString(), this.width, this.height, { yOffset: 1 })
        }

        tm.sendManialink(`
    <manialink id="${this.id}">
        <frame posn="${this.posX} ${this.posY} 1">
        ${centeredText('CPS', this.width, this.height, { yOffset: -1.5 })}
        ${xml}
            <quad posn="0 0 1" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
        </frame>
    </manialink>`)
    }

    displayToPlayer(login: string, params?: any): void | Promise<void> {
        if (this.isDisplayed === false) { return }

        const cps = tm.maps.current.checkpointsAmount - 1
        let xml: string = ''

        if (cps === 0) {
            xml += centeredText(`${tm.utils.palette.tmGreen}No CPs`, this.width, this.height, { yOffset: 1 })
        } else if (params === cps) {
            xml += centeredText(tm.utils.palette.tmGreen + params + '/' + cps, this.width, this.height, { yOffset: 1 })
        } else {
            xml += centeredText('0' + '/' + cps.toString(), this.width, this.height, { yOffset: 1 })
        }

        tm.sendManialink(`
        <manialink id="${this.id}">
            <frame posn="${this.posX} ${this.posY} 1">
            ${centeredText('CPS', this.width, this.height, { yOffset: -1.5 })}
            ${xml}
                <quad posn="0 0 1" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
            </frame>
        </manialink>`, login)
    }
}