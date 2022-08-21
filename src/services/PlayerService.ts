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

/**
 * This service manages online players on the server and players table in the database
 */
export class PlayerService {

  private static _players: TMPlayer[] = []
  private static readonly repo: PlayerRepository = new PlayerRepository()
  private static readonly privilegeRepo = new PrivilegeRepository()
  private static newLocalsAmount = 0
  private static ranks: string[]

  /**
   * Fetches ranks, players and creates playerlist
   */
  static async initialize(): Promise<void> {
    await this.repo.initialize()
    await this.privilegeRepo.initialize()
    this.ranks = await this.repo.getRanks()
    await this.addAllFromList()
    Events.addListener('Controller.PlayerRecord', (info: RecordInfo): void => {
      if (info.previousPosition > RecordService.maxLocalsAmount && info.position <= RecordService.maxLocalsAmount) {
        this.newLocalsAmount++
      }
    })
    Events.addListener('Controller.BeginMap', (): void => {
      this.newLocalsAmount = 0
    })
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
        Logger.fatal(`Error when fetching player information from the server for ${Utils.strip(player.NickName)} (${player.Login})`, detailedPlayerInfo.message)
        return
      }
      // OnlineRights is 0 for nations and 3 for united ?XD
      await this.join(player.Login, player.NickName, detailedPlayerInfo[0].Path, detailedPlayerInfo[0].IsSpectator,
        detailedPlayerInfo[0].PlayerId, detailedPlayerInfo[0].IPAddress.split(':')[0], detailedPlayerInfo[0].OnlineRights === 3, true)
    }
  }

  /**
   * Adds a player into the list and database
   * @param login Player login
   * @param nickname Player nickname
   * @param fullRegion Player region received from dedicated server
   * @param isSpectator True if player joined as spectator
   * @param id Player dedicated server id
   * @param ip Player ip address
   * @param isUnited True if player has united version of game
   * @param serverStart True if executed on server start
   */
  static async join(login: string, nickname: string, fullRegion: string, isSpectator: boolean, id: number, ip: string, isUnited: boolean, serverStart?: true): Promise<JoinInfo> {
    let s: string[] = fullRegion.split('|').slice(1)
    const region: string = s.join('|')
    const country: string = s[0]
    let countryCode: string | undefined = Utils.countryToCode(country)
    if (countryCode === undefined) {
      // need to exit the process here because if someone joins and doesn't get stored in memory other services will throw errors if he does anything
      await Logger.fatal(`Error adding player ${Utils.strip(nickname)} (${login}) to memory, nation ${country} is not in the country list.`)
      return {} as any // Shut up IDE
    }
    const playerData: TMOfflinePlayer | undefined = await this.repo.get(login)
    const privilege: number = await this.privilegeRepo.get(login)
    let player: TMPlayer
    const index: number = this.ranks.indexOf(login)
    if (playerData === undefined) {
      player = {
        id,
        login,
        nickname,
        country: country,
        countryCode: countryCode,
        timePlayed: 0,
        joinTimestamp: Date.now(),
        visits: 1,
        currentCheckpoints: [],
        wins: 0,
        privilege,
        isSpectator,
        ip,
        region,
        isUnited,
        average: RecordService.maxLocalsAmount,
        rank: index === -1 ? undefined : (index + 1)
      }
      await this.repo.add(player) // need to await so owner privilege gets set after player is added
    } else {
      player = {
        login,
        nickname,
        country: country,
        countryCode: countryCode,
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
        rank: index === -1 ? undefined : (index + 1),
        average: playerData.average
      }
      await this.repo.updateOnJoin(player.login, player.nickname, player.region, player.visits, player.isUnited) // need to await so owner privilege gets set after player is added
    }
    this._players.push(player)
    if (serverStart === undefined) {
      Logger.info(`${player.isSpectator === true ? 'Spectator' : 'Player'} ${Utils.strip(player.nickname)} (${player.login}) joined the server, visits: ${player.visits}, ` +
        `region: ${player.region}, wins: ${player.wins}, privilege: ${player.privilege}`)
    }
    return player
  }

  /**
   * Remove the player from local memory, save timePlayed and lastOnline in database
   * @param login Player login
   */
  static leave(login: string): LeaveInfo | Error {
    const date: Date = new Date()
    const playerIndex: number = this._players.findIndex(a => a.login === login)
    if (playerIndex === -1) {
      const errStr: string = `Error removing player ${login} from memory, player is not in the memory`
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
    Logger.info(`${Utils.strip(player.nickname)} (${player.login}) has quit after playing for ${Utils.msToTime(sessionTime)}`)
    return leaveInfo
  }

  /**
   * Add a checkpoint time to the player object, returns true if the checkpoint is finish
   * @param player Player object
   * @param cp Checkpoint object
   */
  static addCP(player: TMPlayer, cp: TMCheckpoint): Error | boolean {
    let laps
    if (GameService.config.gameMode === 1 || MapService.current.isLapRace === false) { // ta gamemode or not a lap map
      laps = 1
    } else if (GameService.config.gameMode === 3) { // laps gamemode
      laps = GameService.config.lapsNo
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

  /**
   * Sets spectator status in player object
   * @param login Player login
   * @param status Spectator status
   * @returns True if successfull
   */
  static setPlayerSpectatorStatus(login: string, status: boolean): boolean {
    const player: TMPlayer | undefined = this._players.find(a => a.login === login)
    if (player === undefined) { return false }
    player.isSpectator = status
    return true
  }

  /**
   * Adds a win to a player object
   * @param login Player login
   * @returns Number of wins
   */
  static async addWin(login: string): Promise<number> {
    let player: any = this.get(login)
    if (player === undefined) {
      player = await this.fetch(login)
    }
    await this.repo.updateOnWin(login, ++player.wins)
    return player.wins
  }

  /**
   * Calculates and updates averages and ranks in players table and runtime
   */
  static async calculateAveragesAndRanks(): Promise<void> {
    const logins = RecordService.localRecords.slice(0, RecordService.maxLocalsAmount + this.newLocalsAmount).map(a => a.login)
    const localRecords = RecordService.localRecords
    const initialLocals = RecordService.initialLocals
    const amount: number = MapService.mapCount
    const averages = await this.repo.getAverage(logins)
    const arr: { login: string, average: number }[] = []
    for (const avg of averages) {
      // Get rank from the start of the race
      let previousRank: number = initialLocals.findIndex(a => a.login === avg.login) + 1
      // If player doesnt have rank set it to locals amount
      if (previousRank === 0) { previousRank = RecordService.maxLocalsAmount }
      // Get rank from the end of the race
      let newRank: number = localRecords.findIndex(a => a.login === avg.login) + 1
      // Calculate average
      const average: number = (amount * avg.average + newRank - previousRank) / amount
      const onlinePlayer: TMPlayer | undefined = this.get(avg.login)
      if (onlinePlayer !== undefined) { // Set average in runtime if player is online
        onlinePlayer.average = average
      }
      arr.push({ login: avg.login, average })
      await this.repo.updateAverage(avg.login, average) // Set average in the database
    }
    // Get ranks for all players
    this.ranks = await this.repo.getRanks()
    Events.emitEvent("Controller.RanksAndAveragesUpdated", arr)
  }

  /**
   * Fetches a player from the database. This method should be used to get players who are not online
   * @param login Player login
   * @returns Player object or undefined if player is not in the database
   */
  static fetch(login: string): Promise<TMOfflinePlayer | undefined>
  /**
   * Fetches multiple players from the database. This method should be used to get players who are not online
   * If some player is not present in the database he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Player objects array 
   */
  static fetch(logins: string[]): Promise<TMOfflinePlayer[]>
  static fetch(logins: string | string[]): Promise<TMOfflinePlayer | undefined | TMOfflinePlayer[]> {
    return this.repo.get(logins as any)
  }

  /**
   * Gets the player information from runtime memory. Only online players are stored
   * @param login Player login
   * @returns Player object or undefined if the player isn't online
   */
  static get(login: string): Readonly<TMPlayer & { currentCheckpoints: Readonly<Readonly<TMCheckpoint>[]> }> | undefined
  /**
   * Gets multiple players information from runtime memory. Only online players are stored
   * If some player is not online he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Array of player objects
   */
  static get(logins: string[]): Readonly<TMPlayer & { currentCheckpoints: Readonly<Readonly<TMCheckpoint>[]> }>[]
  static get(logins: string | string[]): Readonly<TMPlayer & { currentCheckpoints: Readonly<Readonly<TMCheckpoint>[]> }> | undefined |
    Readonly<TMPlayer & { currentCheckpoints: Readonly<Readonly<TMCheckpoint>[]> }>[] {
    if (typeof logins === 'string') {
      return this._players.find(a => a.login === logins)
    }
    return this._players.filter(a => logins.includes(a.login))
  }

  /**
   * @returns All online players
   */
  static get players(): Readonly<TMPlayer & { currentCheckpoints: Readonly<TMCheckpoint>[] }>[] {
    return [...this._players]
  }

  /**
   * @returns Number of online players
   */
  static get playerCount(): number {
    return this._players.length
  }

}
