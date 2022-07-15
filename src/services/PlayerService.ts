import { Client } from '../client/Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import countries from '../data/Countries.json' assert {type: 'json'}
import { Events } from '../Events.js'
import { ErrorHandler } from '../ErrorHandler.js'
import 'dotenv/config'
import { MapService } from './MapService.js'
import { GameService } from './GameService.js'
import { RecordService } from './RecordService.js'

export class PlayerService {
  private static _players: TMPlayer[] = []
  private static repo: PlayerRepository
  private static newOwnerLogin: string | null

  static async initialize(repo: PlayerRepository = new PlayerRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
    const oldOwnerLogin: string = (await this.repo.getOwner())?.[0]?.login
    const newOwnerLogin: string | undefined = process.env.SERVER_OWNER_LOGIN
    if (newOwnerLogin === undefined || newOwnerLogin === '') { throw Error('Server owner login not specified') }
    if (oldOwnerLogin === newOwnerLogin) { return }
    this.newOwnerLogin = newOwnerLogin
    if (oldOwnerLogin !== undefined) { await this.repo.removeOwner() }
    await this.addAllFromList()
  }

  static getPlayer(login: string): TMPlayer | undefined {
    return this._players.find(p => p.login === login)
  }

  static get players(): TMPlayer[] {
    return this._players
  }

  /**
   * Add all the players in the server into local storage and database
   * Only called in the beginning as a start job
   * @returns {Promise<void>}
   */
  static async addAllFromList(): Promise<void> {
    const playerList: any[] | Error = await Client.call('GetPlayerList', [{ int: 250 }, { int: 0 }])
    if (playerList instanceof Error) {
      ErrorHandler.error('Error when fetching players from the server', playerList.message)
      return
    }
    for (const player of playerList) {
      const detailedPlayerInfo: any[] | Error = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      if (detailedPlayerInfo instanceof Error) {
        ErrorHandler.error(`Error when fetching player ${player.Login} information from the server`, detailedPlayerInfo.message)
        return
      }
      await this.join(player.Login, player.NickName, detailedPlayerInfo[0].Path, detailedPlayerInfo[0].IsSpectator,
        detailedPlayerInfo[0].PlayerId, detailedPlayerInfo[0].IPAddress.split(':')[0], detailedPlayerInfo[0].OnlineRights === 3)
    }
  }

  /**
   * Adds a player into the list and database
   * @param {String} login
   * @param {String} nickName
   * @param {String} path
   * @returns {Promise<void>}
   */
  static async join(login: string, nickName: string, path: string, isSpectator: boolean, playerId: number, ip: string, isUnited: boolean): Promise<void> {
    const nation: string = path.split('|')[1]
    let nationCode: string | undefined = countries.find(a => a.name === path.split('|')[1])?.code
    if (nationCode === undefined) {
      nationCode = 'OTH'
      ErrorHandler.error('Error adding player ' + login, 'Nation ' + nation + ' is not in the country list.')
    }
    const playerData: any = (await this.repo.get(login))?.[0]
    let player: TMPlayer
    if (playerData === undefined) {
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
        privilege: 0,
        isSpectator,
        playerId,
        ip,
        region: path,
        isUnited
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
        privilege: Number(playerData.privilege),
        isSpectator,
        playerId,
        ip,
        region: path,
        isUnited
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
  static async leave(login: string): Promise<void> {
    const player: TMPlayer | undefined = this.getPlayer(login)
    if (player === undefined) {
      return
    }
    const sessionTime: number = Date.now() - player.joinTimestamp
    const totalTimePlayed: number = sessionTime + player.timePlayed
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
      visits: player.visits,
      playerId: player.playerId,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited
    }
    Events.emitEvent('Controller.PlayerLeave', leaveInfo)
    await this.repo.setTimePlayed(player.login, totalTimePlayed)
    this._players = this._players.filter(p => p.login !== player.login)
  }

  static async fetchPlayer(login: string): Promise<DBPlayerInfo | undefined> {
    const res: any = (await this.repo.get(login))?.[0]
    if (res === undefined) { return undefined }
    const nation: string | undefined = countries.find(a => a.code === res.nation)?.name
    if (nation === undefined) { throw new Error(`Cant find country ${JSON.stringify(res)}`) }
    return {
      login: res.login,
      nickName: res.nickname,
      nationCode: res.nation,
      nation,
      timePlayed: res.timeplayed,
      privilege: res.privilege,
      wins: res.wins,
      visits: res.visits
    }
  }

  static async setPrivilege(login: string, privilege: number): Promise<void> {
    await this.repo.setPrivilege(login, privilege)
    const player: TMPlayer | undefined = this.players.find(a => a.login === login)
    if (player !== undefined) { player.privilege = privilege }
  }

  /**
   * Add a checkpoint time to the player object.
   * @param {string} login
   * @param {TMCheckpoint} cp
   * @return {Promise<void>}
   */
  static addCP(login: string, cp: TMCheckpoint): boolean {
    const player: TMPlayer | undefined = this.getPlayer(login)
    if (player === undefined) {
      return false
    }
    let laps
    if (GameService.game.gameMode === 1 || !MapService.current.lapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else {
      laps = MapService.current.lapsAmount
    }
    if (cp.index === 0) {
      player.checkpoints.unshift(cp)
      player.checkpoints.length = 1
      if (laps === 1 && MapService.current.checkpointsAmount === 1) {
        player.checkpoints.length = 0
        RecordService.add(MapService.current.id, login, cp.time)
        return true
      }
      return false
    }
    if (player.checkpoints.length === 0) { return false }
    const correctLap: number = player.checkpoints[0].lap + laps
    if (cp.lap < correctLap) {
      player.checkpoints.push(cp)
      return false
    } else {
      RecordService.add(MapService.current.id, login, cp.time)
      return true
    }
  }

  static setPlayerSpectatorStatus(login: string, status: boolean): boolean {
    const player: TMPlayer | undefined = this._players.find(a => a.login === login)
    if (player === undefined) { return false }
    player.isSpectator = status
    return true
  }
}
