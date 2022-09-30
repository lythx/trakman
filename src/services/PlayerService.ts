import { Client } from '../client/Client.js'
import { PlayerRepository } from '../database/PlayerRepository.js'
import { PrivilegeRepository } from '../database/PrivilegeRepository.js'
import { MapService } from './MapService.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import { Events } from '../Events.js'
import { RecordService } from './RecordService.js'
import { titles } from '../../config/Titles.js'

/**
 * This service manages online players on the server and players table in the database
 */
export class PlayerService {

  private static _players: tm.Player[] = []
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
    Events.addListener('LocalRecord', (info: RecordInfo): void => {
      if (info.previousPosition > RecordService.maxLocalsAmount && info.position <= RecordService.maxLocalsAmount) {
        this.newLocalsAmount++
      }
    })
    Events.addListener('BeginMap', (): void => {
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
      const info: any[] | Error = await Client.call('GetDetailedPlayerInfo', [{ string: player.Login }])
      if (info instanceof Error) {
        Logger.fatal(`Error when fetching player information from the server for ${Utils.strip(player.NickName)} (${player.Login})`, info.message)
        return
      }
      // OnlineRights is 0 for nations and 3 for united ?XD
      await this.join(player.Login, player.NickName, info[0].Path, info[0].IsSpectator,
        info[0].PlayerId, info[0].IPAddress.split(':')[0], info[0].OnlineRights === 3,
        info[0].LadderStats.PlayerRankings[0].Score, info[0].LadderStats.PlayerRankings[0].Ranking, true)
    }
  }

  /**
   * Gets player title based on config
   * @param login Player login
   * @param country Player nation
   * @param countryCode Player nation code
   */
  static getTitle(login: string, privilege: number, country: string, countryCode: string): string {
    const loginTitle = titles.logins[login as keyof typeof titles.logins]
    if (loginTitle !== undefined) { return loginTitle }
    const countryTitle = titles.countries[country as keyof typeof titles.countries]
    if (countryTitle !== undefined) { return countryTitle }
    const countryCodeTitle = titles.countries[countryCode as keyof typeof titles.countries]
    if (countryCodeTitle !== undefined) { return countryCodeTitle }
    return titles.privileges[privilege as keyof typeof titles.privileges]
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
  static async join(login: string, nickname: string, fullRegion: string,
    isSpectator: boolean, id: number, ip: string, isUnited: boolean,
    ladderPoints: number, ladderRank: number, serverStart?: true): Promise<JoinInfo> {
    const { region, country, countryCode } = Utils.getRegionInfo(fullRegion)
    if (countryCode === undefined) {
      // need to exit the process here because if someone joins and doesn't get stored in memory other services will throw errors if he does anything
      await Logger.fatal(`Error adding player ${Utils.strip(nickname)} (${login}) to memory, nation ${country} is not in the country list.`)
      return {} as any // Shut up IDE
    }
    const playerData: tm.OfflinePlayer | undefined = await this.repo.get(login)
    const privilege: number = await this.privilegeRepo.get(login)
    let player: tm.Player
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
        ladderPoints,
        ladderRank,
        rank: index === -1 ? undefined : (index + 1),
        title: this.getTitle(login, privilege, country, countryCode)
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
        average: playerData.average,
        ladderPoints,
        ladderRank,
        title: this.getTitle(login, privilege, country, countryCode)
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
   * Updates the player information in runtime memory and the database
   * @param players Objects containing player login and infos to change
   */
  static async updateInfo(...players: { login: string, nickname?: string, region?: string, title?: string }[]): Promise<void> {
    for (const p of players) {
      const obj = this._players.find(a => a.login === p.login)
      if (obj === undefined) { continue }
      if (p.title !== undefined) { obj.title = p.title }
      const { region, countryCode } = Utils.getRegionInfo(p.region ?? obj.region)
      if (p.nickname !== undefined || countryCode !== undefined) {
        const r = countryCode === undefined ? obj.region : region // Set only if region is valid
        await this.repo.updateNicknameAndRegion(p.login, p.nickname ?? obj.nickname, r)
      }
    }
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
    const player: tm.Player | undefined = this._players[playerIndex]
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
  static addCP(player: tm.Player, cp: tm.Checkpoint): Error | boolean {
    let laps
    if (GameService.config.gameMode === 1 || MapService.current.isLapRace === false) { // ta gamemode or not a lap map
      laps = 1
    } else if ([0, 3, 5].includes(GameService.config.gameMode)) {
      laps = GameService.config.roundsModeLapsAmount
    } else { // TEST ROUNDS MODE
      laps = GameService.config.lapsModeLapsAmount
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
    const player: tm.Player | undefined = this._players.find(a => a.login === login)
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
      const onlinePlayer: tm.Player | undefined = this.get(avg.login)
      if (onlinePlayer !== undefined) { // Set average in runtime if player is online
        onlinePlayer.average = average
      }
      arr.push({ login: avg.login, average })
      await this.repo.updateAverage(avg.login, average) // Set average in the database
    }
    // Get ranks for all players
    this.ranks = await this.repo.getRanks()
    Events.emit("RanksAndAveragesUpdated", arr)
  }

  /**
   * Fetches a player from the database. This method should be used to get players who are not online
   * @param login Player login
   * @returns Player object or undefined if player is not in the database
   */
  static fetch(login: string): Promise<tm.OfflinePlayer | undefined>
  /**
   * Fetches multiple players from the database. This method should be used to get players who are not online
   * If some player is not present in the database he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Player objects array 
   */
  static fetch(logins: string[]): Promise<tm.OfflinePlayer[]>
  static fetch(logins: string | string[]): Promise<tm.OfflinePlayer | undefined | tm.OfflinePlayer[]> {
    return this.repo.get(logins as any)
  }

  /**
   * Gets the player information from runtime memory. Only online players are stored
   * @param login Player login
   * @returns Player object or undefined if the player isn't online
   */
  static get(login: string): Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }> | undefined
  /**
   * Gets multiple players information from runtime memory. Only online players are stored
   * If some player is not online he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Array of player objects
   */
  static get(logins: string[]): Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }>[]
  static get(logins: string | string[]): Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }> | undefined |
    Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }>[] {
    if (typeof logins === 'string') {
      return this._players.find(a => a.login === logins)
    }
    return this._players.filter(a => logins.includes(a.login))
  }

  /**
   * @returns All online players
   */
  static get players(): Readonly<tm.Player & { currentCheckpoints: Readonly<tm.Checkpoint>[] }>[] {
    return [...this._players]
  }

  /**
   * @returns Number of online players
   */
  static get playerCount(): number {
    return this._players.length
  }

}
