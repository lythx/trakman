import fetch from 'node-fetch'
import xml2js from 'xml2js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { MapService } from './MapService.js'
import { ServerConfig } from '../ServerConfig.js'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { VoteService } from './VoteService.js'

export abstract class ManiakarmaService {

  private static authCode: string
  private static apiUrl: string
  private static _mapKarmaValue: number = 0
  private static _mapKarma: MKMapVotes = { fantastic: 0, beautiful: 0, good: 0, bad: 0, poor: 0, waste: 0 }
  private static _playerVotes: MKVote[] = []
  private static _newVotes: MKVote[] = []

  static async initialize(): Promise<void | Error> {
    const status: void | Error = await this.authenticate()
    if (status instanceof Error) {
      ErrorHandler.fatal(`Couldn't connect to Maniakarma`)
    }
    for (const player of PlayerService.players) {
      await this.receiveVotes(player.login)
    }
    Events.addListener('Controller.PlayerJoin', async (info: JoinInfo): Promise<void> => {
      await this.receiveVotes(info.login)
    })
    Events.addListener('Controller.BeginMap', async (): Promise<void> => {
      for (const player of PlayerService.players) {
        await this.receiveVotes(player.login)
      }
      Events.emitEvent('Controller.ManiakarmaVotes', { votes: this._mapKarma, karma: this._mapKarmaValue })
    })
    Events.addListener('Controller.EndMap', async (): Promise<void> => {
      await this.sendVotes()
    })
  }

  private static async authenticate(): Promise<void | Error> {
    const url: string = `http://worldwide.mania-karma.com/api/tmforever-trackmania-v4.php`
      + `?Action=Auth`
      + `&login=${process.env.SERVER_LOGIN}`
      + `&name=${Buffer.from(ServerConfig.config.name).toString('base64')}`
      + `&game=${ServerConfig.config.game}`
      + `&zone=${ServerConfig.config.zone}`
      + `&nation=${process.env.SERVER_NATION}`
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      ErrorHandler.error(res.message)
      return
    }
    const json: any = this.getJson(await res.text())
    this.authCode = json?.result?.authcode[0]
    this.apiUrl = json?.result?.api_url[0]
  }

  private static async receiveVotes(playerLogin: string): Promise<void | Error> {
    this._newVotes.length = 0
    this._playerVotes.length = 0
    const url: string = `${this.apiUrl}`
      + `?Action=Get`
      + `&login=${process.env.SERVER_LOGIN}`
      + `&authcode=${this.authCode}`
      + `&uid=${MapService.current.id}`
      + `&map=${Buffer.from(MapService.current.name).toString('base64')}`
      + `&author=${MapService.current.author}`
      + `&env=${MapService.current.environment}`
      + `&player=${playerLogin}`
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      ErrorHandler.error(res.message)
      return
    }
    const json: any = this.getJson(await res.text())
    this._mapKarmaValue = json?.result?.votes?.[0]?.karma?.[0]
    for (const key of Object.keys(this._mapKarma)) {
      (this._mapKarma as any)[key] = Number(json?.result?.votes?.[0]?.[key]?.[0]?.$?.count)
    }
    const vote = Number(json?.result?.players[0]?.player[0]?.$?.vote)
    if (![-3, -2, -1, 1, 2, 3].includes(vote)) {
      return
    }
    this.storePlayerVotes((json?.result?.players[0]?.player[0]?.$?.login).toString(), vote as any)
    this.fixCoherence()
  }

  private static async sendVotes(): Promise<void | Error> {
    const url: string = `${this.apiUrl}`
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
      + `&votes=${this.getVoteString()}`
      + `&tmx=` // LEFTOVER FROM TM2
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      ErrorHandler.error(res.message)
      return
    }
  }

  private static storePlayerVotes(login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): void {
    this._playerVotes.push({
      mapId: MapService.current.id,
      login: login,
      vote: vote
    })
  }

  private static getVoteString(): string {
    let voteString: string[] = []
    const count: any = {}
    for (const player of this._newVotes) {
      count[player.login] = (count[player.login] || 0) + 1
    }
    const newVotesCopy: MKVote[] = this._newVotes.filter(a => count[a.login]-- === 1)
    for (const vote of newVotesCopy) {
      voteString.push(vote.login + `=` + vote.vote)
    }
    return voteString.join('|')
  }

  private static getJson(data: string): any {
    let json: any
    xml2js.parseString(data.toString(), (err, result): void => {
      if (err !== null) {
        throw err
      }
      json = result
    })
    return json
  }

  static addVote(mapId: string, login: string, vote: -3 | -2 | -1 | 1 | 2 | 3) {
    const v: MKVote = { mapId: mapId, login: login, vote: vote }
    this._newVotes.push(v)
    const prevVote = this._playerVotes.find(a => a.login === login && a.mapId === mapId)
    const voteNames = ['waste', 'poor', 'bad', 'good', 'beautiful', 'fantastic'];
    (this._mapKarma as any)[voteNames[vote > 0 ? vote + 2 : vote + 3]]++
    if (prevVote === undefined) {
      this._playerVotes.push(v)
    } else {
      (this._mapKarma as any)[voteNames[prevVote.vote > 0 ? prevVote.vote + 2 : prevVote.vote + 3]]--
      prevVote.vote = vote
    }
    const voteValues = { waste: 0, poor: 20, bad: 40, good: 60, beautiful: 80, fantastic: 100 }
    const count = Object.values(this._mapKarma).reduce((acc, cur) => acc + cur)
    this._mapKarmaValue = Object.entries(this._mapKarma).map(a => (voteValues as any)[a[0]] * a[1]).reduce((acc, cur) => acc + cur) / count
  }

  private static fixCoherence() {
    const localVotes = VoteService.votes.filter(a => a.mapId === MapService.current.id)
    const mkVotes = this._playerVotes
    for (const e of mkVotes) {
      if (!localVotes.some(a => a.login === e.login && a.vote === e.vote)) {
        VoteService.add(e.mapId, e.login, e.vote)
      }
    }
    for (const e of localVotes) {
      if (!mkVotes.some(a => a.login === e.login && a.vote === e.vote)) {
        this.addVote(e.mapId, e.login, e.vote)
      }
    }
  }

  static get playerVotes(): MKVote[] {
    return [...this._playerVotes]
  }

  static get newVotes(): MKVote[] {
    return [...this._newVotes]
  }

  static get mapKarma(): { fantastic: number, beautiful: number, good: number, bad: number, poor: number, waste: number } {
    return { ...this._mapKarma }
  }

  static get mapKarmaValue(): number {
    return this._mapKarmaValue
  }

}