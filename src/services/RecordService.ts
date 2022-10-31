import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { MapService } from './MapService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import { Client } from '../client/Client.js'
import config from '../../config/Config.js'

export class RecordService {

  private static repo: RecordRepository = new RecordRepository()
  private static _localRecords: tm.LocalRecord[] = []
  private static _liveRecords: tm.FinishInfo[] = []
  /** Maximum amount of local records */
  static readonly maxLocalsAmount: number = config.localRecordsLimit
  private static _initialLocals: tm.LocalRecord[] = []
  private static _playerRanks: { login: string, mapId: string, rank: number }[] = []
  private static _queueRecords: { mapId: string, records: tm.Record[] }[] = []
  private static _historyRecords: { mapId: string, records: tm.Record[] }[] = []

  /**
   * Fetches and stores records on the current map and ranks of all online players on maps in current MatchSettings
   */
  static async initialize(): Promise<void> {
    await this.updateQueue()
    this._localRecords = await this.repo.getLocalRecords(MapService.current.id)
    this._initialLocals.push(...this._localRecords)
    await this.updateQueue()
    await this.fetchAndStoreRanks()
    // Recreate list when Match Settings get changed
    Client.addProxy(['LoadMatchSettings'], async (): Promise<void> => {
      this._playerRanks.length = 0
      await this.fetchAndStoreRanks()
    })
    Events.addListener('LocalRecord', (info) => {
      const ranks = this._playerRanks.filter(a => a.mapId === tm.maps.current.id)
      const rec = ranks.find(a => a.login === info.login)
      if (rec !== undefined) {
        rec.rank === info.position
      } else {
        this._playerRanks.push({ login: info.login, rank: info.position, mapId: info.map })
      }
      for (const e of ranks) {
        if (e.rank > info.position && (info.previous === undefined || e.rank < info.previous.position)) {
          e.rank++
        }
      }
    })
  }

