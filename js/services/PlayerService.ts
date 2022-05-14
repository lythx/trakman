import { Client } from '../Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import countries from '../data/Countries.json' assert {type: 'json'}
import { Events } from '../Events.js'

export class PlayerService {
  private static _players: Player[] = []
  private static repo = new PlayerRepository()

  static async initialize() {
    await this.repo.initialize()
  }

  static get players() {
    return this._players
  }

  /**
   * Add all the players in the server into local storage and database
   * Only called in the beginning as a start job
   * @returns {Promise<void>}
   */
  static async addAllFromList() {
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
  static async join(login: string, nickName: string, path: string) {
    const nation = path.split('|')[1]
    let nationCode = countries.find(a => a.name === path.split('|')[1])!.code
    const playerData = await this.repo.get(login)
    const player = new Player(login, nickName, nation, nationCode)
    if (playerData.length === 0) {
      await this.repo.add(player)
    } else {
      player.wins = Number(playerData[0].wins)
      player.timePlayed = Number(playerData[0].timeplayed)
      await this.repo.update(player)
    }
    this._players.push(player)
  }

  /**
   * Remove the player
   * @param login
   * @returns {Promise<void>}
   */
  static async leave(login: string) {
    const player = this._players.find(p => p.login === login)
    if (!player) {
      return Promise.reject('Player ' + login + ' not in player list.')
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
        joinTimestamp: player.joinTimestamp
      }]
    )
    await this.repo.setTimePlayed(player.login, totalTimePlayed)
    this._players = this._players.filter(p => p.login !== player.login)
  }
}

export class Player {
  private readonly _login
  private readonly _nickName
  private readonly _nation
  private readonly _nationCode
  public wins = 0
  public timePlayed = 0
  private readonly _joinTimestamp

  constructor(login: string, nickName: string, nation: string, nationCode: string) {
    this._login = login
    this._nickName = nickName
    this._nation = nation
    this._nationCode = nationCode
    this._joinTimestamp = Date.now()
  }

  get login() {
    return this._login
  }

  get nickName() {
    return this._nickName
  }

  get nation() {
    return this._nation
  }

  get nationCode() {
    return this._nationCode
  }

  get joinTimestamp() {
    return this._joinTimestamp
  }
}
