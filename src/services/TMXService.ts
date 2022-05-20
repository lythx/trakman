'use strict'
import fetch from "node-fetch";


export abstract class TMXService {

    private static _current: TMXTrackInfo
    private static prefixes = {
        TMNF: 'tmnforever',
        TMUF: 'united',
        TMN: 'nations',
        TMO: 'original',
        TMS: 'sunrise'
    }

    static get current () {
        return this._current
    }

    static async fetchTrack(trackId: string, game: string = 'TMNF') {
        const prefix: string =(this.prefixes as any)[game]
        const res = await fetch(`https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${trackId}`)
        const data = await res.text()
        const s = data.split('\t')
        const id = Number(s[0])
        const replaysRes = await fetch(`https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=${id}`)
        const replaysData = (await replaysRes.text()).split('\r\n')
        replaysData.pop()
        const replays: TMXReplay[] = []
        for (const r of replaysData) {
            const rs = r.split('\t')
            replays.push({
                id: Number(rs[0]),
                userId: Number(rs[1]),
                name: rs[2],
                time: Number(rs[3]),
                recordDate: new Date(rs[4]),
                trackDate: new Date(rs[5]),
                approved: rs[6],
                leaderboardScore: Number(rs[7]),
                expires: rs[8],
                lockspan: rs[9],
                url: `https://${prefix}.tm-exchange.com/recordgbx/${rs[0]}`
            })
        }
        this._current = {
            id,
            name: s[1],
            authorId: Number(s[2]),
            author: s[3],
            uploadDate: new Date(s[4]),
            lastUpdateDate: new Date(s[5]),
            type: s[7],
            environment: s[8],
            mood: s[9],
            style: s[10],
            routes: s[11],
            length: s[12],
            difficulty: s[13],
            leaderboardRating: Number(s[14]),
            game: s[15],
            comment: s[16],
            commentsAmount: Number(s[17]),
            awards: Number(s[18].split('<BR>')[0]),
            pageUrl: `https://${prefix}.tm-exchange.com/trackshow/${id}`,
            screenshotUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreen&id=${id}`,
            thumbnailUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreensmall&id=${id}`,
            downloadUrl: `https://${prefix}.tm-exchange.com/trackgbx/${id}`,
            replays
        }
        return this._current
    }
}


