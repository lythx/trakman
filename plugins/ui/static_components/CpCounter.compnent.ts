

import StaticComponent from '../StaticComponent.js'
import { CONFIG, IDS, centeredText } from '../UiUtils.js'
import { TRAKMAN as TM } from '../../../src/Trakman.js'

export default class CpCounter extends StaticComponent {

    private readonly bg = CONFIG.static.bgColor
    private readonly width = CONFIG.cpCounter.width
    private readonly height = CONFIG.cpCounter.height
    private readonly posX = 0
    private readonly posY = 0


    constructor() {
        super(IDS.cpCounter, { displayOnRace: true, hideOnResult: true })
        TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
            this.displayToPlayer(info.player.login, info.index + 1)
        })
    }

    display(): void {
        this._isDisplayed = true

        TM.sendManialink(`
    <manialink id="${this.id}">
        <frame posn="${this.posX} ${this.posY} 1">
            <quad posn="0 0 1" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
        </frame>
    </manialink>`)
    }

    displayToPlayer(login: string, params?: any): void | Promise<void> {
        TM.sendManialink(`
        <manialink id="${this.id}">
            <frame posn="${this.posX} ${this.posY} 1">
            ${centeredText(params ?? '0', this.width, this.height, { textScale: 1.5 })}
                <quad posn="0 0 1" sizen="${this.width} ${this.height}" bgcolor="${this.bg}"/>
            </frame>
        </manialink>`, login)
    }
}