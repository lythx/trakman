import fetch from 'node-fetch'
import { Logger } from './Logger.js'
import { MapService } from './services/MapService.js'
import config from '../config/Config.js'

type TMXPrefix = 'tmnforever' | 'united' | 'nations' | 'original' | 'sunrise'

export abstract class TMXFetcher {

  private static readonly prefixes: TMXPrefix[] = ['tmnforever', 'united', 'nations', 'original', 'sunrise']
  private static readonly sites: tm.TMXSite[] = ['TMNF', 'TMU', 'TMN', 'TMO', 'TMS']
  private static readonly environments: { [key: number]: tm.Environment } = {
    1: 'Snow',
    2: 'Desert',
    3: 'Rally',
    4: 'Island',
    5: 'Coast',
    6: 'Bay',
    7: 'Stadium'
  }
  private static readonly difficulties: { [key: number]: tm.TMXDifficulty } = {
    0: 'Beginner',
    1: 'Intermediate',
    2: 'Expert',
    3: 'Lunatic'
  }
  private static readonly moods: { [key: number]: tm.Mood } = {
    0: 'Sunrise',
    1: 'Day',
    2: 'Sunset',
    3: 'Night'
  }
  private static readonly routes: { [key: number]: tm.TMXRoutes } = {
    0: 'Single',
    1: 'Multiple',
    2: 'Symmetrical'
  }
  private static readonly mapTypes: { [key: number]: tm.TMXMapType } = {
    0: 'Race',
    1: 'Puzzle',
    2: 'Platform',
    3: 'Stunts',
    4: 'Shortcut',
    5: 'Laps'
  }
  private static readonly cars: { [key: number]: tm.TMXCar } = {
    1: 'SnowCar',
    2: 'DesertCar',
    3: 'RallyCar',
    4: 'IslandCar',
    5: 'CoastCar',
    6: 'BayCar',
    7: 'StadiumCar'
  }
  private static readonly styles: { [key: number]: tm.TMXStyle } = {
    0: 'Normal',
    1: 'Stunt',
    2: 'Maze',
    3: 'Offroad',
    4: 'Laps',
    5: 'Fullspeed',
    6: 'LOL',
    7: 'Tech',
    8: 'SpeedTech',
    9: 'RPG',
    10: 'PressForward',
    11: 'Trial',
    12: 'Grass'
  }

