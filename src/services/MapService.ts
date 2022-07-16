import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import { MapRepository } from '../database/MapRepository.js'

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
    const info: any = res[0]
    const dbinfo = await this.repo.get(info.UId)
    if (dbinfo === undefined) {
      Logger.error('Failed to fetch map info from database')
      return
    }
    this._current = {
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
      addDate: dbinfo.adddate
    }
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
    const mapsNotInDBInfo: TMMap[] = []
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        Logger.fatal(`Unable to retrieve map info for map id: ${c.id}, filename: ${c.fileName}`, res.message)
        return
      }
      const info: any = res[0]
      const obj: TMMap = {
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
      mapsNotInDBInfo.push(obj)
    }
    const mapsInDBInfo: TMMap[] = []
    for (const map of DBMapList) {
      const info: TMMap = {
        id: map.id,
        name: map.name,
        fileName: map.filename,
        author: map.author,
        environment: map.environment,
        mood: map.mood,
        bronzeTime: map.bronzetime,
        silverTime: map.silvertime,
        goldTime: map.goldtime,
        authorTime: map.authortime,
        copperPrice: map.copperprice,
        lapRace: map.laprace,
        lapsAmount: map.lapsamount,
        checkpointsAmount: map.checkpointsamount,
        addDate: map.adddate
      }
      mapsInDBInfo.push(info)
    }
    for (const c of [...mapsInDBInfo, ...mapsNotInDBInfo]) {
      this._maps.push(c)
    }
    void this.repo.add(...mapsNotInDBInfo)
  }

  static async add(fileName: string, adminLogin?: string): Promise<TMMap | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: fileName }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert map ${fileName}`) }
    const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: fileName }])
    if (res instanceof Error) { return res }
    const info: any = res[0]
    const obj: TMMap = {
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
    this._maps.push(obj)
    void this.repo.add(obj)
    if (adminLogin !== undefined) {
      Logger.info(`Player ${adminLogin} added map ${obj.name} by ${obj.author}`)
    } else {
      Logger.info(`Map ${obj.name} by ${obj.author} added`)
    }
    return obj
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

}