  /**
   * Fetches and stores records for current map
   */
  static async nextMap(): Promise<void> {
    this._historyRecords.unshift({ mapId: MapService.history[0].id, records: [...this._localRecords] })
    this._liveRecords.length = 0
    this._localRecords = await this.repo.getLocalRecords(MapService.current.id)
    this._initialLocals.length = 0
    this._initialLocals.push(...this._localRecords)
    await this.updateQueue()
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
    let records: tm.Record[] = await this.repo.getAll()
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
   * containing tm.FinishInfo object, localRecord object if record was a local record and liveRecord object if 
   * record was a live record
   */
  static async add(map: string, player: tm.Player, time: number): Promise<false | {
    finishInfo: tm.FinishInfo, localRecord?: tm.RecordInfo, liveRecord?: tm.RecordInfo
  }> {
    const date: Date = new Date()
    const cpsPerLap: number = MapService.current.checkpointsAmount
    let laps: number
    if (GameService.config.gameMode === 1 || !MapService.current.isLapRace) { // TA mode or not a lap map
      laps = 1
    } else if (GameService.config.gameMode === 3) { // Laps mode
      laps = GameService.config.lapsModeLapsAmount
    } else if (GameService.config.gameMode === 4) { // Stunts mode
      return false// STUNTS MODE
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
    const localRecord: tm.RecordInfo | undefined = await this.handleLocalRecord(map, time, date, [...checkpoints], player)
    const liveRecord: tm.RecordInfo | undefined = this.handleLiveRecord(map, time, date, [...checkpoints], player)
    console.log({ localRecord, finishInfo, liveRecord })
    return { localRecord, finishInfo, liveRecord }
  }

  /**
   * Updates the player nickname in runtime memory
   * @param players Objects containing player logins and nicknames
   */
  static updateInfo(...players: { login: string, nickname?: string, region?: string, title?: string }[]): void {
    const replaceInfos = (obj: { nickname: string, region: string, country: string, countryCode: string, title?: string },
      replacer: { nickname?: string, region?: string, title?: string }) => {
      if (replacer.nickname !== undefined) { obj.nickname = replacer.nickname }
      if (replacer.region !== undefined) {
        const { region, country, countryCode } = Utils.getRegionInfo(replacer.region)
        if (countryCode !== undefined) {
          obj.region = region
          obj.country = country
          obj.countryCode = countryCode
        }
      }
      if (replacer.title !== undefined && obj.title !== undefined) { obj.title = replacer.title }
    }
    for (const p of players) {
      const obj1 = this._liveRecords.find(a => a.login === p.login)
      if (obj1 !== undefined) { replaceInfos(obj1, p) }
      const obj2 = this._localRecords.find(a => a.login === p.login)
      if (obj2 !== undefined) { replaceInfos(obj2, p) }
      const obj3 = this._initialLocals.find(a => a.login === p.login)
      if (obj3 !== undefined) { replaceInfos(obj3, p) }
    }
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
  private static async handleLocalRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: tm.Player): Promise<tm.RecordInfo | undefined> {
    const previousIndex = this._localRecords.findIndex(a => a.login === player.login)
    let position: number = this._localRecords.findIndex(a => a.time > time) + 1
    // If player gets the worst record on the server set position to array length + 1
    if (position === 0) { position = this._localRecords.length + 1 }
    if (previousIndex === -1) {
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, undefined, position, undefined)
      this._localRecords.splice(position - 1, 0, recordInfo)
      Logger.info(...this.getLogString(undefined, position, undefined, time, player, 'local'))
      void this.repo.add(recordInfo)
      return position > this.maxLocalsAmount ? undefined : recordInfo
    }
    const pb: number | undefined = this._localRecords[previousIndex].time
    if (time === pb) {
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousIndex + 1, previousIndex + 1)
      Logger.info(...this.getLogString(previousIndex + 1, previousIndex + 1, time, time, player, 'local'))
      return position > this.maxLocalsAmount ? undefined : recordInfo
    }
    if (time < pb) {
      const previousTime: number | undefined = this._localRecords[previousIndex].time
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
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
  private static handleLiveRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: tm.Player): tm.RecordInfo | undefined {
    const pb: number | undefined = this._liveRecords.find(a => a.login === player.login)?.time
    const position: number = this._liveRecords.filter(a => a.time <= time).length + 1
    if (pb === undefined) {
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, undefined, position, undefined)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(undefined, position, undefined, time, player, 'live'))
      return recordInfo
    }
    if (time === pb) {
      const previousPosition: number = this._liveRecords.findIndex(a => a.login === this._liveRecords.find(a => a.login === player.login)?.login) + 1
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousPosition, previousPosition)
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
      const recordInfo: tm.RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
      this._liveRecords.splice(previousIndex, 1)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(previousIndex + 1, position, previousTime, time, player, 'live'))
      return recordInfo
    }
  }

  /**
   * Updates records for maps in queue
   */
  static async updateQueue(): Promise<void> {
    const arr: { mapId: string, records: tm.Record[] }[] = []
    const mapsToFetch: string[] = []
    const queue = MapService.queue
    for (let i = 0; i < queue.length; i++) {
      const mapId: string = queue[i].id
      const r = this._queueRecords.find(a => a.mapId === mapId)
      if (r === undefined) {
        arr[i] = { mapId, records: [] }
        mapsToFetch.push(mapId)
      } else {
        arr[i] = r
      }
    }
    const res = await this.fetch(...mapsToFetch)
    for (const e of mapsToFetch) {
      const entry = arr.find(a => a.mapId === e)
      if (entry !== undefined) { entry.records = res.filter(a => a.map === e) }
    }
    this._queueRecords = arr
    Events.emit('RecordsPrefetch', res)
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
    const index = this._localRecords.findIndex(a => a.login === player.login && a.map === mapId)
    if (index !== -1) {
      const record = this._localRecords[index]
      this._localRecords.splice(index, 1)
      Events.emit('LocalRecordsRemoved', [record])
      void this.repo.remove(mapId, player.login)
    }
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
    const records = this._localRecords
    this._localRecords.length = 0
    Events.emit('LocalRecordsRemoved', records)
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
  private static constructRecordObject(player: tm.Player, mapId: string, date: Date, checkpoints: number[],
    time: number, previousTime: number | undefined, position: number, previousPosition: number | undefined): tm.RecordInfo {
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
      previous: (previousTime && previousPosition) ? {time: previousTime , position: previousPosition} : undefined,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited,
      average: player.average,
      ladderPoints: player.ladderPoints,
      ladderRank: player.ladderRank,
      title: player.title
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
  private static getLogString(previousPosition: number | undefined, position: number,
    previousTime: number | undefined, time: number, player: { login: string, nickname: string }, recordType: 'live' | 'local'): string[] {
    const rs = Utils.getRankingString({ time, position }, (previousPosition && previousTime) ? { position: previousPosition, time: previousTime } : undefined)
    return [`${Utils.strip(player.nickname)} (${player.login}) has ${rs.status} the` +
      ` ${Utils.getPositionString(position)} ${recordType} record. Time: ` + `
    ${Utils.getTimeString(time)}${rs.difference !== undefined ? rs.difference : ``}`]
  }

  /**
   * Gets given player local rank on given map
   * @param login Player login
   * @param mapId Map uid
   * @returns Rank or undefined if player doesn't have a record
   */
  static getRank(login: string, mapId: string): number | undefined
  /**
   * Gets given player local ranks on given maps
   * @param login Player login
   * @param mapIds Array of map uids
   * @returns Array of objects with player ranks and map uids
   */
  static getRank(login: string, mapIds?: string[]): { mapId: string, rank: number }[]
  /**
   * Gets given player local ranks on all maps
   * @param login Player login
   * @returns Array of objects with player ranks and map uids
   */
  static getRank(login: string): { mapId: string, rank: number }[]
  static getRank(login: string, mapIds?: string | string[]): number | undefined | { mapId: string, rank: number }[] {
    if (mapIds === undefined) {
      return this._playerRanks.filter(a => login === a.login && a.rank !== -1)
    }
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
  static getLocal(login: string): tm.LocalRecord | undefined
  /**
   * Gets multiple local records on the current map from runtime memory. If some player has no local record 
   * his record object wont be returned. Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Array of player logins
   * @returns Array of local record objects
   */
  static getLocal(logins: string[]): tm.LocalRecord[]
  static getLocal(logins: string | string[]): tm.LocalRecord | undefined | tm.LocalRecord[] {
    if (typeof logins === 'string') {
      return this._localRecords.find(a => a.login === logins)
    }
    return this._localRecords.filter(a => logins.includes(a.login))
  }

  /**
   * Gets local records on the given map if it's in map queue. 
   * Returned array is sorted primary by queue position ascending, time ascending and date ascending
   * @param mapIds Array of map ids
   * @returns Array of record objects
   */
  static getFromQueue(...mapIds: string[]): tm.Record[] {
    return this._queueRecords.filter(a => mapIds.includes(a.mapId)).map(a => a.records).flat(1)
  }

  /**
   * Gets local record of the given player, on the given map if it's in map queue.
   * @param login Player login
   * @param mapId Map id
   * @returns Record object or undefined if record doesn't exist
   */
  static getOneFromQueue(login: string, mapId: string): tm.Record | undefined {
    const arr = this._queueRecords.find(a => mapId = a.mapId)
    return arr?.records?.find?.(a => a.login === login)
  }

  /**
   * Gets local records on the given map if it's in map history. 
   * Returned array is sorted primary by history position ascending, time ascending and date ascending
   * @param mapIds Array of map ids
   * @returns Array of record objects
   */
  static getFromHistory(...mapIds: string[]): tm.Record[] {
    return this._historyRecords.filter(a => mapIds.includes(a.mapId)).map(a => a.records).flat(1)
  }

  /**
   * Gets local record of the given player, on the given map if it's in map history.
   * @param login Player login
   * @param mapId Map id
   * @returns Record object or undefined if record doesn't exist
   */
  static getOneFromHistory(login: string, mapId: string): tm.Record | undefined {
    const arr = this._historyRecords.find(a => mapId = a.mapId)
    return arr?.records?.find?.(a => a.login === login)
  }

  /**
   * Gets the players live record
   * @param login Player login
   * @returns Live record object or undefined if the player doesn't have a live record
   */
  static getLive(login: string): tm.FinishInfo | undefined
  /**
   * Gets multiple live records If some player has no live record his record object wont be returned. 
   * Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Array of player logins
   * @returns Array of live record objects
   */
  static getLive(logins: string[]): tm.FinishInfo[]
  static getLive(logins: string | string[]): tm.FinishInfo | undefined | tm.FinishInfo[] {
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
  static async fetch(...mapIds: string[]): Promise<tm.Record[]> {
    return await this.repo.get(...mapIds)
  }

  /**
   * Fetches local records for given logins from the database.
   * Returned array is sorted primary by time ascending, secondary by date ascending
   * @param logins Player logins
   * @returns Array of record objects
   */
  static async fetchRecordsByLogin(...logins: string[]): Promise<tm.Record[]> {
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
  static async fetchOne(mapId: string, login: string): Promise<tm.Record | undefined> {
    return await this.repo.getOne(mapId, login)
  }

  /**
   * @returns Local records array from start of the map
   */
  static get initialLocals(): Readonly<tm.LocalRecord>[] {
    return [...this._initialLocals]
  }

  /**
   * @returns All online player ranks on all maps
   */
  static get playerRanks(): Readonly<{ login: string; mapId: string; rank: number; }>[] {
    return [...this._playerRanks]
  }

  /**
   * Current map local records
   */
  static get localRecords(): Readonly<tm.LocalRecord>[] {
    return [...this._localRecords]
  }

  /**
   * Number of local records on the current map
   */
  static get localRecordCount(): number {
    return this._localRecords.length
  }

  /**
   * Current live records
   */
  static get liveRecords(): Readonly<tm.FinishInfo>[] {
    return [...this._liveRecords]
  }

  /**
   * Number of live records
   */
  static get liveRecordsCount(): number {
    return this._liveRecords.length
  }

}