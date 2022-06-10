import { Events } from "../../../src/Events.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import IPopupWindow from "./PopupWindow.interface.js";
import CFG from "../UIConfig.json" assert {type: "json"}
import fs from 'node:fs'

export default abstract class PopupWindow extends DynamicComponent implements IPopupWindow {

    readonly openId: number
    readonly closeId: number
    private readonly frameTop: string
    private readonly frameBottom: string

    constructor(openId: number, closeId: number) {
        super(openId)
        this.openId = openId
        this.closeId = closeId;
        [this.frameTop, this.frameBottom] = this.constructFrame()
        Events.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
            if (Number(info.answer) === this.openId) { this.displayToPlayer(info.login) }
            else if (Number(info.answer) === this.closeId) { this.closeToPlayer(info.login) }
        })
    }

    private constructFrame(): string[] {
        const windowh = 80.4
        const windowv = 55.7
        const titleHeight = 2.1 * 2

        return [ // TODO window frame code. The first element in array is very top of manialink, 2nd is bottom
            `<manialink id="${this.id}">
            <frame posn="-40.1 30.45 10">
             <quad posn="-0.2 0.2 0.02" sizen="${windowh} ${windowv}" style="${CFG.widgetStyleRace.bgStyle}" substyle="${CFG.widgetStyleRace.bgSubStyle}"/>
            </frame>

            <frame posn="-39.9 30.09 11">
             <quad posn="0 0 0" sizen="${windowh - 0.8} ${titleHeight}" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>
             <quad posn="2.5 -${titleHeight / 2} 0.04" sizen="3.5 3.5" halign="center" valign="center" style="Icons64x64_1" substyle="TV"/>
             <label posn="${(windowh - 0.8) / 2} -${titleHeight / 2} 0.04" sizen="${windowh} ${windowv}" halign="center" valign="center" textsize="3" text="$STITLE_HERE_MAN_XD"/>
            </frame>

            <frame posn="-39.9 25.35 11">
             <quad posn="0 0 0" sizen="${windowh - 0.8} 45.5" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>
             <frame posn="1 -1.5 0.02">
              <quad posn="0 0 0.01" sizen="15.5 10" action="58329582" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
             </frame>
            </frame>

            <frame posn="-39.9 -20.3 11">
             <quad posn="0 0 0" sizen="${windowh - 0.8} ${titleHeight}" style="${CFG.widgetStyleRace.titleStyle}" substyle="${CFG.widgetStyleRace.titleSubStyle}"/>
             <quad posn="${(windowh - 0.8) / 2 - 0.2} -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" style="Icons64x64_1" substyle="Close"/>
            </frame>`,
            `</manialink>`
        ]
    }

    constructContent(login: string): string {
        const xml = // TODO Change that after window is implemented
            `<label posn="0 0 0" sizen="100 0" 
             halign="center" textsize="5" text="constructContent method for popup window id ${this.id} not implemented"/> 
            <format textsize="5" textcolor="F00F"/>`
        return xml
    }

    displayToPlayer(login: string): void {
        const content = this.constructContent(login)
        TM.sendManialink(`${this.frameTop}${content}${this.frameBottom}`, login)
    }

}