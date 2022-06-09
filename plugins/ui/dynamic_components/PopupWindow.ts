import { Events } from "../../../src/Events.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import IPopupWindow from "./PopupWindow.interface.js";

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
        return [ // TODO window frame code. The first element in array is very top of manialink, 2nd is bottom
            `<manialink id=${this.id}>`,
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