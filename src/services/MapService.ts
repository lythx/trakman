import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { Events } from '../Events.js'
import { Utils } from '../Utils.js'
import config from '../../config/Config.js'
import { GameService } from './GameService.js'
import { ManualMapLoading } from './ManualMapLoading.js'

interface JukeboxMap {
  readonly map: tm.Map
  readonly isForced: boolean
  readonly callerLogin?: string
}

/**
 * This service manages maps in current server Match Settings and maps table in the database
 */
export class MapService {

  private static _current: tm.CurrentMap
  private static _maps: tm.Map[] = []
  private static readonly repo = new MapRepository()
  private static readonly _queue: JukeboxMap[] = []
  private static readonly _history: tm.Map[] = []
  private static readonly stadium: boolean = config.manualMapLoading.stadiumOnly !== undefined ? config.manualMapLoading.stadiumOnly : process.env.SERVER_PACKMASK === 'nations'
  /** Amount of maps in the queue. */
  static readonly queueSize: number = config.jukeboxQueueSize
  /** Max amount of maps in the history. */
  static readonly historySize: number = config.jukeboxHistorySize

  /**
   * Creates maplist, sets current map and adds a proxy for Match Settings update
   */
  static async initialize(): Promise<void> {
    await this.repo.enableClient()
    await this.createList()
    await this.setCurrent()
    this.fillQueue()
    await this.writeMatchSettings()
    await this.updateNextMap()
    // Recreate list when Match Settings get changed only with non-dynamic map loading
    if (!config.manualMapLoading.enabled) {
      Client.addProxy(['LoadMatchSettings'], async (): Promise<void> => {
        this._maps.length = 0
        await this.createList()
        this.clearJukebox()
        Events.emit('MatchSettingsUpdated', this._maps)
      })
    }
  }

  /**
   * Write MatchSettings file if dynamic map loading is enabled
   */
  private static async writeMatchSettings() {
    if (config.manualMapLoading.enabled) {
      await ManualMapLoading.writeMS(this._current, this._queue.map(a => a.map))
    }
  }

