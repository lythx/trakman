import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { MapService } from './MapService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import 'dotenv/config'
import { Utils } from '../Utils.js'
import { Client } from '../client/Client.js'

export class RecordService {

  private static repo: RecordRepository = new RecordRepository()
  private static _localRecords: TMLocalRecord[] = []
  private static _liveRecords: FinishInfo[] = []
  static readonly maxLocalsAmount: number = Number(process.env.LOCALS_AMOUNT)
  private static _initialLocals: TMLocalRecord[] = []
  private static _playerRanks: { login: string, mapId: string, rank: number }[] = []

  /**
   * Fetches and stores records on the current map and ranks of all online players on maps in current MatchSettings
   */
  static async initialize(): Promise<void> {
    if (this.maxLocalsAmount === NaN) {
      await Logger.fatal('LOCALS_AMOUNT is undefined or not a number. Check your .env file')
    }
    await this.repo.initialize()
    await this.fetchAndStoreRecords(MapService.current.id)
    await this.fetchAndStoreRanks()
    // Recreate list when Match Settings get changed
    Client.addProxy(['LoadMatchSettings'], async (): Promise<void> => {
      this._playerRanks.length = 0
      await this.fetchAndStoreRanks()
    })
  }

  /**
   * Fetches and stores records for given map
   * @param mapId Map uid
   */
  static async fetchAndStoreRecords(mapId: string): Promise<void> {
    this._liveRecords.length = 0
    this._localRecords = await this.repo.getLocalRecords(mapId)
    this._initialLocals.length = 0
    this._initialLocals.push(...this._localRecords)
    Events.emitEvent('Controller.LocalRecords', this._localRecords)
  }

  /**
   * Fetches and stores player ranks on maps present in Match Settings
   * for given logins or for all online players if no logins are specified
   * @param logins Array of player logins
   */
  static async fetchAndStoreRanks(...logins: string[]): Promise<void> {
    // If logins length is 0 get online players
    this._playerRanks = this._playerRanks.filter(a => !logins.includes(a.login))
    const presentMaps = MapService.maps.map(a => a.id)
    if (logins.length === 0) { logins = PlayerService.players.map(a => a.login) }
    let records: TMRecord[] = await this.repo.getAll()
    if (records.length === 0) { return }
    let rank = 1
    let prevMap = records[0].map
    let curMap = records[0].map
    let mapPresent = true
    for (let i = 0; i < records.length; i++) {
      if (curMap !== prevMap) {
        rank = 1
        mapPresent = true
        if (!presentMaps.includes(records[i].map)) {
          mapPresent = false
          continue
        }
      }
      if (mapPresent === false) { continue }
      if (logins.includes(records[i].login)) {
        this._playerRanks.push({
          login: records[i].login,
          mapId: records[i].map,
          rank
        })
      }
      rank++
      prevMap = records[i].map
      curMap = records[i + 1]?.map
    }
  }

