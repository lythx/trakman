import { Client } from '../Client.js'
import { MapRepository } from '../database/MapRepository.js'
import { ErrorHandler } from '../ErrorHandler.js'

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
      ErrorHandler.error('Unable to retrieve current map info.', res.message)
      return
    }
    const info: any = res[0]
    const dbinfo: any[] = await this.repo.get(info.UId)
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
      addDate: dbinfo[0].adddate
    }
  }

  /**
   * Download all the maps from the server and store them in a field
   */
  private static async initializeList(): Promise<void> {
    const mapList: any[] | Error = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ])
    if (mapList instanceof Error) {
      ErrorHandler.fatal('Error getting the map list', mapList.message)
      return
    }
    const DBMapList: any[] = await this.repo.getAll()
    const mapsInDB: any[] = mapList.filter(a => DBMapList.some(b => a.UId === b.id))
    const mapsNotInDB: any[] = mapList.filter(a => !DBMapList.some(b => a.UId === b.id))
    const mapsNotInDBInfo: TMMap[] = []
    for (const c of mapsNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        ErrorHandler.error('Unable to retrieve map info.', `Map id: ${c.id}, filename: ${c.fileName}`, res.message)
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
    for (const map of mapsInDB) {
      const c: any = DBMapList.find((a: any): boolean => a.id === map.UId)
      const info: TMMap = {
        id: c.id,
        name: c.name,
        fileName: c.filename,
        author: c.author,
        environment: c.environment,
        mood: c.mood,
        bronzeTime: c.bronzetime,
        silverTime: c.silvertime,
        goldTime: c.goldtime,
        authorTime: c.authortime,
        copperPrice: c.copperprice,
        lapRace: c.laprace,
        lapsAmount: c.lapsamount,
        checkpointsAmount: c.checkpointsamount,
        addDate: new Date(c.adddate)
      }
      mapsInDBInfo.push(info)
    }
    for (const c of [...mapsInDBInfo, ...mapsNotInDBInfo]) {
      this._maps.push(c)
    }
    await this.repo.add(...mapsNotInDBInfo)
  }

  static async add(fileName: string): Promise<TMMap | Error> {
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
    await this.repo.add(obj)
    return obj
  }

  static async setNextMap(id: string): Promise<void | Error> {
    const map: TMMap | undefined = this.maps.find(a => a.id === id)
    if (map === undefined) { return new Error(`Cant find map with UId ${id} in memory`) }
    const res: any[] | Error = await Client.call('ChooseNextChallenge', [{ string: map.fileName }])
    if (res instanceof Error) { return new Error(`Failed to queue map ${map.name}`) }
  }

  static shuffle(): void {
    this._maps = this._maps.map(a => ({ map: a, rand: Math.random() })).sort((a, b) => a.rand - b.rand).map(a => a.map)
  }
  
}
