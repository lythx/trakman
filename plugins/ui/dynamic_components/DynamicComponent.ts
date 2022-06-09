import IDynamicComponent from "./DynamicComponent.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js"

export default abstract class DynamicComponent implements IDynamicComponent {

    protected readonly _displayedToPlayers: string[] = []
    readonly id: number

    constructor(id: number) {
        this.id = id
    }

    get displayedToPlayers(): string[] {
        return this._displayedToPlayers
    }

    displayToPlayer(login: string): void {
        this._displayedToPlayers.push(login)
        TM.sendManialink(
            `<label posn="0 0 0" sizen="100 0" 
             halign="center" textsize="5" text="displayToPlayer method for manialink id ${this.id} not implemented"/> 
            <format textsize="5" textcolor="F00F"/>
            `,
            login)
    }

    closeToPlayer(login: string): void {
        this._displayedToPlayers.splice(this._displayedToPlayers.indexOf(login), 1)
        TM.sendManialink(`<manialink id="${this.id}"></manialink>`, login)
    }

}