  /**
   * Constructs record object, adds it into live records and local records array if its good enough
   * @param map Map uid
   * @param player Player login
   * @param time Record time
   * @returns False if checkpoints amount is not coherent with map checkpoints amount, otherwise an object
   * containing finishInfo object, localRecord object if record was a local record and liveRecord object if 
   * record was a live record
   */
  static async add(map: string, player: TMPlayer, time: number): Promise<false | { finishInfo: FinishInfo, localRecord?: RecordInfo, liveRecord?: RecordInfo }> {
    const date: Date = new Date()
    const cpsPerLap: number = MapService.current.checkpointsAmount
    let laps: number
    if (GameService.config.gameMode === 1 || !MapService.current.isLapRace) { // TA mode or not a lap map
      laps = 1
    } else if (GameService.config.gameMode === 3) { // Laps mode
      laps = GameService.config.lapsNo
    } else if (GameService.config.gameMode === 4) { // Stunts mode
      return false// TODO STUNTS MODE
    } else { // Rounds / Teams / Cup mode
      laps = MapService.current.lapsAmount
    }
    const cpAmount: number = cpsPerLap * laps
    const checkpoints: number[] = [...player.currentCheckpoints.map(a => a.time)]
    // If number of checkpoints doesn't match the map checkpoints amount reset checkpoints array and return
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return false
    }
    const finishInfo = {
      ...player,
      checkpoints: [...checkpoints],
      map,
      time
    }
    const localRecord: RecordInfo | undefined = await this.handleLocalRecord(map, time, date, [...checkpoints], player)
    const liveRecord: RecordInfo | undefined = this.handleLiveRecord(map, time, date, [...checkpoints], player)
    return { localRecord, finishInfo, liveRecord }
  }

  /**
   * Checks if record is good enough to be a new local record, then adds it to runtime 
   * memory and the database
   * @param mapId Map uid
   * @param time Record time
   * @param date Record date
   * @param checkpoints Array of record checkpoints
   * @param player Player object
   * @returns Record object if local record gets added, undefined otherwise
   */
  private static async handleLocalRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: TMPlayer): Promise<RecordInfo | undefined> {
    const previousIndex = this._localRecords.findIndex(a => a.login === player.login)
    let position: number = this._localRecords.findIndex(a => a.time > time) + 1
    // If player gets the worst record on the server set position to array length + 1
    if (position === 0) { position = this._localRecords.length + 1 }
    if (previousIndex === -1) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, -1, position, -1)
      this._localRecords.splice(position - 1, 0, recordInfo)
      Logger.info(...this.getLogString(-1, position, -1, time, player, 'local'))
      void this.repo.add(recordInfo)
      return position > this.maxLocalsAmount ? undefined : recordInfo
    }
    const pb: number | undefined = this._localRecords[previousIndex].time
    if (time === pb) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousIndex + 1, previousIndex + 1)
      Logger.info(...this.getLogString(previousIndex + 1, previousIndex + 1, time, time, player, 'local'))
      return position > this.maxLocalsAmount ? undefined : recordInfo
    }
    if (time < pb) {
      const previousTime: number | undefined = this._localRecords[previousIndex].time
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
      this._localRecords.splice(previousIndex, 1)
      this._localRecords.splice(position - 1, 0, recordInfo)
      Logger.info(...this.getLogString(previousIndex + 1, position, previousTime, time, player, 'local'))
      void this.repo.update(recordInfo.map, recordInfo.login, recordInfo.time, recordInfo.checkpoints, recordInfo.date)
      return position > this.maxLocalsAmount ? undefined : recordInfo
    }
  }

  /**
   * Checks if record is good enough to be a new live record, then adds it to runtime memory
   * @param mapId Map uid
   * @param time Record time
   * @param date Record date
   * @param checkpoints Array of record checkpoints
   * @param player Player object
   * @returns Record object if live record gets added, undefined otherwise
   */
  private static handleLiveRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: TMPlayer): RecordInfo | undefined {
    const pb: number | undefined = this._liveRecords.find(a => a.login === player.login)?.time
    const position: number = this._liveRecords.filter(a => a.time <= time).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, -1, position, -1)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(-1, position, -1, time, player, 'live'))
      return recordInfo
    }
    if (time === pb) {
      const previousPosition: number = this._liveRecords.findIndex(a => a.login === this._liveRecords.find(a => a.login === player.login)?.login) + 1
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousPosition, previousPosition)
      Logger.trace(...this.getLogString(previousPosition, previousPosition, time, time, player, 'live'))
      return recordInfo
    }
    if (time < pb) {
      const previousIndex: number = this._liveRecords.findIndex(a => a.login === player.login)
      if (previousIndex === -1) {
        Logger.error(`Can't find player ${player.nickname} (${player.login}) in memory`)
        return
      }
      const previousTime: number | undefined = this._liveRecords[previousIndex].time
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
      this._liveRecords.splice(previousIndex, 1)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(previousIndex + 1, position, previousTime, time, player, 'live'))
      return recordInfo
    }
  }

  /**
   * Removes a player record
   * @param player Player object
   * @param mapId Map uid
   * @param caller Caller player object
   */
  static remove(player: { login: string, nickname: string }, mapId: string, caller?: { login: string, nickname: string }): void {
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has removed the record of ${player.nickname} (${player.login}) on map ${mapId}`)
    } else {
      Logger.info(`The record of ${player.nickname} (${player.login}) on map ${mapId} has been removed`)
    }
    this._localRecords.splice(this._localRecords.findIndex(a => a.login === player.login && a.map === mapId), 1)
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    void this.repo.remove(player.login, mapId)
  }

  /**
   * Removes all records on a given map
   * @param mapId Map uid
   * @param caller Caller player object
   * @returns Database response
   */
  static removeAll(mapId: string, caller?: { login: string, nickname: string }): void {
    if (caller !== undefined) {
      Logger.info(`${caller.nickname} (${caller.login}) has removed all records on map ${mapId}`)
    } else {
      Logger.info(`Records on map ${mapId} have been removed`)
    }
    while (this._localRecords.some(a => a.map === mapId)) {
      this._localRecords.splice(this._localRecords.findIndex(a => a.map === mapId), 1)
    }
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    void this.repo.removeAll(mapId)
  }

  /**
   * Constructs record object
   * @param player Player object
   * @param mapId Map uid
   * @param date Record date
   * @param checkpoints Array of record checkpoints
   * @param time Record time
   * @param previousTime Previous record time
   * @param position Record position
   * @param previousPosition Previous record position
   * @returns Record object
   */
  private static constructRecordObject(player: TMPlayer, mapId: string, date: Date, checkpoints: number[],
    time: number, previousTime: number, position: number, previousPosition: number): RecordInfo {
    return {
      id: player.id,
      map: mapId,
      login: player.login,
      time,
      date,
      checkpoints,
      nickname: player.nickname,
      country: player.country,
      countryCode: player.countryCode,
      timePlayed: player.timePlayed,
      joinTimestamp: player.joinTimestamp,
      wins: player.wins,
      privilege: player.privilege,
      visits: player.visits,
      position,
      previousTime,
      previousPosition,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited,
      average: player.average
    }
  }

  /**
   * Construct log string for Logger
   * @param previousPosition Previous record position
   * @param position Record position
   * @param previousTime Previous record time
   * @param time Record time
   * @param player Player object containing login and nickname
   * @param recordType Record type ('live' or 'local')
   * @returns Array of strings formatted for Logger output
   */
  private static getLogString(previousPosition: number, position: number, previousTime: number, time: number, player: { login: string, nickname: string }, recordType: 'live' | 'local'): string[] {
    const rs = Utils.getRankingString(previousPosition, position, previousTime, time)
    return [`${Utils.strip(player.nickname)} (${player.login}) has ${rs.status} the ${Utils.getPositionString(position)} ${recordType} record. Time: ${Utils.getTimeString(time)}${rs.difference !== undefined ? rs.difference : ``}`]
  }

  /**
   * Fetches given player local rank on given map
   * @param login Player login
   * @param mapId Map uid
   * @returns Rank or undefined if player doesn't have a record
   */
  static async fetchRank(login: string, mapId: string): Promise<number | undefined>
  /**
   * Fetches given player local ranks on given maps
   * @param login Player login
   * @param mapIds Array of map uids
   * @returns Array of objects with player ranks and map uids
   */
  static async fetchRank(login: string, mapIds: string[]): Promise<{ mapId: string, rank: number }[]>
  static async fetchRank(login: string, mapIds: string | string[]): Promise<number | undefined | { mapId: string, rank: number }[]> {
    if (typeof mapIds === 'string') {
      const find = this._playerRanks.find(a => mapIds === a.mapId && a.rank !== -1 && a.login === login)
      return find?.rank
    }
    return this._playerRanks.filter(a => mapIds.includes(a.mapId) && a.rank !== -1 && a.login === login)
  }

  /**
   * Gets the players local record on the current map
   * @param login Player login
   * @returns Local record object or undefined if the player doesn't have a local record
   */
  static getLocal(login: string): TMLocalRecord | undefined
  /**
   * Gets multiple local records on the current map from runtime memory. If some player has no local record 
   * his record object wont be returned. Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Array of player logins
   * @returns Array of local record objects
   */
  static getLocal(logins: string[]): TMLocalRecord[]
  static getLocal(logins: string | string[]): TMLocalRecord | undefined | TMLocalRecord[] {
    if (typeof logins === 'string') {
      return this._localRecords.find(a => a.login === logins)
    }
    return this._localRecords.filter(a => logins.includes(a.login))
  }

  /**
   * Gets the players live record
   * @param login Player login
   * @returns Live record object or undefined if the player doesn't have a live record
   */
  static getLive(login: string): FinishInfo | undefined
  /**
   * Gets multiple live records If some player has no live record his record object wont be returned. 
   * Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Array of player logins
   * @returns Array of live record objects
   */
  static getLive(logins: string[]): FinishInfo[]
  static getLive(logins: string | string[]): FinishInfo | undefined | FinishInfo[] {
    if (typeof logins === 'string') {
      return this._liveRecords.find(a => a.login === logins)
    }
    return this._liveRecords.filter(a => logins.includes(a.login))
  }

  /**
   * Fetches local records on given maps from the database.
   * Returned array is sorted primary by time ascending, secondary by date ascending
   * @param mapIds Map uids
   * @returns Array of record objects
   */
  static async fetch(...mapIds: string[]): Promise<TMRecord[]> {
    return await this.repo.get(...mapIds)
  }

  /**
   * Fetches local records for given logins from the database.
   * Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Player logins
   * @returns Array of record objects
   */
  static async fetchRecordsByLogin(...logins: string[]): Promise<TMRecord[]> {
    return await this.repo.getByLogin(...logins)
  }

  /**
   * Fetches number of records a player has in the database
   * @param login Player login
   * @returns Number of records
   */
  static async fetchRecordCount(login: string): Promise<number> {
    return await this.repo.countRecords(login)
  }

  /**
   * Fetches a given player record on a given map
   * @param mapId Map uid
   * @param login Player login
   * @returns Record object or undefined if player has no record
   */
  static async fetchOne(mapId: string, login: string): Promise<TMRecord | undefined> {
    return await this.repo.getOne(mapId, login)
  }

  /**
   * @returns Local records array from start of the map
   */
  static get initialLocals(): Readonly<TMLocalRecord>[] {
    return [...this._initialLocals]
  }

  /**
   * @returns All online player ranks on all maps
   */
  static get playerRanks(): Readonly<{ login: string; mapId: string; rank: number; }>[] {
    return [...this._playerRanks]
  }

  /**
   * @returns Local records array on the current map
   */
  static get localRecords(): Readonly<TMLocalRecord>[] {
    return [...this._localRecords]
  }

  /**
   * @returns Number of local records on the current map
   */
  static get localRecordCount(): number {
    return this._localRecords.length
  }

  /**
   * @returns Live records array
   */
  static get liveRecords(): Readonly<FinishInfo>[] {
    return [...this._liveRecords]
  }

  /**
   * @returns Number of live records
   */
  static get liveRecordsCount(): number {
    return this._liveRecords.length
  }

}