  /**
   * Downloads all the maps from the server and store them in the list.
   * If Manual map loading is enabled, just gets the maps from the database:
   * to import new maps, use `updateList()` or `//updatemaps` in-game.
   */
  private static async createList(): Promise<void> {
    const current = await Client.call('GetCurrentChallengeInfo')
    if (current instanceof Error) {
      Logger.fatal('Error while getting the current map', current.message)
      return
    }
    if (config.manualMapLoading.enabled) {
      const list = await this.repo.getAll(this.stadium)
      if (list.findIndex(a => a.id === current.UId) === -1) {
        const v = await this.repo.getVoteCountAndRatio(current.UId)
        const currObj: tm.Map = {
          ...this.constructNewMapObject(current), voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0
        }
        list.push(currObj)
        await this.repo.add(currObj)
      }
      const fileNames = new Set(await ManualMapLoading.getFileNames())
      this._maps = list.filter(a => fileNames.has(a.fileName)).map(a => ({ map: a, rand: Math.random() }))
        .sort((a, b): number => a.rand - b.rand).map(a => a.map)
      return
    }
    const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
    if (mapList instanceof Error) {
      Logger.fatal('Error while getting the map list', mapList.message)
      return
    }
    // Add current map to maplist if it isn't present there
    if (!mapList.some(a => a.UId === current.UId)) {
      mapList.unshift(current)
      const insert: any | Error = await Client.call('InsertChallenge', [{ string: current.FileName }])
      if (insert instanceof Error && !insert.message.includes('already added.')) {
        await Logger.fatal('Failed to insert current challenge', insert)
      }
    }
    const DBMapList: tm.Map[] = (await this.repo.getAll())
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    if (mapsNotInDB.length > 100) {
      Logger.warn(
        `Large amount of maps (${mapsNotInDB.length}) present in maplist are not in the database. Fetching maps might take a few minutes...`)
    }
    const mapsNotInDBObjects: tm.Map[] = []
    // Fetch info and add all maps which were not present in the database
    const voteRatios = await this.repo.getVoteCountAndRatio(mapsNotInDB.map(a => a.UId))
    for (const c of mapsNotInDB) {
      const res: any | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.error(`Unable to retrieve map info for map id: ${c.UId}, filename: ${c.FileName}`, res.message)
        return
      }
      const v = voteRatios.find(a => a.uid === c.UId)
      mapsNotInDBObjects.push(
        ({ ...this.constructNewMapObject(res), voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0 }))
    }
    const mapsInMapList: tm.Map[] = []
    // From maps that were present in the database add only ones that are in current Match Settings
    for (const map of DBMapList) {
      if (mapList.some(a => a.UId === map.id)) {
        mapsInMapList.push(map)
      }
    }
    // Shuffle maps array
    this._maps = [...mapsInMapList, ...mapsNotInDBObjects].map(a => ({ map: a, rand: Math.random() }))
      .sort((a, b): number => a.rand - b.rand).map(a => a.map)
    await this.repo.splitAdd(mapsNotInDBObjects)
  }

  /**
   * Updates map list based on the current Match Settings.
   * If Manual map loading is enabled, parses every map in the given directories and adds them to the server.
   */
  static async updateList(): Promise<void> {
    let addedMapObjects: tm.Map[] = []
    const removedMaps: string[] = []
    if (config.manualMapLoading.enabled) {
      const lists = await ManualMapLoading.parseMaps(this._maps)
      const mapIds = lists[0]
      addedMapObjects = Array.from(lists[1])
      Logger.info('Parsed maps')
      const addedMapIds = new Set(addedMapObjects.map(a => a.id))
      // fast difference of maps and remaining
      const mapSet = new Set(this._maps.map(a => a.id))
      for (const v of mapIds.values()) {
        if (!addedMapIds.delete(v) && !mapSet.delete(v)) {
          removedMaps.push(v)
        }
      }
      mapSet.forEach(v => removedMaps.push(v))
      if (addedMapObjects.length === 0 && removedMaps.length === 0) {
        return
      }
      addedMapObjects.forEach(a => this._maps.push(a))
    } else {
      const serverMaps: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
      if (serverMaps instanceof Error) {
        Logger.error('Error while getting the map list', serverMaps.message)
        return
      }
      const maps = [...this._maps]
      maps.sort((a, b) => a.id.localeCompare(b.id))
      serverMaps.sort((a, b) => a.UId.localeCompare(b.UId))
      const addedMaps: any[] = []
      // faster algorithm for finding added and removed maps
      let i = 0
      let j = 0
      while (i < maps.length && j < serverMaps.length) {
        if (maps[i].id.localeCompare(serverMaps[j].UId) < 0) {
          removedMaps.push(maps[i].id)
          i++
        } else if (maps[i].id === serverMaps[j].UId) {
          i++
          j++
        } else {
          addedMaps.push(serverMaps[j])
          j++
        }
      }
      while (j < serverMaps.length) {
        addedMaps.push(serverMaps[j])
        j++
      }
      while (i < maps.length) {
        removedMaps.push(maps[i].id)
        i++
      }
      if (addedMaps.length === 0 && removedMaps.length === 0) {
        return
      }
      for (const e of addedMaps) {
        const dbEntry: tm.Map | undefined = await this.repo.getByFilename(e.FileName)
        let obj: tm.Map
        if (dbEntry !== undefined) { // If map is present in the database use the database info
          obj = { ...dbEntry }
        } else { // Otherwise fetch the info from server and save it in the database
          const res: any | Error = await Client.call('GetChallengeInfo', [{ string: e.FileName }])
          if (res instanceof Error) {
            Logger.error(`Failed to retrieve map info. Filename: ${e.FileName}`)
            continue
          }
          const voteRatios = await this.repo.getVoteCountAndRatio(e.UId)
          const serverData = this.constructNewMapObject(res)
          obj = { ...serverData, voteCount: voteRatios?.count ?? 0, voteRatio: voteRatios?.ratio ?? 0 }
        }
        this._maps.push(obj)
        addedMapObjects.push(obj)
      }
    }

    await this.repo.splitAdd(addedMapObjects)
    await this.repo.splitRemove(removedMaps)
    removedMaps.forEach(a => void this.remove(a))
    await this.writeMatchSettings()
    Events.emit('MapAdded', addedMapObjects)
  }

  /**
   * Sets the current map
   */
  static async setCurrent(_try = 1): Promise<void> {
    // Get current map id from dedicated server
    const res: any | Error = await Client.call('GetCurrentChallengeInfo')
    if (res instanceof Error) {
      await Logger.fatal('Unable to retrieve current map info.', res.message)
      return
    }
    const mapInfo: Partial<{ -readonly [K in keyof tm.CurrentMap]: tm.CurrentMap[K] }> | undefined = this._maps.find(
      a => a.id === res.UId)
    if (mapInfo === undefined) {
      Logger.error('Failed to get map info from memory, trying again... ', _try, '/3')
      await this.add(res.FileName, undefined, true)
      if (_try > 3) {
        await Logger.fatal('Failed to get map info from memory')
        return
      }
      await this.setCurrent(_try + 1)
      return
    }
    // Set checkpointAmount and lapsAmount in runtime memory and database 
    // (this information can be acquired only if the map is currently played on the server so it is undefined if map was never played)
    if (mapInfo.checkpointsPerLap === undefined || mapInfo.defaultLapsAmount === undefined) {
      mapInfo.checkpointsPerLap = res.NbCheckpoints
      mapInfo.defaultLapsAmount = res.NbLaps
    }
    const obj = this.getLapsAndCheckpointsAmount(res.NbCheckpoints, res.NbLaps, res.LapRace)
    mapInfo.checkpointsAmount = obj.checkpoints
    mapInfo.lapsAmount = obj.laps
    mapInfo.isInLapsMode = obj.isInLapsMode
    mapInfo.isLapsAmountModified = obj.isLapsAmountModified
    this._current = mapInfo as tm.CurrentMap
    if (this._history[0] === undefined) {
      Logger.info(`Current map set to ${Utils.strip(this._current.name)} by ${this._current.author}`)
    } else {
      Logger.info(
        `Current map changed to ${Utils.strip(this._current.name)} by ${this._current.author}` + ` from ${Utils.strip(
          this._history[0].name)} by ${this._history[0].author}.`)
    }
    void this.repo.setCpsAndLapsAmount(this._current.id, this._current.defaultLapsAmount,
      this._current.checkpointsPerLap)
  }

  /**
   * Sets vote ratios and counts for given maps. This method is called from VoteService
   * @param data Vote data objects
   */
  static setVoteData(...data: { uid: string, count: number, ratio: number }[]): void {
    for (const e of data) {
      const map = this._maps.find(a => a.id === e.uid)
      if (map === undefined) {
        continue
      }
      map.voteCount = e.count
      map.voteRatio = e.ratio
    }
  }

  /**
   * Sets the awards and leaderboard rating (from TMX). This method is called by TMXFetcher on every map fetch
   * @param uid Map uid
   * @param awards Number of TMX awards
   * @param lbRating TMX leaderboard rating
   */
  static async setAwardsAndLbRating(uid: string, awards: number, lbRating: number): Promise<void> {
    const map = this._maps.find(a => a.id === uid)
    if (map === undefined) {
      return
    }
    map.awards = awards
    map.leaderboardRating = lbRating
    void this.repo.setAwardsAndLbRating(uid, awards, lbRating)
  }

  /**
   * Adds a map to the server and to the jukebox. Map needs to be present in the server files.
   * @param filename Path to the map file
   * @param caller Object containing login and nickname of the player who is adding the map
   * @param dontJuke If true the map doesn't get enqueued, false by default
   * @returns Added map object or error if unsuccessful
   */
  static async add(filename: string, caller?: {
    login: string, nickname: string
  }, dontJuke = false): Promise<tm.Map | Error> {
    if (!config.manualMapLoading.enabled) {
      const insert: any | Error = await Client.call('InsertChallenge', [{ string: filename }])
      if (insert instanceof Error) {
        return insert
      }
      if (insert === false) {
        return new Error(`Failed to insert map ${filename}`)
      }
    }
    const dbEntry: tm.Map | undefined = await this.repo.getByFilename(filename)
    let obj: tm.Map
    if (dbEntry !== undefined) { // If map is present in the database use the database info
      obj = { ...dbEntry }
    } else { // Otherwise fetch the info from server and save it in the database
      let res
      if (config.manualMapLoading.enabled) {
        const map = await ManualMapLoading.parseMap(filename, new Set(this._maps.map(a => a.id)))
        if (map instanceof Error) {
          return map
        }
        if (typeof map === 'string') {
          return Error('Challenge already added. Code: -1000')
        }
        if ((map as tm.ServerMap).UId === undefined) {
          return Error('Could not parse map with filename ' + filename)
        }
        res = map as tm.ServerMap
      } else {
        const map: any | Error = await Client.call('GetChallengeInfo', [{ string: filename }])
        if (map instanceof Error) {
          return map
        }
        res = map
      }
      const voteRatios = await this.repo.getVoteCountAndRatio(res.UId)
      const serverData = this.constructNewMapObject(res)
      obj = { ...serverData, voteCount: voteRatios?.count ?? 0, voteRatio: voteRatios?.ratio ?? 0 }
      void this.repo.add(obj)
    }
    this._maps.push(obj)
    if (caller !== undefined) {
      Logger.info(
        `${Utils.strip(caller.nickname)} (${caller.login}) added map ${Utils.strip(obj.name)} by ${obj.author}`)
    } else {
      Logger.info(`Map ${Utils.strip(obj.name)} by ${obj.author} added`)
    }
    if (!dontJuke) {
      const status = await this.addToJukebox(obj.id, caller)
      if (status instanceof Error) {
        Logger.error(
          `Failed to insert newly added map ${obj.name} into the jukebox, clearing the jukebox to prevent further errors...`)
        this.clearJukebox()
      }
    }
    Events.emit('MapAdded', { ...obj, callerLogin: caller?.login })
    return obj
  }

  /**
   * Writes a map file to the server, adds it to the current Match Settings and to the jukebox.
   * @param fileName Map file name (file will be saved with this name on the server)
   * @param file Map file buffer
   * @param caller Object containing login and nickname of the player who is adding the map
   * @param options Optional parameters:
   * @option `dontJuke` - If true the map doesn't get enqueued, false by default
   * @option `cancelIfAlreadyAdded` - If the map was already on the server returns from the function without searching for the map object.
   * If that happens the map in returned object will be undefined.
   * @returns Error if unsuccessful, object containing map object and boolean indicating whether the map was already on the server
   */
  static async writeFileAndAdd<T>(fileName: string, file: Buffer, caller?: { nickname: string, login: string },
    options?: { dontJuke?: boolean, cancelIfAlreadyAdded?: T }): Promise<T extends true ? ({ map?: tm.Map, wasAlreadyAdded: boolean } | Error) : ({ map: tm.Map, wasAlreadyAdded: boolean } | Error)> {
    if (file.BYTES_PER_ELEMENT * file.length >= 1_048_576) { // Dedicated server hangs if the map file is greater than 1MB
      return new Error(`Map file too big.`)
    }
    const base64String: string = file.toString('base64')
    const extension = '.Challenge.Gbx'
    fileName = fileName.slice(0, -extension.length) + '_' + String(Date.now()) + extension
    // add map directory to filename and sanitise
    const path = (config.manualMapLoading.enabled ? config.manualMapLoading.mapsDirectory : '') + fileName.replace(
      /[^a-z0-9.]/gi, '_')
    const write: any | Error = await Client.call('WriteFile', [{ string: path }, { base64: base64String }])
    if (write instanceof Error) {
      return new Error(`Failed to write map file ${path}.`)
    }
    const map: tm.Map | Error = await this.add(path, caller, options?.dontJuke)
    if ((options as any)?.cancelIfAlreadyAdded === true && map instanceof Error) {
      return { wasAlreadyAdded: true } as any
    }
    if (map instanceof Error) {
      // Yes we actually need to do this in order to juke a map if it was on the server already
      if (map.message.trim() === 'Challenge already added. Code: -1000') {
        const content: string = file.toString()
        let i = 0
        while (i < content.length) {
          if (content.substring(i, i + 12) === `<ident uid="`) {
            const id = content.match(/<ident uid=".*?"/gm)?.[0].slice(12, -1)
            if (id === undefined) {
              return new Error(`Map ${path} has no uid`)
            }
            const map: tm.Map | undefined = this._maps.find(a => a.id === id)
            if (map === undefined) {
              return new Error(`Failed to queue map ${path}`)
            }
            if (options?.dontJuke !== true) {
              this.addToJukebox(id, caller)
            }
            return { wasAlreadyAdded: true, map }
          }
          i++
        }
      }
      return new Error(`Failed to queue map ${path}`)
    }
    return { wasAlreadyAdded: false, map }
  }

  /**
   * Removes a map from the server
   * @param id Map uid
   * @param caller Object containing login and nickname of the player who is removing the map
   * @returns True if map was successfully removed, false if map was not in the map list, Error if server fails to remove the map
   */
  static async remove(id: string, caller?: { login: string, nickname: string }): Promise<boolean | Error> {
    const map: tm.Map | undefined = this._maps.find(a => id === a.id)
    await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }]) // I HAVE NO CLUE HOW IT WORKS WITH THIS
    if (map === undefined) {
      return false
    }
    if (!config.manualMapLoading.enabled) {
      const remove: any | Error = await Client.call('RemoveChallenge', [{ string: map.fileName }])
      if (remove instanceof Error) {
        return remove
      }
      if (remove === false) {
        return new Error(`Failed to remove map ${map.name} by ${map.author}`)
      }
    }
    this._maps = this._maps.filter(a => a.id !== id)
    void this.repo.remove(id)
    if (caller !== undefined) {
      Logger.info(
        `${Utils.strip(caller.nickname)} (${caller.login}) removed map ${Utils.strip(map.name)} by ${map.author}`)
    } else {
      Logger.info(`Map ${Utils.strip(map.name)} by ${map.author} removed`)
    }
    Events.emit('MapRemoved', { ...map, callerLogin: caller?.login })
    await this.removeFromQueue(id, caller, false)
    //await this.writeMatchSettings()
    return true
  }

  /**
   * Puts current map into history array, changes current map and updates the queue
   */
  static async update(): Promise<void> {
    if (config.manualMapLoading.enabled) {
      await ManualMapLoading.nextMap(this._current, this._queue.map(a => a.map))
    }
    this._history.unshift(this._current)
    this._history.length = Math.min(this.historySize, this._history.length)
    await this.setCurrent()
    if (this._current.id === this._queue[0].map.id) {
      this._queue.shift()
      this.fillQueue()
    }
    Events.emit('JukeboxChanged', this.jukebox.map(a => a.map))
    await this.updateNextMap()
  }

  static restartMap() {
    const obj = this.getLapsAndCheckpointsAmount(this._current.checkpointsPerLap, this._current.defaultLapsAmount,
      this._current.isLapRace)
    // Avoid reference errors
    this._current = {
      ...this._current, checkpointsAmount: obj.checkpoints, lapsAmount: obj.laps, isInLapsMode: obj.isInLapsMode,
      isLapsAmountModified: obj.isLapsAmountModified
    }
    Logger.info(`Map ${Utils.strip(this._current.name)} by ${this._current.author} restarted.`)
  }

  /**
   * Sends a dedicated server call to set next map to first map in queue
   * @returns True if map gets set, Error if it fails
   */
  private static async updateNextMap(): Promise<void> {
    const id: string = this._queue[0].map.id
    const map: tm.Map | undefined = this._maps.find(a => a.id === id)
    if (map === undefined) {
      throw new Error(`Cant find map with id ${id} in memory`)
    }
    let res: any | Error = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    let i = 1
    while (res instanceof Error) {
      if (i > 1) {
        Logger.error(`Server call to queue map ${map.name} failed. Try ${i - 1}.`, res.message)
      }
      if (i === 4) {
        Logger.error(`Failed to queue map ${map.name}. Removing and shuffling queue.`, res.message)
        await this.remove(map.id)
        await this.shuffle()
        return
      }
      i++
      const list = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
      if (list instanceof Error) {
        continue
      }
      const fileName = list.find((a: any) => a.UId === map.id)?.FileName
      if (fileName === undefined) {
        continue
      }
      this.repo.setFileName(map.id, fileName)
      res = await Client.call('ChooseNextChallenge', [{ string: fileName }])
    }
    Logger.trace(`Next map set to ${Utils.strip(map.name)} by ${map.author} `)
  }

  /**
   * Adds a map to the queue
   * @param mapId Map UID
   * @param caller Object containing login and nickname of player adding the map
   * @param setAsNextMap If true map is going to be placed in front of the queue
   * @returns True if successful, False if the map is already juked, Error if map is not in the memory
   */
  static async addToJukebox(mapId: string, caller?: {
    login: string, nickname: string
  }, setAsNextMap = false): Promise<boolean | Error> {
    if (this.jukebox.some(a => a.map.id === mapId)) {
      return false
    }
    const map: tm.Map | undefined = this._maps.find(a => a.id === mapId)
    if (map === undefined) {
      return new Error(`Can't find map with id ${mapId} in memory`)
    }
    const qi = this._queue.findIndex(a => !a.isForced)
    const index: number = setAsNextMap ? 0 : (qi === -1 ? this._queue.length : qi)
    this._queue.splice(index, 0, { map: map, isForced: true, callerLogin: caller?.login })
    Events.emit('JukeboxChanged', this.jukebox.map(a => a.map))
    await this.writeMatchSettings()
    void this.updateNextMap()
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) added map ${Utils.strip(
        map.name)} by ${map.author} to the jukebox`)
    } else {
      Logger.trace(`Map ${Utils.strip(map.name)} by ${map.author} has been added to the jukebox`)
    }
    return true
  }

  /**
   * Remove a map from the queue
   * @param mapId Map UID
   * @param caller Object containing login and nickname of player removing the map
   * @param jukebox If true, only removes the map if it is in the jukebox
   * @returns The boolean representing whether the map was removed
   */
  static async removeFromQueue(mapId: string, caller?: {
    login: string, nickname: string
  }, jukebox = true): Promise<boolean> {
    if (jukebox && !this._queue.filter(a => a.isForced).some(a => a.map.id === mapId)) {
      return false
    }
    const index: number = this._queue.findIndex(a => a.map.id === mapId)
    if (index === -1) {
      return false
    }
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) removed map ${Utils.strip(
        this._queue[index].map.name)} by ${this._queue[index].map.author} from the ${jukebox ? 'jukebox' : 'queue'}`)
    } else {
      Logger.trace(`Map ${Utils.strip(
        this._queue[index].map.name)} by ${this._queue[index].map.author} has been removed from the ${jukebox ? 'jukebox' : 'queue'}`)
    }
    this._queue.splice(index, 1)
    this.fillQueue()
    await this.writeMatchSettings()
    void this.updateNextMap()
    Events.emit('JukeboxChanged', this.jukebox.map(a => a.map))
    return true
  }

  /**
   * Removes all maps from jukebox
   * @param caller Object containing login and nickname of player clearing the jukebox
   */
  static async clearJukebox(caller?: { login: string, nickname: string }): Promise<void> {
    let n: number = this._queue.length
    for (let i = 0; i < n; i++) {
      if (this._queue[i].isForced) {
        this._queue.splice(i--, 1)
        n--
      }
    }
    this.fillQueue()
    Events.emit('JukeboxChanged', this.jukebox.map(a => a.map))
    this.writeMatchSettings()
    await this.updateNextMap()
    if (caller !== undefined) {
      Logger.trace(`${Utils.strip(caller.nickname)} (${caller.login}) cleared the jukebox`)
    } else {
      Logger.trace(`The jukebox has been cleared`)
    }
  }

  /**
   * Randomly changes the order of maps in the maplist
   * @param caller Object containing login and nickname of the player who called the method
   */
  static async shuffle(caller?: { login: string, nickname: string }): Promise<void> {
    this._maps = this._maps.map(a => ({
      map: a, rand: Math.random()
    })).sort((a, b): number => a.rand - b.rand).map(a => a.map)
    this._queue.length = 0
    this.fillQueue()
    if (config.manualMapLoading.enabled) {
      await ManualMapLoading.writeMS(this._current, this._queue.map(a => a.map))
    }
    Events.emit('JukeboxChanged', this.jukebox.map(a => a.map))
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
    const currentIndex: number = this._maps.findIndex(a => a.id === this._current.id)
    while (this._queue.length < Math.min(this.queueSize + this._history.length + 1, this._maps.length)) {
      const lgt: number = this._maps.length
      let current: tm.Map
      let i = 0
      do {
        i++
        current = this._maps[(i + currentIndex) % lgt]
        // Prevents adding maps in current queue and history unless there is less maps than queue size
      } while ((this._queue.some(a => a.map.id === current.id) || this._history.some(
        a => a.id === current.id) || current.id === this._current.id) && i < lgt)
      this._queue.push({ map: current, isForced: false })
    }
  }

  private static getLapsAndCheckpointsAmount(checkpointsPerLap: number, defaultLapAmount: number, isLapRace: boolean): {
    laps: number, checkpoints: number, isInLapsMode: boolean, isLapsAmountModified: boolean
  } {
    let isLapsAmountModified = false
    if (GameService.gameMode === 'TimeAttack' || GameService.gameMode === 'Stunts' || !isLapRace) {
      return { checkpoints: checkpointsPerLap, laps: 1, isInLapsMode: false, isLapsAmountModified }
    }
    let laps = defaultLapAmount
    if ((GameService.gameMode === 'Rounds' || GameService.gameMode === 'Cup' || GameService.gameMode === 'Teams') && GameService.config.roundsModeLapsAmount !== 0) {
      laps = GameService.config.roundsModeLapsAmount
      if (defaultLapAmount !== laps) { // Check if modified value is different from default one
        isLapsAmountModified = true
      }
    }
    if (GameService.gameMode === 'Laps') {
      laps = GameService.config.lapsModeLapsAmount
      isLapsAmountModified = true
    }
    return { checkpoints: laps * checkpointsPerLap, laps, isInLapsMode: true, isLapsAmountModified }
  }

  /**
   * Constructs tm.Map object from dedicated server response
   * @param info GetChallengeInfo dedicated server call response
   */
  public static constructNewMapObject(info: any): Omit<tm.Map, 'voteCount' | 'voteRatio'> {
    // Translate mood to controller type (some maps have non-standard mood or space in front of it)
    info.Mood = info.Mood.trim()
    if (!['Sunrise', 'Day', 'Sunset', 'Night'].includes(info.Mood)) { // If map has non-standard mood set it to day
      info.Mood = 'Day'
    }
    // Translate Speed environment to Desert and Alpine to Snow
    if (info.Environnement === 'Speed') {
      info.Environnement = 'Desert'
    } else if (info.Environnement === 'Alpine') {
      info.Environnement = 'Snow'
    }
    return {
      id: info.UId, name: info.Name, fileName: info.FileName, author: info.Author, environment: info.Environnement,
      mood: info.Mood, bronzeTime: info.BronzeTime, silverTime: info.SilverTime, goldTime: info.GoldTime,
      authorTime: info.AuthorTime, copperPrice: info.CopperPrice,
      isLapRace: info.LapRace === undefined ? info.NbLaps > 0 : info.LapRace,
      defaultLapsAmount: info.NbLaps === -1 ? undefined : info.NbLaps,
      checkpointsPerLap: info.NbCheckpoints === -1 ? undefined : info.NbCheckpoints, addDate: new Date(),
      isNadeo: false, isClassic: false
    }
  }

  /**
   * Gets a map from current playlist. Playlist is stored in runtime memory
   * @param uid Map uid
   * @returns map object or undefined if map is not in the playlist
   */
  static get(uid: string): Readonly<tm.Map> | undefined
  /**
   * Gets multiple maps from current playlist. Playlist is stored in runtime memory.
   * If some map is not present in memory it won't be returned. Returned array is not in the initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static get(uids: string[]): Readonly<tm.Map>[]
  static get(uids: string | string[]): Readonly<tm.Map> | Readonly<tm.Map>[] | undefined {
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
  static fetch(uid: string): Promise<tm.Map | undefined>
  /**
   * Fetches multiple maps from the database. This method should be used to get maps which are not in the current Match Settings
   * If some map is not present in the database it won't be returned. Returned array is not in the initial order
   * @param uids Array of map uids
   * @returns Map objects array
   */
  static async fetch(uids: string[]): Promise<tm.Map[]>
  static async fetch(uids: string | string[]): Promise<tm.Map | undefined | tm.Map[]> {
    if (typeof uids === 'string') {
      const data = await this.repo.get(uids)
      if (data === undefined) {
        return undefined
      }
      const v = await this.repo.getVoteCountAndRatio(uids)
      return { ...data, voteCount: v?.count ?? 0, voteRatio: v?.ratio ?? 0 }
    }
    const data = await this.repo.get(uids)
    const ret: tm.Map[] = []
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
  static getFromQueue(uid: string): Readonly<tm.Map> | undefined
  /**
   * Gets multiple maps from queue. If some map is not present in queue it won't be returned.
   * Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static getFromQueue(uids: string[]): Readonly<tm.Map>[]
  static getFromQueue(uids: string | string[]): Readonly<tm.Map> | Readonly<tm.Map>[] | undefined {
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
  static getFromHistory(uid: string): Readonly<tm.Map> | undefined
  /**
   * Gets multiple maps from map history. If some map is not present in history it won't be returned.
   * Returned array is not in initial order
   * @param uids Array of map uids
   * @returns Array of map objects
   */
  static getFromHistory(uids: string[]): Readonly<tm.Map>[]
  static getFromHistory(uids: string | string[]): Readonly<tm.Map> | Readonly<tm.Map>[] | undefined {
    if (typeof uids === 'string') {
      return this._history.find(a => a.id === uids)
    }
    return this._history.filter(a => uids.includes(a.id))
  }

  /**
   * Gets a map from jukebox.
   * @param uid Map uid
   * @returns jukebox object or undefined if map is not in the jukeboxed
   */
  static getFromJukebox(uid: string): Readonly<{ map: tm.Map, callerLogin?: string }> | undefined
  /**
   * Gets multiple maps from jukebox. If some map is not present in jukebox it won't be returned.
   * Returned array is not in initial order.
   * @param uids Array of map uids
   * @returns Array of jukebox objects
   */
  static getFromJukebox(uids: string[]): Readonly<{ map: tm.Map, callerLogin?: string }>[]
  static getFromJukebox(uids: string | string[]): Readonly<{ map: tm.Map, callerLogin?: string }> | Readonly<{
    map: tm.Map, callerLogin?: string
  }>[] | undefined {
    if (typeof uids === 'string') {
      const obj = this._queue.find(a => a.map.id === uids && a.isForced)
      return obj === undefined ? undefined : { map: obj.map, callerLogin: obj.callerLogin }
    }
    return this._queue.filter(a => uids.includes(a.map.id) && a.isForced).map(a => ({
      map: a.map, callerLogin: a.callerLogin
    }))
  }

  /**
   * Clears the map history
   * @param caller Object containing login and nickname of the player who called the method
   */
  static clearHistory(caller?: { login: string, nickname: string }): void {
    this._history.length = 0
    if (caller !== undefined) {
      Logger.info(`${Utils.strip(caller.nickname)} (${caller.login}) shuffled the maplist`)
    } else {
      Logger.info(`Maplist shuffled`)
    }
  }

  /**
   * Currently played map.
   */
  static get current(): Readonly<tm.CurrentMap> {
    return this._current
  }

  /**
   * All maps from current playlist.
   */
  static get maps(): Readonly<tm.Map>[] {
    return [...this._maps]
  }

  /**
   * Amount of maps in current playlist.
   */
  static get mapCount(): number {
    return this._maps.length
  }

  /**
   * Maps juked by the players.
   */
  static get jukebox(): ({ map: tm.Map, callerLogin?: string })[] {
    return this._queue.filter(a => a.isForced).map(a => ({ map: a.map, callerLogin: a.callerLogin }))
  }

  /**
   * Amount of maps juked by the players.
   */
  static get jukeboxCount(): number {
    return this._queue.filter(a => a.isForced).length
  }

  /**
   * Map queue (maps juked by the players and the server).
   */
  static get queue(): Readonly<tm.Map>[] {
    return [...this._queue.map(a => a.map)]
  }

  /**
   * Map history.
   */
  static get history(): Readonly<tm.Map>[] {
    return [...this._history]
  }

  /**
   * Amount of maps in the history.
   */
  static get historyCount(): number {
    return this._history.length
  }

}