  /**
   * Fetches map file from TMX via its UID.
   * @param mapId Map UID
   * @returns Object containing map name and file content, or Error if unsuccessful
   */
  static async fetchMapFile(mapId: string): Promise<{ name: string, content: Buffer } | Error>
  /**
   * Fetches map file from TMX via its TMX ID.
   * @param tmxId Map TMX ID
   * @param site Optional TMX site (TMNF by default)
   * @returns Object containing map name and file content, or Error if unsuccessful
   */
  static async fetchMapFile(tmxId: number, site?: tm.TMXSite): Promise<{ name: string, content: Buffer } | Error>
  static async fetchMapFile(id: number | string, site: tm.TMXSite = 'TMNF'): Promise<{ name: string, content: Buffer } | Error> {
    let prefix: TMXPrefix = this.siteToPrefix(site)
    if (typeof id === 'string') {
      const res = await this.getTMXId(id)
      if (res instanceof Error) {
        return res
      }
      id = res.id
      prefix = res.prefix
    }
    const url: string = `https://${prefix}.tm-exchange.com/trackgbx/${id}`
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      Logger.warn(`Error while fetching map file from TMX (url: ${url}).`, res.message)
      return res
    }
    if (!res.ok) {
      const error = new Error(`Error while fetching map file from TMX` +
        ` (url: ${url}).\nCode: ${res.status} Text: ${res.statusText}`)
      Logger.warn(error.message)
      return error
    }
    const nameHeader: string | null = res.headers.get('content-disposition')
    if (nameHeader === null) { return new Error('Cannot read map name') }
    // The header is inconsistent for some reason, I hate TMX
    const name: string = nameHeader[21] === '"' ? nameHeader.substring(22).split('"; filename*=')[0] : nameHeader.substring(21).split('; filename*=')[0]
    const data: ArrayBuffer = await res.arrayBuffer()
    const buffer: Buffer = Buffer.from(data)
    return { name, content: buffer }
  }

  /**
   * Fetches the map from TMX via its UID
   * @param mapId Map UID
   * @returns TMX map data or error if unsuccessful
   */
  private static async getTMXId(mapId: string): Promise<{ id: number, prefix: TMXPrefix } | Error> {
    let data: string = ''
    let prefix: TMXPrefix | undefined
    for (const p of this.prefixes) {
      const url: string = `https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error || !res.ok) { continue }
      data = await res.text()
      if (data !== '') { // They send empty page instead of error for some reason. NICE!!!!
        prefix = p
        break
      }
    }
    if (prefix === undefined) { return new Error('Cannot fetch map data from TMX') }
    const s: string[] = data.split('\t')
    const id: number = Number(s[0])
    return { id, prefix }
  }

  /**
   * Fetches TMX for map information.
   * @param mapId Map UID
   * @returns Map info from TMX or error if unsuccessful
   */
  static async fetchMapInfo(mapId: string): Promise<tm.TMXMap | Error>
  /**
   * Fetches TMX for map information.
   * @param tmxId Map TMX ID
   * @returns Map info from TMX or error if unsuccessful
   */
  static async fetchMapInfo(tmxId: number, prefix: TMXPrefix): Promise<Omit<tm.TMXMap, 'id'> | Error>
  static async fetchMapInfo(arg: string | number, prefix?: TMXPrefix | undefined): Promise<tm.TMXMap | Error> {
    let data: string = ''
    let mapId: string | undefined
    if (typeof arg === 'number') {
      const url: string = `https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackinfo&id=${arg}`
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error) {
        Logger.warn(`Error while fetching map info from TMX (url: ${url}).`, res.message)
        return res
      }
      if (!res.ok) {
        const error = new Error(`Error while fetching map info from TMX`
          + ` (url: ${url}).\nCode: ${res.status} Text: ${res.statusText}`)
        Logger.warn(error.message)
        return error
      }
      data = await res.text()
      if (data === '') {
        const error = new Error(`Error while fetching map info from TMX (url: ${url})`)
        Logger.warn(error.message)
        return error
      }
    } else {
      mapId = arg
      for (const p of this.prefixes) { // Search for right prefix
        const url: string = `https://${p}.tm-exchange.com/apiget.aspx?action=apitrackinfo&uid=${mapId}`
        const res = await fetch(url).catch((err: Error) => err)
        if (res instanceof Error || !res.ok) {
          continue
        }
        data = await res.text()
        if (data !== '') { // They send empty page instead of error for some reason. NICE!!!!
          prefix = p
          break
        }
      }
    }
    if (prefix === undefined) {
      const error = new Error(`Cannot fetch map info from TMX (map UID: ${mapId})`)
      Logger.warn(error.message)
      return error
    }
    return await this.parseOldApiResponse(prefix, data, mapId as any)
  }

  /**
  * Searches for maps matching the specified name on TMX.
  * @param query Search query
  * @param author Map author to look for
  * @param site TMX Site to fetch from
  * @param count Number of maps to fetch
  * @returns An array of searched map objects or Error if unsuccessful
  */
  static async searchForMap(query?: string, author?: string, site: tm.TMXSite = 'TMNF',
    count: number = config.defaultTMXSearchLimit): Promise<Error | tm.TMXSearchResult[]> {
    const params: [string, string][] = [['count', count.toString()], ['name', (query ?? '').trim()], ['author', (author ?? '').trim()]]
    if (author === undefined) { params.pop() }
    if (query === undefined) { params.pop() }
    const prefix = this.siteToPrefix(site)
    const url = `https://${prefix}.tm-exchange.com/api/tracks?${new URLSearchParams([
      ['fields', `TrackId,TrackName,UId,AuthorTime,GoldTarget,SilverTarget,BronzeTarget,Authors,UploadedAt,` +
        `UpdatedAt,PrimaryType,AuthorComments,Style,Routes,Difficulty,Environment,Car,Mood,Awards,Comments,Images`],
      ...params
    ])
      }`
    const res = await fetch(url).catch((err: Error) => err)
    if (res instanceof Error) {
      Logger.warn(`Error while searching for map on TMX (url: ${url}).`, res.message)
      return res
    }
    if (!res.ok) {
      const error = new Error(`Error while searching for map on TMX (url: ${url}).`
        + `\nCode: ${res.status} Text: ${res.statusText} `)
      Logger.warn(error.message)
      return error
    }
    const data = await res.json().catch((data: Error) => data)
    if (data instanceof Error) { // FOR WHATEVER REASON THE NEW API ALSO RETURNS A WEBPAGE INSTEAD OF AN ERROR (REAL HTTP 200 RESPONSE BY THE WAY!!!)
      const error = new Error(`Error while processing TMX response (url: ${url}).`
        + `\nCode: ${res.status} Text: ${res.statusText} `)
      Logger.warn(error.message)
      return error
    }
    const ret: tm.TMXSearchResult[] = []
    for (const e of (data as any).Results) {
      ret.push({
        id: e.UId,
        TMXId: e.TrackId,
        name: e.TrackName,
        authorId: e.Authors[0].User.UserId,
        author: e.Authors[0].User.Name,
        uploadDate: new Date(e.UploadedAt),
        lastUpdateDate: new Date(e.UpdatedAt),
        type: this.mapTypes[e.PrimaryType as keyof typeof this.mapTypes],
        environment: this.environments[e.Environment as keyof typeof this.environments],
        mood: this.moods[e.Mood as keyof typeof this.moods],
        style: this.styles[e.Style as keyof typeof this.styles],
        routes: this.routes[e.Routes as keyof typeof this.routes],
        difficulty: this.difficulties[e.Difficulty as keyof typeof this.difficulties],
        game: site,
        comment: e.AuthorComments,
        commentsAmount: e.Comments,
        awards: e.Awards,
        pageUrl: `https://${prefix}.tm-exchange.com/trackshow/${e.TrackId}`,
        screenshotUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreen&id=${e.TrackId}`,
        thumbnailUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreensmall&id=${e.TrackId}`,
        downloadUrl: `https://${prefix}.tm-exchange.com/trackgbx/${e.TrackId}`,
        bronzeTime: e.BronzeTarget,
        silverTime: e.SilverTarget,
        goldTime: e.GoldTarget,
        authorTime: e.AuthorTime,
        car: this.cars[e.Car as keyof typeof this.cars]
      })
    }
    return ret
  }

  /**
   * Fetches a random map file from TMX.
   * @param site Optional TMX site (TMNF by default)
   * @returns Object containing map name and file content, or Error if unsuccessful
   */
  static async fetchRandomMapFile(site: tm.TMXSite = 'TMNF'): Promise<{ name: string, content: Buffer } | Error> {
    const prefix = this.siteToPrefix(site)
    const res = await fetch(`https://${prefix}.tm-exchange.com/trackrandom`).catch((err: Error) => err)
    if (res instanceof Error) {
      Logger.warn(`Error while fetching random TMX map.`, res.message)
      return res
    }
    if (!res.ok) {
      const error = new Error(`Error while fetching random TMX map.`
        + `\nCode: ${res.status} Text: ${res.statusText}`)
      Logger.warn(error.message)
      return error
    }
    const split = res.url.split('/')
    const id = Number(split[split.length - 1])
    if (isNaN(id)) {
      const err = new Error(`Error while fetching random TMX map. No map ID in the url ${res.url}`)
      Logger.warn(err)
      return err
    }
    return await this.fetchMapFile(id, site)
  }

  private static async parseOldApiResponse(prefix: TMXPrefix, response: string): Promise<Omit<tm.TMXMap, 'id'>>
  private static async parseOldApiResponse(prefix: TMXPrefix, response: string, mapId: string): Promise<tm.TMXMap>
  private static async parseOldApiResponse(prefix: TMXPrefix, response: string, mapId?: string): Promise<tm.TMXMap | Omit<tm.TMXMap, 'id'>> {
    const s: string[] = response.split('\t')
    if (s.length !== 19) { // \t can be in comment thank you tmx developers
      const start = s.slice(0, 16)
      const comment = s.slice(16, -2).join('\t')
      const end = s.slice(-2)
      s.length = 0
      s.push(...start, comment, ...end)
    }
    const TMXId: number = Number(s[0])
    if (isNaN(TMXId)) { // Weird bug that happened once
      Logger.debug(`TMX ID undefined in parseOldApiResponse.`,
        ` Prefix: ${prefix}, response: ${response}, mapId: ${mapId}`)
      return new Error(`Error while parsing API response.`) as any
    }
    const url: string = `https://${prefix}.tm-exchange.com/apiget.aspx?action=apitrackrecords&id=${TMXId}`
    const replaysRes = await fetch(url).catch((err: Error) => err)
    let replaysData: string[] = []
    if (replaysRes instanceof Error) {
      Logger.warn(`Error while fetching replays info from TMX (url: ${url}).`, replaysRes.message)
    } else if (!replaysRes.ok) {
      Logger.warn(`Error while fetching replays info from TMX (url: ${url}).` +
        `\nCode: ${replaysRes.status} Text: ${replaysRes.statusText}`)
    } else {
      replaysData = (await replaysRes.text()).split('\r\n')
      replaysData.pop()
    }
    const replays: tm.TMXReplay[] = []
    for (const r of replaysData) {
      const rs: string[] = r.split('\t')
      replays.push({
        id: Number(rs[0]),
        userId: Number(rs[1]),
        name: rs[2],
        time: Number(rs[3]),
        recordDate: new Date(rs[4]),
        mapDate: new Date(rs[5]),
        approved: rs[6],
        leaderboardScore: Number(rs[7]),
        expires: rs[8],
        lockspan: rs[9],
        url: `https://${prefix}.tm-exchange.com/recordgbx/${rs[0]}`
      })
    }
    const lastUpdateDate = new Date(s[5])
    const validReplays = replays.filter(a => a.mapDate.getTime() === lastUpdateDate.getTime())
    const awards = Number(s[18].split('<BR>')[0])
    const mapInfo: Omit<tm.TMXMap, 'id'> | tm.TMXMap = {
      id: mapId,
      TMXId,
      name: s[1],
      authorId: Number(s[2]),
      author: s[3],
      uploadDate: new Date(s[4]),
      lastUpdateDate,
      type: s[7],
      environment: s[8] as any,
      mood: s[9] as any,
      style: s[10],
      routes: s[11],
      length: s[12],
      difficulty: s[13] as any,
      leaderboardRating: Number(s[14]),
      // Some maps are in some kind of beta mode so they have 0 karma like classic maps (i love tmx developers)
      isClassic: Number(s[14]) === 0 && awards !== 0,
      isNadeo: Number(s[14]) === 50000,
      game: s[15],
      comment: s[16],
      commentsAmount: Number(s[17]),
      awards,
      pageUrl: `https://${prefix}.tm-exchange.com/trackshow/${TMXId}`,
      screenshotUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreen&id=${TMXId}`,
      thumbnailUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreensmall&id=${TMXId}`,
      downloadUrl: `https://${prefix}.tm-exchange.com/trackgbx/${TMXId}`,
      replays,
      validReplays
    }
    if (mapId !== undefined) {
      void MapService.setAwardsAndLbRating(mapId, mapInfo.awards, mapInfo.leaderboardRating)
    }
    return mapInfo
  }

  private static siteToPrefix(site: tm.TMXSite): TMXPrefix {
    return this.prefixes[this.sites.indexOf(site)]
  }

}
