import { Client } from '../client/Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import countries from '../data/Countries.json' assert { type: 'json' }
import 'dotenv/config'
import { MapService } from './MapService.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'

export class PlayerService {

  private static readonly _players: TMPlayer[] = []
  private static readonly repo: PlayerRepository = new PlayerRepository()
  private static newOwnerLogin: string | null

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    // const oldOwnerLogin: string | undefined = (await this.repo.getOwner())?.login
    // const newOwnerLogin: string | undefined = process.env.SERVER_OWNER_LOGIN
    // if (newOwnerLogin === undefined) {
    //   await Logger.fatal('SERVER_OWNER_LOGIN is undefined. Check your .env file')
    //   return
    // }
    // if (oldOwnerLogin !== newOwnerLogin) {
    //   this.newOwnerLogin = newOwnerLogin
    //   if (oldOwnerLogin !== undefined) { await this.repo.removeOwner() }
    // }
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
   */
  private static async addAllFromList(): Promise<void> {
    const playerList: any[] | Error = await Client.call('GetPlayerList', [{ int: 250 }, { int: 0 }])
    if (playerList instanceof Error) {
      Logger.fatal('Error when fetching players from the server', playerList.message)
      return
    }
    for (const player of playerList) {
      const detailedPlayerInfo: any[] | Error = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      if (detailedPlayerInfo instanceof Error) {
        Logger.fatal(`Error when fetching player ${player.Login} information from the server`, detailedPlayerInfo.message)
        return
      }
      // OnlineRights is 0 for nations and 3 for united ?XD
      await this.join(player.Login, player.NickName, detailedPlayerInfo[0].Path, detailedPlayerInfo[0].IsSpectator,
        detailedPlayerInfo[0].PlayerId, detailedPlayerInfo[0].IPAddress.split(':')[0], detailedPlayerInfo[0].OnlineRights === 3, true)
    }
  }

  /**
   * Adds a player into the list and database
   */
  static async join(login: string, nickName: string, path: string, isSpectator: boolean, playerId: number, ip: string, isUnited: boolean, serverStart?: true): Promise<JoinInfo> {
    const nation: string = path.split('|')[1]
    let nationCode: string | undefined = countries.find(a => a.name === path.split('|')[1])?.code
    if (nationCode === undefined) {
      // need to exit the process here because if someone joins and doesn't get stored in memory other services will throw errors if he does anything
      await Logger.fatal(`Error adding player ${login} to memory, nation ${nation} is not in the country list`)
      let temp: any
      return temp as JoinInfo // Shut up IDE
    }
    const playerData: any = await this.repo.get(login)
    let player: TMPlayer
    if (playerData === undefined) {
      player = {
        login,
        nickname: nickName,
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
      await this.repo.add(player) // need to await so owner privilege gets set after player is added
    } else {
      player = {
        login,
        nickname: nickName,
        nation,
        nationCode,
        timePlayed: Number(playerData.timeplayed),
        joinTimestamp: Date.now(),
        visits: serverStart === true ? Number(playerData.visits) : Number(playerData.visits) + 1, // Prevent adding visits on server start
        checkpoints: [],
        wins: Number(playerData.wins),
        privilege: Number(playerData.privilege),
        isSpectator,
        playerId,
        ip,
        region: path,
        isUnited
      }
      await this.repo.update(player) // need to await so owner privilege gets set after player is added
    }
    this._players.push(player)
    if (player.login === this.newOwnerLogin) {
      void this.setPrivilege(player.login, 4)
      this.newOwnerLogin = null
    }
    if (serverStart === undefined) {
      Logger.info(`${player.isSpectator === true ? 'Spectator' : 'Player'} ${player.login} joined, visits: ${player.visits}, ` +
        `nickname: ${player.nickname}, region: ${player.region}, wins: ${player.wins}, privilege: ${player.privilege}`)
    }
    return player
  }

  /**
   * Remove the player from local memory, save timePlayed in database
   */
  static leave(login: string): LeaveInfo | Error {
    const playerIndex = this._players.findIndex(a => a.login === login)
    if (playerIndex === -1) {
      const errStr = `Error removing player ${login} from memory, player is not in the memory`
      Logger.error(errStr)
      return new Error(errStr)
    }
    const player: TMPlayer | undefined = this._players[playerIndex]
    const sessionTime: number = Date.now() - player.joinTimestamp
    const totalTimePlayed: number = sessionTime + player.timePlayed
    const leaveInfo: LeaveInfo = {
      login: player.login,
      nickname: player.nickname,
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
    void this.repo.setTimePlayed(player.login, totalTimePlayed)
    this._players.splice(playerIndex, 1)
    Logger.info(`Player ${player.login} left after playing for ${Utils.getTimeString(sessionTime)}`)
    return leaveInfo
  }

  static async fetchPlayer(login: string): Promise<PlayersDBEntry | undefined> {
    return await this.repo.get(login)
  }

  static async setPrivilege(login: string, privilege: number, adminLogin?: string): Promise<void> {
    await this.repo.setPrivilege(login, privilege)
    const player: TMPlayer | undefined = this.players.find(a => a.login === login)
    if (player !== undefined) { player.privilege = privilege }
    if (adminLogin !== undefined) {
      Logger.info(`Player ${adminLogin} changed ${login} privilege to ${privilege}`)
    } else {
      Logger.info(`${login} privilege set to ${privilege}`)
    }
  }

  /**
   * Add a checkpoint time to the player object, returns true if the checkpoint is finish
   */
  static addCP(player: TMPlayer, cp: TMCheckpoint): Error | boolean {
    let laps
    if (GameService.game.gameMode === 1 || MapService.current.lapRace === false) { // ta gamemode or not a lap map
      laps = 1
    } else if (GameService.game.gameMode === 3) { // laps gamemode
      laps = GameService.game.lapsNo
    } else { // rounds, cup, teams and lap map
      laps = MapService.current.lapsAmount
    }
    if (cp.index === 0) {
      if (laps === 1 && MapService.current.checkpointsAmount === 1) {  // finish if 0 cp map
        player.checkpoints.length = 0
        return true
      }
      player.checkpoints.unshift(cp)
      player.checkpoints.length = 1 // reset checkpoints array on cp1
      return false
    }
    if (player.checkpoints.length === 0) { return new Error('Index not coherent with checkpoints length') } // handle people passing some cps before controller start
    const endLap: number = player.checkpoints[0].lap + laps
    if (cp.lap < endLap) {
      player.checkpoints.push(cp)
      return false
    } else {
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
