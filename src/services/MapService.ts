import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { Events } from '../Events.js'
import { Utils } from '../Utils.js'
import config from "../../config/Config.js"

interface JukeboxMap {
  readonly map: TMMap
  readonly isForced: boolean
  readonly callerLogin?: string
}

/**
 * This service manages maps in current server Match Settings and maps table in the database
 */
export class MapService {

  private static _current: TMCurrentMap
  private static _maps: TMMap[] = []
  private static readonly repo = new MapRepository()
  private static readonly _queue: JukeboxMap[] = []
  private static readonly _history: TMMap[] = []
  static readonly queueSize: number = config.jukeboxQueueSize
  static readonly historySize: number = config.jukeboxHistorySize

  /**
   * Creates maplist, sets current map and adds a proxy for Match Settings update
   */
  static async initialize(): Promise<void> {
    await this.repo.initialize()
    await this.createList()
    await this.setCurrent()
    this.fillQueue()
    void this.updateNextMap()
    // Recreate list when Match Settings get changed
    Client.addProxy(['LoadMatchSettings'], async (): Promise<void> => {
      this._maps.length = 0
      await this.createList()
      this.clearJukebox()
      Events.emitEvent('Controller.MatchSettingsUpdated', this._maps)
    })
  }

  /**
   * Downloads all the maps from the server and store them in the list
   */
  private static async createList(): Promise<void> {
    const current = await Client.call('GetCurrentChallengeInfo')
    if (current instanceof Error) {
      Logger.fatal('Error while getting the current map', current.message)
      return
    }
    const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
    if (mapList instanceof Error) {
      Logger.fatal('Error while getting the map list', mapList.message)
      return
    }
    // Add current map to maplist if its not present there
    if (!mapList.some(a => a.UId === current[0].UId)) {
      mapList.unshift(current[0])
      const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: current[0].FileName }])
      if (insert instanceof Error) { await Logger.fatal('Failed to insert current challenge') }
    }
    const DBMapList: TMMap[] = (await this.repo.getAll())
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    if (mapsNotInDB.length > 100) { // TODO implement progress bar here perhaps (?)
      Logger.warn(`Large amount of maps (${mapsNotInDB.length}) present in maplist are not in the database. Fetching maps might take a few minutes...`)
    }
    const mapsNotInDBObjects: TMMap[] = []
    // Fetch info and add all maps which were not present in the database
    const voteRatios = await this.repo.getVoteCountAndRatio(mapsNotInDB.map(a => a.UId))
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.fatal(`Unable to retrieve map info for map id: ${c.UId}, filename: ${c.FileName}`, res.message)
        return
      }
      const v = voteRatios.find(a => a.uid === c.UId)
      mapsNotInDBObjects.push(({ ...this.constructNewMapObject(res[0]), voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0 }))
    }
    const mapsInMapList: TMMap[] = []
    // From maps that were present in the database add only ones that are in current Match Settings
    for (const map of DBMapList) {
      if (mapList.some(a => a.UId === map.id)) {
        mapsInMapList.push(map)
      }
    }
    // Shuffle maps array
    this._maps = [...mapsInMapList, ...mapsNotInDBObjects].map(a => ({ map: a, rand: Math.random() })).sort((a, b): number => a.rand - b.rand).map(a => a.map)
    void this.repo.add(...mapsNotInDBObjects)
  }

  /**
   * Sets the current map
   */
  static async setCurrent(): Promise<void> {
    // Get current map id from dedicated server
    const res: any[] | Error = await Client.call('GetCurrentChallengeInfo')
    if (res instanceof Error) {
      Logger.error('Unable to retrieve current map info.', res.message)
      return
    }
    const mapInfo: TMMap | undefined = this._maps.find(a => a.id === res[0].UId)
    if (mapInfo === undefined) {
      Logger.error('Failed to get map info from memory')
      return
    }
    // Set checkpointAmount and lapsAmount in runtime memory and database 
    // (this information can be acquired only if the map is currently played on the server so it is undefined if map was never played)
    if (mapInfo.checkpointsAmount === undefined || mapInfo.lapsAmount === undefined) {
      mapInfo.checkpointsAmount = res[0].NbCheckpoints
      mapInfo.lapsAmount = res[0].NbLaps
    }
    this._current = mapInfo as any
    void this.repo.setCpsAndLapsAmount(this._current.id, this._current.lapsAmount, this._current.checkpointsAmount)
  }

  /**
   * Sets vote ratios and counts for given maps. This method is called from VoteService
   * @param data Vote data objects
   */
  static setVoteData(...data: { uid: string, count: number, ratio: number }[]): void {
    for (const e of data) {
      const map = this._maps.find(a => a.id === e.uid)
      if (map === undefined) { continue }
      map.voteCount = e.count
      map.voteRatio = e.ratio
    }
  }

  /**
   * Sets the awards and leaderboard rating (from TMX). This method is called by TMXService on every map fetch
   * @param uid Map uid
   * @param awards Number of TMX awards
   * @param lbRating TMX leaderboard rating
   */
  static async setAwardsAndLbRating(uid: string, awards: number, lbRating: number): Promise<void> {
    const map = this._maps.find(a => a.id === uid)
    if (map === undefined) { return }
    map.awards = awards
    map.leaderboardRating = lbRating
    void this.repo.setAwardsAndLbRating(uid, awards, lbRating)
  }

  /**
   * Adds a map to the server
   * @param filename Path to the map file
   * @param caller Object containing login and nickname of the player who is adding the map
   * @returns Added map object or error if unsuccessful
   */
  static async add(filename: string, caller?: { login: string, nickname: string }): Promise<TMMap | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: filename }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert map ${filename}`) }
    const dbEntry: TMMap | undefined = await this.repo.getByFilename(filename)
    let obj: TMMap
    if (dbEntry !== undefined) { // If map is present in the database use the database info
      obj = { ...dbEntry }
    } else { // Otherwise fetch the info from server and save it in the database
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: filename }])
      if (res instanceof Error) { return res }
      const voteRatios = await this.repo.getVoteCountAndRatio(res[0].UId)
      const serverData = this.constructNewMapObject(res[0])
      obj = { ...serverData, voteCount: voteRatios?.count ?? 0, voteRatio: voteRatios?.ratio ?? 0 }
      void this.repo.add(obj)
    }
    this._maps.push(obj)
    if (caller !== undefined) {
      Logger.info(`${Utils.strip(caller.nickname)} (${caller.login}) added map ${Utils.strip(obj.name)} by ${obj.author}`)
    } else {
      Logger.info(`Map ${Utils.strip(obj.name)} by ${obj.author} added`)
    }
    const status: void | Error = await this.addToJukebox(obj.id, caller, true)
    if (status instanceof Error) {
      Logger.error(`Failed to insert newly added map ${obj.name} into the jukebox, clearing the jukebox to prevent further errors...`)
      this.clearJukebox()
    }
    Events.emitEvent('Controller.MapAdded', { ...obj, callerLogin: caller?.login })
    return obj
  }

  /**
   * Removes a map from the server
   * @param id Map uid
   * @param caller Object containing login and nickname of the player who is removing the map
   * @returns True if map was successfully removed, false if map was not in the map list, Error if server fails to remove the map
   */
  static async remove(id: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    const map: TMMap | undefined = this._maps.find(a => id === a.id)
    if (map === undefined) { return false }
    const remove: any[] | Error = await Client.call('RemoveChallenge', [{ string: map.fileName }])
    if (remove instanceof Error) { return remove }
    if (remove[0] === false) { return new Error(`Failed to remove map ${map.name} by ${map.author}`) }
    this._maps = this._maps.filter(a => a.id !== id)
    void this.repo.remove(id)
    if (caller !== undefined) {
      Logger.info(`${Utils.strip(caller.nickname)} (${caller.login}) removed map ${Utils.strip(map.name)} by ${map.author}`)
    } else {
      Logger.info(`Map ${Utils.strip(map.name)} by ${map.author} removed`)
    }
    Events.emitEvent('Controller.MapRemoved', { ...map, callerLogin: caller?.login })
    this.removeFromJukebox(id, caller)
    return true
  }

  /**
   * Puts current map into history array, changes current map and updates the queue
   */
  static async update(): Promise<void> {
    this._history.unshift(this._current)
    this._history.length = Math.min(this.historySize, this._history.length)
    await this.setCurrent()
    if (this._current.id === this._queue[0].map.id) {
      this._queue.shift()
      this.fillQueue()
    }
    await this.updateNextMap()
  }

  /**
   * Sends a dedicated server call to set next map to first map in queue
   * @returns True if map gets set, Error if it fails
   */
  private static async updateNextMap(): Promise<void> {
    const id: string = this._queue[0].map.id
    const map: TMMap | undefined = this._maps.find(a => a.id === id)
    if (map === undefined) { throw new Error(`Cant find map with id ${id} in memory`) }
    let res: any[] | Error = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    let i = 1
    while (res instanceof Error) {
      if (i === 4) {
        await Logger.fatal(`Failed to queue map ${map.name}.`, res.message)
      }
      Logger.error(`Server call to queue map ${map.name} failed. Try ${i}.`, res.message)
      res = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    }
    Logger.trace(`Next map set to ${Utils.strip(map.name)} by ${map.author}`)
  }

  /**
   * Adds a map to the queue
   * @param mapId Map UID
   * @param caller Object containing login and nickname of player adding the map
   * @param setAsNextMap If true map is going to be placed in front of the queue
   */
  static async addToJukebox(mapId: string, caller?: { login: string, nickname: string }, setAsNextMap?: true): Promise<void | Error> {
    const map: TMMap | undefined = MapService.maps.find(a => a.id === mapId)
    if (map === undefined) { return new Error(`Can't find map with id ${mapId} in memory`) }
    const index: number = setAsNextMap === true ? 0 : this._queue.findIndex(a => a.isForced === false)
    this._queue.splice(index, 0, { map: map, isForced: true, callerLogin: caller?.login })
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    await this.updateNextMap()
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) added map ${Utils.strip(map.name)} by ${map.author} to the jukebox`)
    } else {
      Logger.trace(`Map ${Utils.strip(map.name)} by ${map.author} has been added to the jukebox`)
    }
  }

  /**
   * Removes a map from the queue
   * @param mapId Map UID
   * @param caller Object containing login and nickname of player removing the map
   */
  static async removeFromJukebox(mapId: string, caller?: { login: string, nickname: string }): Promise<boolean> {
    if (!this._queue.filter(a => a.isForced === true).some(a => a.map.id === mapId)) { return false }
    const index: number = this._queue.findIndex(a => a.map.id === mapId)
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) removed map ${Utils.strip(this._queue[index].map.name)} by ${this._queue[index].map.author} from the jukebox`)
    } else {
      Logger.trace(`Map ${Utils.strip(this._queue[index].map.name)} by ${this._queue[index].map.author} has been removed from the jukebox`)
    }
    this._queue.splice(index, 1)
    this.fillQueue()
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    await this.updateNextMap()
    return true
  }

  /**
   * Removes all maps from jukebox
   * @param caller Object containing login and nickname of player clearing the jukebox
   */
  static async clearJukebox(caller?: { login: string, nickname: string }): Promise<void> {
    let n: number = this._queue.length
    for (let i: number = 0; i < n; i++) {
      if (this._queue[i].isForced) {
        this._queue.splice(i--, 1)
        n--
      }
    }
    this.fillQueue()
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    await this.updateNextMap()
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) cleared the jukebox`)
    } else {
      Logger.trace(`The jukebox has been cleared`)
    }
  }

  /**
   * Randomly changes the order of maps in the maplist
   * @param caller Object containing login and nickname of player who called the method
   */
  static async shuffle(caller?: { login: string, nickname: string }): Promise<void> {
    this._maps = this._maps.map(a => ({ map: a, rand: Math.random() })).sort((a, b): number => a.rand - b.rand).map(a => a.map)
    this._queue.length = 0
    this.fillQueue()
    Events.emitEvent('Controller.JukeboxChanged', this.queue)
    await this.updateNextMap()
    if (caller !== undefined) {
      Logger.info(`${Utils.strip(caller.nickname)} (${caller.login}) shuffled the maplist`)
    } else {
      Logger.info(`Maplist shuffled`)
    }
  }

  /**
   * Fills queue with maps until its size matches target queue length
   */
  private static fillQueue(): void {
    while (this._queue.length < this.queueSize) {
      let currentIndex: number = this._maps.findIndex(a => a.id === this._current.id)
      const lgt: number = this._maps.length
      let current: TMMap
      let i: number = 0
      do {
        i++
        current = this._maps[(i + currentIndex) % lgt]
        // Prevents adding maps in current queue and history unless there is less maps than queue size
      } while ([...this._queue.map(a => a.map), ...this._history, this._current].some(a => a.id === current.id) && i < lgt)
      if (current !== undefined) { this._queue.push({ map: current, isForced: false }) }
      // Adds first map from history to queue if there is not enough maps
      else { this._queue.push({ map: this._history[0], isForced: false }) }
    }
  }

  /**
   * Contstructs TMMap object from dedicated server response
   * @param info GetChallengeInfo dedicated server call response
   */
  private static constructNewMapObject(info: any): Omit<TMMap, 'voteCount' | 'voteRatio'> {
    // Translate mood to controller type (some maps have non standard mood or space in front of it)
    info.Mood = info.Mood.trim()
    if (!["Sunrise", "Day", "Sunset", "Night"].includes(info.Mood)) { // If map has non-standard mood set it to day
      info.Mood = 'Day'
    }
    // Translate Speed environment to Desert and Alpine to Snow
    if (info.Environnement === 'Speed') {
      info.Environnement = 'Desert'
    } else if (info.Environnement === 'Alpine') {
      info.Environnement = 'Snow'
    }
    return {
      id: info.UId,
      name: info.Name,
      fileName: info.FileName,
      author: info.Author,
      environment: info.Environnement,
      mood: info.Mood,
      bronzeTime: info.BronzeTime,
      silverTime: info.SilverTime,
      goldTime: info.GoldTime,
      authorTime: info.AuthorTime,
      copperPrice: info.CopperPrice,
      isLapRace: info.LapRace,
      lapsAmount: info.NbLaps === -1 ? undefined : info.NbLaps,
      checkpointsAmount: info.NbCheckpoints === -1 ? undefined : info.NbCheckpoints,
      addDate: new Date(),
      isNadeo: false,
      isClassic: false
    }
  }

  /**
   * Gets a map from current playlist. Playlist is stored in runtime memory
   * @param uid Map uid
   * @returns map object or undefined if map is not in the playlist
   */
  static get(uid: string): Readonly<TMMap> | undefined
  /**
   * Gets multiple maps from current playlist. Playlist is stored in runtime memory.
   * If some map is not present in memory it won't be returned. Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static get(uids: string[]): Readonly<TMMap>[]
  static get(uids: string | string[]): Readonly<TMMap> | Readonly<TMMap>[] | undefined {
    if (typeof uids === 'string') {
      return this._maps.find(a => a.id === uids)
    }
    return this._maps.filter(a => uids.includes(a.id))
  }

  /**
   * Fetches a map from the database. This method should be used to get maps which are not in the current Match Settings
   * @param uid Map uid
   * @returns Map object or undefined if map is not in the database
   */
  static fetch(uid: string): Promise<TMMap | undefined>
  /**
   * Fetches multiple maps from the database. This method should be used to get maps which are not in the current Match Settings
   * If some map is not present in the database it won't be returned. Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Map objects array
   */
  static async fetch(uids: string[]): Promise<TMMap[]>
  static async fetch(uids: string | string[]): Promise<TMMap | undefined | TMMap[]> {
    if (typeof uids === 'string') {
      const data = await this.repo.get(uids)
      if (data === undefined) { return undefined }
      const v = await this.repo.getVoteCountAndRatio(uids)
      return { ...data, voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0 }
    }
    const data = await this.repo.get(uids)
    const ret: TMMap[] = []
    const voteRatios = await this.repo.getVoteCountAndRatio(uids)
    for (const e of data) {
      const v = voteRatios.find(a => a.uid === e.id)
      ret.push({ ...e, voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0 })
    }
    return ret
  }

  /**
   * Gets a map from queue
   * @param uid Map uid
   * @returns Map object or undefined if map is not in the queue
   */
  static getFromQueue(uid: string): Readonly<TMMap> | undefined
  /**
   * Gets multiple maps from queue. If some map is not present in queue it won't be returned.
   * Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static getFromQueue(uids: string[]): Readonly<TMMap>[]
  static getFromQueue(uids: string | string[]): Readonly<TMMap> | Readonly<TMMap>[] | undefined {
    if (typeof uids === 'string') {
      return this._queue.find(a => a.map.id === uids)?.map
    }
    return this._queue.filter(a => uids.includes(a.map.id)).map(a => a.map)
  }

  /**
   * Gets a map from map history
   * @param uid Map uid
   * @returns Map object or undefined if map is not in the history
   */
  static getFromHistory(uid: string): Readonly<TMMap> | undefined
  /**
   * Gets multiple maps from map history. If some map is not present in history it won't be returned.
   * Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static getFromHistory(uids: string[]): Readonly<TMMap>[]
  static getFromHistory(uids: string | string[]): Readonly<TMMap> | Readonly<TMMap>[] | undefined {
    if (typeof uids === 'string') {
      return this._history.find(a => a.id === uids)
    }
    return this._history.filter(a => uids.includes(a.id))
  }

  /**
   * Gets a map from jukebox
   * @param uid Map uid
   * @returns jukebox object or undefined if map is not in the jukeboxed
   */
  static getFromJukebox(uid: string): Readonly<{ map: TMMap, callerLogin?: string }> | undefined
  /**
   * Gets multiple maps from jukebox. If some map is not present in jukebox it won't be returned. 
   * Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of jukebox objects
   */
  static getFromJukebox(uids: string[]): Readonly<{ map: TMMap, callerLogin?: string }>[]
  static getFromJukebox(uids: string | string[]): Readonly<{ map: TMMap, callerLogin?: string }> | Readonly<{ map: TMMap, callerLogin?: string }>[] | undefined {
    if (typeof uids === 'string') {
      const obj = this._queue.find(a => a.map.id === uids && a.isForced === true)
      return obj === undefined ? undefined : { map: obj.map, callerLogin: obj.callerLogin }
    }
    return this._queue.filter(a => uids.includes(a.map.id) && a.isForced === true).map(a => ({ map: a.map, callerLogin: a.callerLogin }))
  }

  /**
   * @returns Currently played map
   */
  static get current(): Readonly<TMCurrentMap> {
    return this._current
  }

  /**
   * @returns All maps from current playlist
   */
  static get maps(): Readonly<TMMap>[] {
    return [...this._maps]
  }

  /**
   * @returns Amount of maps in current playlist
   */
  static get mapCount(): number {
    return this._maps.length
  }

  /**
   * @returns All maps from jukebox
   */
  static get jukebox(): ({ map: TMMap, callerLogin?: string })[] {
    return this._queue.filter(a => a.isForced === true).map(a => ({ map: a.map, callerLogin: a.callerLogin }))
  }

  /**
   * @returns Number of maps in jukebox
   */
  static get jukeboxCount(): number {
    return this._queue.filter(a => a.isForced === true).length
  }

  /**
   * @returns All maps from queue
   */
  static get queue(): Readonly<TMMap>[] {
    return [...this._queue.map(a => a.map)]
  }

  /**
   * @returns All maps from map history
   */
  static get history(): Readonly<TMMap>[] {
    return [...this._history]
  }

  /**
   * @returns Number of maps in map history
   */
  static get historyCount(): number {
    return this._history.length
  }

}
