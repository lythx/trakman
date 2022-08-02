import { Client } from '../client/Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import { PrivilegeRepository } from '../database/PrivilegeRepository.js'
import 'dotenv/config'
import { MapService } from './MapService.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import { Events } from '../Events.js'
import { RecordService } from './RecordService.js'

export class PlayerService {

  private static readonly _players: TMPlayer[] = []
  private static readonly repo: PlayerRepository = new PlayerRepository()
  private static readonly privilegeRepo: PrivilegeRepository = new PrivilegeRepository()
  private static newLocals: number
  private static ranks: string[]

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    await this.privilegeRepo.initialize()
    const oldOwnerLogin: string | undefined = await this.privilegeRepo.getOwner()
    const newOwnerLogin: string | undefined = process.env.SERVER_OWNER_LOGIN
    if (newOwnerLogin === undefined) {
      await Logger.fatal('SERVER_OWNER_LOGIN is undefined. Check your .env file')
      return
    }
    if (oldOwnerLogin !== newOwnerLogin) {
      if (oldOwnerLogin !== undefined) { await this.privilegeRepo.removeOwner() }
      await this.setPrivilege(newOwnerLogin, 4)
    }
    this.ranks = await this.repo.getRanks()
    await this.addAllFromList()
    Events.addListener('Controller.PlayerRecord', (info: RecordInfo): void => {
      if (info.previousPosition > RecordService.localsAmount && info.position <= RecordService.localsAmount) {
        this.newLocals++
      }
    })
    Events.addListener('Controller.BeginMap', (): void => {
      this.newLocals = 0
    })
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
  static async join(login: string, nickname: string, fullRegion: string, isSpectator: boolean, id: number, ip: string, isUnited: boolean, serverStart?: true): Promise<JoinInfo> {
    let s = fullRegion.split('|')
    s.shift()
    const region = s.join('|')
    const nation: string = fullRegion.split('|')[1]
    let nationCode: string | undefined = Utils.nationToNationCode(nation)
    if (nationCode === undefined) {
      // need to exit the process here because if someone joins and doesn't get stored in memory other services will throw errors if he does anything
      await Logger.fatal(`Error adding player ${login} to memory, nation ${nation} is not in the country list`)
      return {} as any // Shut up IDE
    }
    const playerData: TMOfflinePlayer | undefined = await this.repo.get(login)
    const privilege: number = await this.privilegeRepo.get(login)
    let player: TMPlayer
    const index = this.ranks.indexOf(login)
    if (playerData === undefined) {
      player = {
        id,
        login,
        nickname,
        nation,
        nationCode,
        timePlayed: 0,
        joinTimestamp: Date.now(),
        visits: 1,
        currentCheckpoints: [],
        wins: 0,
        privilege: 0,
        isSpectator,
        ip,
        region,
        isUnited,
        average: RecordService.localsAmount,
        rank: index === -1 ? undefined : index
      }
      await this.repo.add(player) // need to await so owner privilege gets set after player is added
    } else {
      player = {
        login,
        nickname,
        nation,
        nationCode,
        timePlayed: playerData.timePlayed,
        joinTimestamp: Date.now(),
        visits: serverStart === true ? playerData.visits : playerData.visits + 1, // Prevent adding visits on server start
        currentCheckpoints: [],
        wins: playerData.wins,
        privilege,
        isSpectator,
        id,
        ip,
        region,
        isUnited,
        lastOnline: playerData.lastOnline,
        rank: index === -1 ? undefined : index,
        average: playerData.average
      }
      await this.repo.updateOnJoin(player.login, player.nickname, player.region, player.visits, player.isUnited) // need to await so owner privilege gets set after player is added
    }
    this._players.push(player)
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
    const date = new Date()
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
      ...player,
      timePlayed: totalTimePlayed,
      sessionTime
    }
    void this.repo.updateOnLeave(player.login, totalTimePlayed, date)
    this._players.splice(playerIndex, 1)
    Logger.info(`Player ${player.login} left after playing for ${Utils.getTimeString(sessionTime)}`)
    return leaveInfo
  }

  static async fetchPlayer(login: string): Promise<TMOfflinePlayer | undefined>
  static async fetchPlayer(login: string[]): Promise<TMOfflinePlayer[]>
  static async fetchPlayer(login: string | string[]): Promise<TMOfflinePlayer | TMOfflinePlayer[] | undefined> {
    return await this.repo.get(login as any)
  }

  static async setPrivilege(login: string, privilege: number, callerLogin?: string): Promise<void> {
    const player: TMPlayer | undefined = this._players.find(a => a.login === login)
    if (player !== undefined) { player.privilege = privilege }
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} changed ${login} privilege to ${privilege}`)
    } else {
      Logger.info(`${login} privilege set to ${privilege}`)
    }
    const offlinePlayer = await this.repo.get(login)
    Events.emitEvent('Controller.PrivilegeChanged', {
      player: offlinePlayer === undefined ? undefined : { ...offlinePlayer, privilege },
      login,
      previousPrivilege: offlinePlayer?.privilege ?? 0,
      newPrivilege: privilege,
      callerLogin
    })
    void this.privilegeRepo.set(login, privilege)
  }

  /**
   * Add a checkpoint time to the player object, returns true if the checkpoint is finish
   */
  static addCP(player: TMPlayer, cp: TMCheckpoint): Error | boolean {
    let laps
    if (GameService.game.gameMode === 1 || MapService.current.isLapRace === false) { // ta gamemode or not a lap map
      laps = 1
    } else if (GameService.game.gameMode === 3) { // laps gamemode
      laps = GameService.game.lapsNo
    } else { // rounds, cup, teams and lap map
      laps = MapService.current.lapsAmount
    }
    if (cp.index === 0) {
      if (laps === 1 && MapService.current.checkpointsAmount === 1) {  // finish if 0 cp map
        player.currentCheckpoints.length = 0
        return true
      }
      player.currentCheckpoints.unshift(cp)
      player.currentCheckpoints.length = 1 // reset checkpoints array on cp1
      return false
    }
    if (player.currentCheckpoints.length === 0) { return new Error('Index not coherent with checkpoints length') } // handle people passing some cps before controller start
    const endLap: number = player.currentCheckpoints[0].lap + laps
    if (cp.lap < endLap) {
      player.currentCheckpoints.push(cp)
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

  static async addWin(login: string): Promise<number> {
    let player: any = this.getPlayer(login)
    if (player === undefined) {
      player = await PlayerService.fetchPlayer(login)
    }
    Logger.debug(JSON.stringify(player))
    await this.repo.updateOnWin(login, ++player.wins)
    Logger.debug(player.wins)
    return player.wins
  }

  static async calculateAveragesAndRanks(): Promise<void> {
    const logins = RecordService.localRecords.slice(0, RecordService.localsAmount + this.newLocals).map((a, i) => ({ login: a.login, position: i + 1 }))
    const amount = MapService.maps.length
    const ranks = await this.repo.getAverage(logins.map(a => a.login))
    for (const rank of ranks) {
      let previousRank = RecordService.initialLocals.findIndex(a => a.login === rank.login) + 1
      if (previousRank === 0) { previousRank = RecordService.localsAmount }
      let newRank = RecordService.localRecords.findIndex(a => a.login === rank.login) + 1
      const sum = amount * (rank.average ?? RecordService.localsAmount) + newRank - previousRank
      const onlinePlayer = this.getPlayer(rank.login)
      if (onlinePlayer !== undefined) {
        onlinePlayer.average = sum / amount
      }
      await this.repo.updateAverage(rank.login, sum / amount)
    }
    this.ranks = await this.repo.getRanks()
  }

}
