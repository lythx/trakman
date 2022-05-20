'use strict'
import fetch from "node-fetch";

export abstract class TMXService {

    static async fetchTrack(trackId: string) {
        const res = await fetch(`https://tmnforever.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${trackId}`)
        const data = await res.text()
        const split = data.split("\\t")

    }
}


