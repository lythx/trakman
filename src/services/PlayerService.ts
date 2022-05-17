import {Client} from '../Client.js'
import {PlayerRepository} from '../database/PlayerRepository.js'
import countries from '../data/Countries.json' assert {type: 'json'}
import {Events} from '../Events.js'
import {ErrorHandler} from '../ErrorHandler.js'
import 'dotenv/config'

export class PlayerService {
  private static _players: Player[] = []
  private static readonly repo = new PlayerRepository()
  private static newOwnerLogin: string | null = null

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    const oldOwnerLogin = (await this.repo.getOwner())?.[0]?.login
    const newOwnerLogin = process.env.SERVER_OWNER_LOGIN
    if (!newOwnerLogin)
      throw Error('Server owner login not specified')
    if (oldOwnerLogin === newOwnerLogin)
      return
    this.newOwnerLogin = newOwnerLogin
    if (oldOwnerLogin)
      await this.repo.removeOwner()
  }

  static get players(): Player[] {
    return this._players
  }

  /**
   * Add all the players in the server into local storage and database
   * Only called in the beginning as a start job
   * @returns {Promise<void>}
   */
  static async addAllFromList(): Promise<void> {
    const playerList = await Client.call('GetPlayerList', [{ int: 250 }, { int: 0 }])
    for (const player of playerList) {
      const detailedPlayerInfo = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      await this.join(player.Login, player.NickName, detailedPlayerInfo[0].Path)
    }
  }

  /**
   * Adds a player into the list and database
   * @param {String} login
   * @param {String} nickName
   * @param {String} path
   * @returns {Promise<void>}
   */
  static async join(login: string, nickName: string, path: string): Promise<void> {
    const nation = path.split('|')[1]
    let nationCode = countries.find(a => a.name === path.split('|')[1])?.code
    if (nationCode == null) {
      nationCode = 'OTH'
      ErrorHandler.error('Error adding player ' + login, 'Nation ' + nation + ' is not in the country list.')
    }
    const playerData = await this.repo.get(login)
    const player = new Player(login, nickName, nation, nationCode)
    if (playerData.length === 0) {
      await this.repo.add(player)
    } else {
      player.wins = Number(playerData[0].wins)
      player.timePlayed = Number(playerData[0].timeplayed)
      player.privilege = Number(playerData[0].privilege)
      await this.repo.update(player)
    }
    this._players.push(player)
    if (player.login === this.newOwnerLogin && this.newOwnerLogin !== null) {
      this.setPrivilege(player.login, 4)
      this.newOwnerLogin = null
    }
  }

  /**
   * Remove the player
   * @param login
   * @returns {Promise<void>}
   */
  static async leave(login: string): Promise<void> {
    const player = this._players.find(p => p.login === login)
    if (player == null) {
      throw new Error('Player ' + login + ' not in player list.')
    }
    const sessionTime = Date.now() - player.joinTimestamp
    const totalTimePlayed = sessionTime + player.timePlayed
    // Do this instead of waiting for tm callback to prevent accessing database
    Events.emitEvent('Controller.PlayerLeave',
      [{
        login: player.login,
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        wins: player.wins,
        sessionTime,
        totalTimePlayed,
        joinTimestamp: player.joinTimestamp,
        privilege: player.privilege
      }]
    )
    await this.repo.setTimePlayed(player.login, totalTimePlayed)
    this._players = this._players.filter(p => p.login !== player.login)
  }

  static async fetchPlayer(login: string): Promise<any[]> {
    return await this.repo.get(login)
  }

  static async setPrivilege(login: string, privilege: number): Promise<void> {
    await this.repo.setPrivilege(login, privilege)
    const player = this.players.find(a => a.login === login)
    if (player)
      player.privilege = privilege
  }
}

export class Player {
  private readonly _login
  private readonly _nickName
  private readonly _nation
  private readonly _nationCode
  public wins = 0
  public timePlayed = 0
  private readonly _joinTimestamp: number
  public privilege

  constructor(login: string, nickName: string, nation: string, nationCode: string, privilege: number = 0) {
    this._login = login
    this._nickName = nickName
    this._nation = nation
    this._nationCode = nationCode
    this._joinTimestamp = Date.now()
    this.privilege = privilege
  }

  get login(): string {
    return this._login
  }

  get nickName(): string {
    return this._nickName
  }

  get nation(): string {
    return this._nation
  }

  get nationCode(): string {
    return this._nationCode
  }

  get joinTimestamp(): number {
    return this._joinTimestamp
  }
}
