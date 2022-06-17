import { TRAKMAN as TM } from "../../../src/Trakman.js";
import fs from 'node:fs/promises'

export default class TestWindow  {

    async displayToPlayer(login: string): Promise<void> {
        const file = await fs.readFile('./plugins/ui/dynamic_components/test.xml')
        TM.sendManialink(file.toString(), login)
    }

}