import fetch from 'node-fetch'
import xml2js from 'xml2js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { MapService } from './MapService.js'
import { ServerConfig } from '../ServerConfig.js'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'

export abstract class ManiakarmaService {

    private static authCode: string
    private static apiUrl: string
    static _mapKarmaValue: number = 0
    static _mapKarma = { fantastic: 0, beautiful: 0, good: 0, bad: 0, poor: 0, waste: 0 }
    static _playerVotes: TMVote[] = []
    static _newVotes: TMVote[] = []

    static async initialize(): Promise<void | Error> {
        const status: void | Error = await this.authenticate()
        if (status instanceof Error) {
            ErrorHandler.fatal(`Couldn't connect to Maniakarma`)
        }
        Events.addListener('Controller.PlayerJoin', async (info: JoinInfo): Promise<void> => {
            await this.receiveVotes(info.login)
        })
        Events.addListener('Controller.BeginMap', async (): Promise<void> => {
            for (const player of PlayerService.players) {
                await this.receiveVotes(player.login)
            }
        })
        Events.addListener('Controller.EndMap', async (): Promise<void> => {
            await this.sendVotes()
        })
    }


    static async authenticate(): Promise<void | Error> {
        const link: string = `http://worldwide.mania-karma.com/api/tmforever-trackmania-v4.php`
            + `?Action=Auth`
            + `&login=${process.env.SERVER_LOGIN}`
            + `&name=${Buffer.from(ServerConfig.config.name).toString('base64')}`
            + `&game=TmForever`
            + `&zone=Poland%7CMalopolskie`
            + `&nation=${process.env.SERVER_NATION}`
        const res = await fetch(link).catch((err: Error) => err)
        if (res instanceof Error) {
            ErrorHandler.error(res.message)
            return
        }
        const json: any = this.getJson(await res.text())
        this.authCode = json?.result?.authcode[0]
        this.apiUrl = json?.result?.api_url[0]
    }

    static async receiveVotes(playerLogin: string): Promise<void | Error> {
        this._newVotes.length = 0
        this._playerVotes.length = 0
        const link: string = `${this.apiUrl}`
            + `?Action=Get`
            + `&login=${process.env.SERVER_LOGIN}`
            + `&authcode=${this.authCode}`
            + `&uid=${MapService.current.id}`
            + `&map=${Buffer.from(MapService.current.name).toString('base64')}`
            + `&author=${MapService.current.author}`
            + `&env=${MapService.current.environment}`
            + `&player=${playerLogin}`
        const res = await fetch(link).catch((err: Error) => err)
        if (res instanceof Error) {
            ErrorHandler.error(res.message)
            return
        }
        const json: any = this.getJson(await res.text())
        this._mapKarmaValue = json?.result?.votes[0]?.karma[0]
        for (const key of Object.keys(this._mapKarma)) {
            (this._mapKarma as any)[key] = json?.result?.votes[0]?.[key][0]?.$?.count
        }
        this.storePlayerVotes((json?.result?.players[0]?.player[0]?.$?.login).toString(), Number(json?.result?.players[0]?.player[0]?.$?.vote))
    }

    static async sendVotes(): Promise<void | Error> {
        const link: string = `${this.apiUrl}`
            + `?Action=Vote`
            + `&login=${process.env.SERVER_LOGIN}`
            + `&authcode=${this.authCode}`
            + `&uid=${MapService.current.id}`
            + `&map=${Buffer.from(MapService.current.name).toString('base64')}`
            + `&author=${MapService.current.author}`
            + `&atime=${MapService.current.authorTime}`
            + `&ascore=0` // TODO STUNTS MODE IDC
            + `&nblaps=${MapService.current.lapsAmount}`
            + `&nbchecks=${MapService.current.checkpointsAmount}`
            + `&mood=${MapService.current.mood}`
            + `&env=${MapService.current.environment}`
            + `&votes=${this.getVoteString().join('|')}`
            + `&tmx=` // LEFTOVER FROM TM2
        const res = await fetch(link).catch((err: Error) => err)
        if (res instanceof Error) {
            ErrorHandler.error(res.message)
            return
        }
    }

    static storePlayerVotes(login: string, vote: number): void {
        this._playerVotes.push({
            mapId: MapService.current.id,
            login: login,
            vote: vote,
            date: new Date(0)
        })
    }

    static getVoteString(): string[] {
        let voteString: string[] = []
        for (const vote of this._newVotes) {
            voteString.push(vote.login + `=` + vote.vote)
        }
        return voteString
    }

    static getJson(data: string): any {
        let json: any
        xml2js.parseString(data.toString(), (err, result): void => {
            if (err != null) {
                throw err
            }
            json = result
        })
        return json
    }

    static get playerVotes(): TMVote[] {
        return [...this._playerVotes]
    }

    static get newVotes(): TMVote[] {
        return [...this._newVotes]
    }

    static get mapKarma() {
        return this._mapKarma
    }

    static get mapKarmaValue(): number {
        return this._mapKarmaValue
    }
}