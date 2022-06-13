import { Events } from "../../../src/Events.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import DynamicComponent from "./DynamicComponent.js";
import fs from 'node:fs/promises'
import CFG from "../UIConfig.json" assert {type: "json"}

export default class TestWindow extends DynamicComponent {

    readonly openId: number
    readonly closeId: number
    private readonly windowh: number = 80.4
    private readonly windowv: number = 55.7
    private readonly titleHeight: number = 2.1 * 2

    constructor(openId: number, closeId: number) {
        super(openId)
        this.openId = openId
        this.closeId = closeId;
        Events.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
            if (Number(info.answer) === this.openId) { this.displayToPlayer(info.login) }
            else if (Number(info.answer) === this.closeId) { this.closeToPlayer(info.login) }
        })
    }

    async displayToPlayer(login: string): Promise<void> {
        const file = await fs.readFile('./plugins/ui/dynamic_components/test.xml')
        TM.sendManialink(file.toString(), login)
    }

}