'use strict'

import { Client } from '../Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import countries from '../data/Countries.json' assert {type: 'json'}
import { Events } from '../Events.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { ChallengeService } from './ChallengeService.js'
import { GameService } from './GameService.js'

export class PlayerService {
  private static _players: TMPlayer[] = []
  private static repo: PlayerRepository
  private static newOwnerLogin: string | null = null

  static async initialize (repo: PlayerRepository = new PlayerRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
    const oldOwnerLogin = (await this.repo.getOwner())?.[0]?.login
    const newOwnerLogin = process.env.SERVER_OWNER_LOGIN
    if (newOwnerLogin === undefined || newOwnerLogin === '') { throw Error('Server owner login not specified') }
    if (oldOwnerLogin === newOwnerLogin) { return }
    this.newOwnerLogin = newOwnerLogin
    if (oldOwnerLogin !== undefined) { await this.repo.removeOwner() }
  }

  static getPlayer (login: string): TMPlayer {
    const player = this._players.find(p => p.login === login)
    if (player == null) {
      throw Error('Player ' + login + ' not in player list.')
    }
    return player
  }

  static get players (): TMPlayer[] {
    return this._players
  }

  /**
   * Add all the players in the server into local storage and database
   * Only called in the beginning as a start job
   * @returns {Promise<void>}
   */
  static async addAllFromList (): Promise<void> {
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
  static async join (login: string, nickName: string, path: string): Promise<void> {
    const nation = path.split('|')[1]
    let nationCode = countries.find(a => a.name === path.split('|')[1])?.code
    if (nationCode == null) {
      nationCode = 'OTH'
      ErrorHandler.error('Error adding player ' + login, 'Nation ' + nation + ' is not in the country list.')
    }
    const playerData = (await this.repo.get(login))?.[0]
    let player: TMPlayer
    if (playerData == null) {
      player = {
        login,
        nickName,
        nation,
        nationCode,
        timePlayed: 0,
        joinTimestamp: Date.now(),
        visits: 1,
        checkpoints: [],
        wins: 0,
        privilege: 0
      }
      await this.repo.add(player)
    } else {
      player = {
        login,
        nickName,
        nation,
        nationCode,
        timePlayed: Number(playerData.timeplayed),
        joinTimestamp: Date.now(),
        visits: Number(playerData.visits + 1 as string),
        checkpoints: [],
        wins: Number(playerData.wins),
        privilege: Number(playerData.privilege)
      }
      await this.repo.update(player)
    }
    this._players.push(player)
    if (player.login === this.newOwnerLogin && this.newOwnerLogin !== null) {
      await this.setPrivilege(player.login, 4)
      this.newOwnerLogin = null
    }
    const joinInfo: JoinInfo = player
    Events.emitEvent('Controller.PlayerJoin', joinInfo)
  }

  /**
   * Remove the player
   * @param {string} login
   * @returns {Promise<void>}
   */
  static async leave (login: string): Promise<void> {
    const player = this.getPlayer(login)
    const sessionTime = Date.now() - player.joinTimestamp
    const totalTimePlayed = sessionTime + player.timePlayed
    const leaveInfo: LeaveInfo = {
      login: player.login,
      nickName: player.nickName,
      nation: player.nation,
      nationCode: player.nationCode,
      timePlayed: totalTimePlayed,
      joinTimestamp: player.joinTimestamp,
      sessionTime,
      wins: player.wins,
      privilege: player.privilege,
      visits: player.visits
    }
    Events.emitEvent('Controller.PlayerLeave', leaveInfo)
    await this.repo.setTimePlayed(player.login, totalTimePlayed)
    this._players = this._players.filter(p => p.login !== player.login)
  }

  static async fetchPlayer (login: string): Promise<DBPlayerInfo | null> {
    const res = (await this.repo.get(login))?.[0]
    if (res == null) { return null }
    const nation = countries.find(a => a.code === res.nation)?.name
    if (nation == null) { throw new Error(`Cant find country ${JSON.stringify(res)}`) }
    return {
      login: res.login,
      nickName: res.nickname,
      nationCode: res.nation,
      nation,
      timePlayed: res.timeplayed,
      privilege: res.privilege,
      wins: res.wins
    }
  }

  static async setPrivilege (login: string, privilege: number): Promise<void> {
    await this.repo.setPrivilege(login, privilege)
    const player = this.players.find(a => a.login === login)
    if (player != null) { player.privilege = privilege }
  }

  /**
   * Add a checkpoint time to the player object.
   * @param {string} login
   * @param {TMCheckpoint} cp
   * @return {Promise<void>}
   */
  static async addCP (login: string, cp: TMCheckpoint): Promise<void> {
    const player = this.getPlayer(login)
    if (cp.index === 0) {
      player.checkpoints.unshift(cp)
      player.checkpoints.length = 1
      return
    }
    let laps
    if (GameService.game.gameMode === 1 || !ChallengeService.current.lapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else {
      laps = ChallengeService.current.lapsAmount
    }
    if (player.checkpoints.length === 0) { return }
    const correctLap = player.checkpoints[0].lap + laps
    if (cp.lap < correctLap || (cp.lap === correctLap && cp.index === ChallengeService.current.checkpointsAmount - 1 )) { player.checkpoints.push(cp) }
  }
}
