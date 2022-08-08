import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { Events } from '../Events.js'

/**
 * This service manages maps in current server Match Settings and maps table in the database
 */
export class MapService {

  private static _current: TMCurrentMap
  private static _maps: TMMap[] = []
  private static readonly repo = new MapRepository()

  /**
   * Creates maplist, sets current map and adds a proxy for Match Settings update
   */
  static async initialize(): Promise<void> {
    await this.repo.initialize()
    await this.createList()
    await this.setCurrent()
    // Recreate list when Match Settings get changed
    Client.addProxy(['LoadMatchSettings'], async (): Promise<void> => {
      this._maps.length = 0
      await this.createList()
      Events.emitEvent('Controller.MatchSettingsUpdated', this._maps)
    })
  }

  /**
   * Download all the maps from the server and store them in the list
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
    const DBMapList: TMMap[] = await this.repo.getAll()
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    if (mapsNotInDB.length > 100) { // TODO implement progress bar here perhaps (?)
      Logger.warn(`Large amount of maps (${mapsNotInDB.length}) present in maplist are not in the database. Fetching maps might take a few minutes...`)
    }
    const mapsNotInDBObjects: TMMap[] = []
    // Fetch info and add all maps which were not present in the database
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.fatal(`Unable to retrieve map info for map id: ${c.id}, filename: ${c.fileName}`, res.message)
        return
      }
      mapsNotInDBObjects.push(this.constructNewMapObject(res[0]))
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
   * @param callerLogin Login of the player who is adding the map
   * @returns Added map object or error if unsuccessful
   */
  static async add(filename: string, callerLogin?: string): Promise<TMMap | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: filename }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert map ${filename}`) }
    const dbEntry: TMMap | undefined = await this.repo.getByFilename(filename)
    let obj: TMMap
    if (dbEntry !== undefined) { // If map is present in the database use the database info
      obj = dbEntry
    } else { // Otherwise fetch the info from server and save it in the database
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: filename }])
      if (res instanceof Error) { return res }
      obj = this.constructNewMapObject(res[0])
      void this.repo.add(obj)
    }
    this._maps.push(obj)
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} added map ${obj.name} by ${obj.author}`)
    } else {
      Logger.info(`Map ${obj.name} by ${obj.author} added`)
    }
    Events.emitEvent('Controller.MapAdded', { ...obj, callerLogin })
    return obj
  }

  /**
   * Removes a map from the server
   * @param id Map uid
   * @param callerLogin Login of the player who is removing the map
   * @returns True if map was successfully removed, false if map was not in the map list, Error if server fails to remove the map
   */
  static async remove(id: string, callerLogin?: string): Promise<boolean | Error> {
    const map: TMMap | undefined = this._maps.find(a => id === a.id)
    if (map === undefined) { return false }
    const remove: any[] | Error = await Client.call('RemoveChallenge', [{ string: map.fileName }])
    if (remove instanceof Error) { return remove }
    if (remove[0] === false) { return new Error(`Failed to remove map ${map.name} by ${map.author}`) }
    this._maps = this._maps.filter(a => a.id !== id)
    void this.repo.remove(id)
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} removed map ${map.name} by ${map.author}`)
    } else {
      Logger.info(`Map ${map.name} by ${map.author} removed`)
    }
    Events.emitEvent('Controller.MapRemoved', { ...map, callerLogin })
    return true
  }

  /**
   * Sends a dedicated server call to set next map to given map id
   * @param id Map id
   * @returns True if map gets set, Error if it fails
   */
  static async setNextMap(id: string): Promise<true | Error> {
    const map: TMMap | undefined = this._maps.find(a => a.id === id)
    if (map === undefined) { return new Error(`Cant find map with id ${id} in memory`) }
    const res: any[] | Error = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    if (res instanceof Error) { return new Error(`Failed to queue map ${map.name}`) }
    Logger.trace(`Next map set to ${map.name} by ${map.author}`)
    return true
  }

  /**
   * Randomly changes the order of maps in the maplist
   * @param callerLogin Login of player who called the method
   */
  static shuffle(callerLogin?: string): void {
    this._maps = this._maps.map(a => ({ map: a, rand: Math.random() })).sort((a, b): number => a.rand - b.rand).map(a => a.map)
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} shuffled the maplist`)
    } else {
      Logger.info(`Maplist shuffled`)
    }
  }

  /**
   * Contstructs TMMap object from dedicated server response
   * @param info GetChallengeInfo dedicated server call response
   */
  private static constructNewMapObject(info: any): TMMap {
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
      addDate: new Date()
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
  static fetch(uids: string[]): Promise<TMMap[]>
  static fetch(uids: string | string[]): Promise<TMMap | undefined | TMMap[]> {
    return this.repo.get(uids as any)
  }

  /**
   * @returns Currently played map
   */
  static get current(): Readonly<TMCurrentMap> {
    return this._current
  }

  /**
   * @returns All maps from current playlist. This method creates copy of maps array
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

}
