import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { Events } from '../Events.js'

export class MapService {

  private static _current: TMCurrentMap
  private static _maps: TMMap[] = []
  private static repo: MapRepository

  static async initialize(): Promise<void> {
    this.repo = new MapRepository()
    await this.repo.initialize()
    await this.initializeList()
    await this.setCurrent()
    Client.addProxy(['LoadMatchSettings'], async () => {
      this.maps.length = 0
      await this.initializeList()
      Events.emitEvent('Controller.MatchSettingsUpdated', this.maps)
    })
  }

  static get current(): TMCurrentMap {
    return this._current
  }

  static get maps(): TMMap[] {
    return [...this._maps]
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
    const dbinfo = this.maps.find(a => a.id === res[0].UId)
    if (dbinfo === undefined) {
      Logger.error('Failed to get map info from memory')
      return
    }
    if (dbinfo.checkpointsAmount === undefined) {
      dbinfo.checkpointsAmount = res[0].NbCheckpoints
      dbinfo.lapsAmount = res[0].NbLaps
    }
    this._current = dbinfo as any
    this.repo.setCpsAndLapsAmount(this._current.id, this._current.lapsAmount, this._current.checkpointsAmount)
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
    const DBMapList: TMMap[] = await this.repo.getAll()
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    if (mapsNotInDB.length > 100) { // TODO implement progress bar here perhaps (?)
      Logger.warn(`Large amount of maps (${mapsNotInDB.length}) present in maplist are not in the database. Fetching maps might take a few minutes...`)
    }
    const mapsNotInDBObjects: TMMap[] = []
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.fatal(`Unable to retrieve map info for map id: ${c.id}, filename: ${c.fileName}`, res.message)
        return
      }
      const obj: TMMap = this.constructNewMapObject(res[0])
      mapsNotInDBObjects.push(obj)
    }
    const mapsInMapList: TMMap[] = []
    for (const map of DBMapList) {
      if (mapList.some(a => a.UId === map.id)) {
        mapsInMapList.push(map)
      }
    }
    const arr = [...mapsInMapList, ...mapsNotInDBObjects].sort((a, b) => a.name.localeCompare(b.name))
    arr.sort((a, b) => a.author.localeCompare(b.author))
    this._maps.push(...arr)
    await this.repo.add(...mapsNotInDBObjects)
  }

  static async add(fileName: string, callerLogin?: string): Promise<TMMap | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: fileName }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert map ${fileName}`) }
    const dbRes = await this.repo.getByFilename(fileName)
    let obj: TMMap
    if (dbRes !== undefined) {
      obj = dbRes
    } else {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: fileName }])
      if (res instanceof Error) { return res }
      obj = this.constructNewMapObject(res[0])
      void this.repo.add(obj)
    }
    this._maps.push(obj)
    this._maps.sort((a, b) => a.name.localeCompare(b.name))
    this._maps.sort((a, b) => a.author.localeCompare(b.author))
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} added map ${obj.name} by ${obj.author}`)
    } else {
      Logger.info(`Map ${obj.name} by ${obj.author} added`)
    }
    Events.emitEvent('Controller.MapAdded', { ...obj, callerLogin })
    return obj
  }

  static async remove(id: string, callerLogin?: string): Promise<boolean | Error> {
    const map = this._maps.find(a => id === a.id)
    if (map === undefined) {
      return false
    }
    const remove: any[] | Error = await Client.call('RemoveChallenge', [{ string: map.fileName }])
    if (remove instanceof Error) { return remove }
    if (remove[0] === false) { return new Error(`Failed to remove map ${map.name} by ${map.author}`) }
    this._maps.splice(this._maps.findIndex(a => a.id === id), 1)
    void this.repo.remove(id)
    if (callerLogin !== undefined) {
      Logger.info(`Player ${callerLogin} removed map ${map.name} by ${map.author}`)
    } else {
      Logger.info(`Map ${map.name} by ${map.author} removed`)
    }
    Events.emitEvent('Controller.MapRemoved', { ...map, callerLogin })
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
      mood: info.Mood.trim(),
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

}
