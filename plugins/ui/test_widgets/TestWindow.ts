import { trakman as tm } from "../../../src/Trakman.js";
import fs from 'node:fs/promises'

export default class TestWindow {

    async displayToPlayer(login: string): Promise<void> { //TODO IMPLEMENT COMMAND TO DISPLAY THIS, ALSO CONFIG PROP FOR FILENAME
        const file = await fs.readFile('./plugins/ui/test_widgets/test.xml')
        tm.sendManialink(file.toString(), login)
    }

}