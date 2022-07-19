import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { Events } from '../Events.js'

export class MapService {

  private static _current: TMMap
  private static _maps: TMMap[] = []
  private static repo: MapRepository

  static async initialize(): Promise<void> {
    this.repo = new MapRepository()
    await this.repo.initialize()
    await this.initializeList()
    await this.setCurrent()
  }

  static get current(): TMMap {
    return this._current
  }

  static get maps(): TMMap[] {
    return this._maps
  }

  /**
   * Sets the current map.
   */
  static async setCurrent(): Promise<void> {
    const res: any[] | Error = await Client.call('GetCurrentChallengeInfo')
    if (res instanceof Error) {
      Logger.error('Unable to retrieve current map info.', res.message)
      return
    }
    const dbinfo = await this.repo.get(res[0].UId)
    if (dbinfo === undefined) {
      Logger.error('Failed to fetch map info from database')
      return
    }
    this._current = this.constructMapObjectFromDB(dbinfo, res[0])
  }

  /**
   * Download all the maps from the server and store them in a field
   */
  private static async initializeList(): Promise<void> {
    const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
    if (mapList instanceof Error) {
      Logger.fatal('Error while getting the map list', mapList.message)
      return
    }
    const DBMapList: MapsDBEntry[] = await this.repo.getAll()
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    if (mapsNotInDB.length > 100) { // TODO implement progress bar here perhaps (?)
      Logger.warn(`Large amount of maps (${mapsNotInDB.length}) present in maplist are not in the database. Fetching maps might take a few minutes...`)
    }
    const mapsNotInDBInfo: TMMap[] = []
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.fatal(`Unable to retrieve map info for map id: ${c.id}, filename: ${c.fileName}`, res.message)
        return
      }
      const obj: TMMap = this.constructNewMapObject(res[0])
      mapsNotInDBInfo.push(obj)
    }
    const mapsInDBInfo: TMMap[] = []
    for (const map of DBMapList) {
      const info: TMMap = this.constructMapObjectFromDB(map)
      mapsInDBInfo.push(info)
    }
    for (const c of [...mapsInDBInfo, ...mapsNotInDBInfo]) {
      this._maps.push(c)
    }
    await this.repo.add(...mapsNotInDBInfo)
  }

  static async add(fileName: string, callerLogin?: string): Promise<TMMap | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: fileName }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert map ${fileName}`) }
    const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: fileName }])
    if (res instanceof Error) { return res }
    const obj: TMMap = this.constructNewMapObject(res[0])
    this._maps.push(obj)
    void this.repo.add(obj)
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} added map ${obj.name} by ${obj.author}`)
    } else {
      Logger.info(`Map ${obj.name} by ${obj.author} added`)
    }
    const temp: any = obj
    temp.callerLogin = callerLogin
    Events.emitEvent('Controller.MapAdded', temp as MapAddedInfo)
    return obj
  }

  static async remove(id: string, callerLogin?: string): Promise<boolean | Error> {
    const map = this._maps.find(a => id === a.fileName)
    if(map === undefined) {
      return false
    }
    const insert: any[] | Error = await Client.call('RemoveChallenge', [{ string: map.fileName }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to remove map ${map.name} by ${map.author}`) }
    this._maps.splice(this._maps.findIndex(a => a.id === id), 1)
    // void this.repo.remove(fileName) TODO IMPLEMENT REMOVAL AFTER REWRITING DB
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} removed map ${map.name} by ${map.author}`)
    } else {
      Logger.info(`Map ${map.name} by ${map.author} removed`)
    }
    const temp: any = map
    temp.callerLogin = callerLogin
    Events.emitEvent('Controller.MapRemoved', temp as MapRemovedInfo)
    return true
  }

  static async setNextMap(id: string): Promise<true | Error> {
    const map: TMMap | undefined = this.maps.find(a => a.id === id)
    if (map === undefined) { return new Error(`Cant find map with id ${id} in memory`) }
    const res: any[] | Error = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    if (res instanceof Error) { return new Error(`Failed to queue map ${map.name}`) }
    Logger.trace(`Next map set to ${map.name} by ${map.author}`)
    return true
  }

  static shuffle(adminLogin?: string): void {
    this._maps = this._maps.map(a => ({ map: a, rand: Math.random() })).sort((a, b) => a.rand - b.rand).map(a => a.map)
    if (adminLogin !== undefined) {
      Logger.info(`Player ${adminLogin} shuffled the maplist`)
    } else {
      Logger.info(`Maplist shuffled`)
    }
  }

  /**
   * Contstructs TMMap object from dedicated server response and date
   * @param info - GetChallengeInfo dedicated server call response
   */
  private static constructNewMapObject(info: any): TMMap {
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
      lapRace: info.LapRace,
      lapsAmount: info.NbLaps,
      checkpointsAmount: info.NbCheckpoints,
      addDate: new Date()
    }
  }

  // Fix later cuz nadeo are apes and send -1 for laps and checkpoints on GetChallengeInfo
  private static constructMapObjectFromDB(info: MapsDBEntry, callRes?: any) {
    return {
      id: info.id,
      name: info.name,
      fileName: info.filename,
      author: info.author,
      environment: info.environment,
      mood: info.mood,
      bronzeTime: info.bronzetime,
      silverTime: info.silvertime,
      goldTime: info.goldtime,
      authorTime: info.authortime,
      copperPrice: info.copperprice,
      lapRace: info.laprace,
      lapsAmount: callRes === undefined ? info.lapsamount : callRes.NbLaps,
      checkpointsAmount: callRes === undefined ? info.checkpointsamount : callRes.NbCheckpoints,
      addDate: info.adddate
    }
  }

}
