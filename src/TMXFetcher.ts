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
    let data: any
    let prefix: TMXPrefix | undefined
    for (const p of this.prefixes) {
      const params: [string, string][] = [['uid', mapId]]
      const url = `https://${p}.tm-exchange.com/api/tracks?${new URLSearchParams([
        ['fields', `TrackId`],
        ...params
      ])}`
      const res = await fetch(url).catch((err: Error) => err)
      if (res instanceof Error || !res.ok) { continue }
      data = await res.json().catch((data: Error) => data)
      if (data instanceof Error) { // FOR WHATEVER REASON THE NEW API ALSO RETURNS A WEBPAGE INSTEAD OF AN ERROR (REAL HTTP 200 RESPONSE BY THE WAY!!!)
        const error = new Error(`Error while processing TMX response (url: ${url}).`
          + `\nCode: ${res.status} Text: ${res.statusText} `)
        Logger.warn(error.message)
        continue
      }
      prefix = p
      break
    }
    if (prefix === undefined) { return new Error('Cannot fetch map data from TMX') }
    return { id: data.Results[0].TrackId, prefix }
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
    let data: any
    let mapId: string | undefined
    let tmxId: number | undefined
    if (typeof arg === 'number') {
      tmxId = arg
      const url = `https://${prefix}.tm-exchange.com/api/tracks?${new URLSearchParams([
        ['fields', `TrackId,TrackName,UId,AuthorTime,AuthorScore,GoldTarget,SilverTarget,BronzeTarget,Authors,UploadedAt,` +
          `UpdatedAt,PrimaryType,AuthorComments,Style,Routes,Difficulty,Environment,Car,Mood,Awards,Comments,Images`],
        ['id', tmxId.toString()]
      ])
        }`
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
      data = await res.json().catch((data: Error) => data)
      if (data instanceof Error || data.Results?.[0] === undefined) {
        const error = new Error(`Error while fetching map info from TMX (url: ${url})`)
        Logger.warn(error.message)
        return error
      }
    } else {
      mapId = arg
      for (const p of this.prefixes) { // Search for right prefix
        const url = `https://${p}.tm-exchange.com/api/tracks?${new URLSearchParams([
          ['fields', `TrackId,TrackName,UId,AuthorTime,AuthorScore,GoldTarget,SilverTarget,BronzeTarget,Authors,UploadedAt,` +
            `UpdatedAt,PrimaryType,AuthorComments,Style,Routes,Difficulty,Environment,Car,Mood,Awards,Comments,Images`],
          ['uid', arg.toString()]
        ])}`
        const res = await fetch(url).catch((err: Error) => err)
        if (res instanceof Error || !res.ok) {
          continue
        }
        const rawData: any = await res.json().catch((data: Error) => data)
        if (!(rawData instanceof Error) && rawData?.Results?.[0] !== undefined) {
          data = rawData.Results[0]
          prefix = p
          tmxId = data.TrackId
          break
        }
      }
    }
    if (prefix === undefined) {
      const error = new Error(`Cannot fetch map info from TMX (map UID: ${mapId})`)
      Logger.warn(error.message)
      return error
    }
    let replays = await this.getReplays(tmxId as number, prefix)
    if (replays instanceof Error) {
      replays = []
    }
    const parsedData = this.parseMapInfoApiResponse(data, replays, this.prefixToSite(prefix), prefix)
    if (mapId !== undefined) {
      void MapService.setAwardsAndLbRating(mapId, parsedData.awards, parsedData.leaderboardRating)
    }
    return parsedData
  }

  /**
   * Fetches replays for specified map.
   * @param tmxId Map TMX ID
   * @param prefix TMX site prefix
   * @returns Array of replay objects or error in case fetch fails
   */
  static async getReplays(tmxId: number, prefix: TMXPrefix): Promise<tm.TMXReplay[] | Error> {
    const url = `https://${prefix}.tm-exchange.com/api/replays?${new URLSearchParams([
      ['fields', 'ReplayTime,ReplayId,ReplayScore,Score,TrackAt,ReplayAt,User.UserId,User.Name'],
      ['trackId', tmxId.toString()],
      ['best', '1'] // only get the best replay from each player
    ])}`
    const res = await fetch(url).catch((err: Error) => err)
    let data: any
    if (res instanceof Error) {
      const error = new Error(`Error while fetching replays info from TMX (url: ${url}).`)
      Logger.warn(error.message, res.message)
      return error
    } else if (!res.ok) {
      const error = new Error(`Error while fetching replays info from TMX (url: ${url}).` +
        `\nCode: ${res.status} Text: ${res.statusText}`)
      Logger.warn(error.message)
      return error
    } else {
      const rawData: any = await res.json().catch((data: Error) => data)
      if (rawData instanceof Error || rawData?.Results === undefined) {
        const error = new Error(`Error while processing TMX response (url: ${url}).`
          + `\nCode: ${res.status} Text: ${res.statusText} `)
        Logger.warn(error.message)
        return error
      }
      data = rawData.Results
    }
    const replays: tm.TMXReplay[] = []
    for (const r of data) {
      replays.push({
        id: r.ReplayId,
        userId: r.User.UserId,
        name: r.User.Name,
        time: r.ReplayTime,
        score: r.ReplayScore ?? undefined,
        recordDate: new Date(r.ReplayAt),
        mapDate: new Date(r.TrackAt),
        leaderboardScore: r.Score,
        url: `https://${prefix}.tm-exchange.com/recordgbx/${r.ReplayId}`
      })
    }
    return replays
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
      ['fields', `TrackId,TrackName,UId,AuthorTime,AuthorScore,Authors,UploadedAt,` +
        `UpdatedAt,PrimaryType,AuthorComments,Style,Routes,Difficulty,Environment,Car,Mood,Awards,Comments,Images,TrackValue`],
      ...params
    ])}`
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
    return this.parseSearchApiResponse(data, site, prefix)
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

  private static siteToPrefix(site: tm.TMXSite): TMXPrefix {
    return this.prefixes[this.sites.indexOf(site)]
  }

  private static prefixToSite(prefix: TMXPrefix): tm.TMXSite {
    return this.sites[this.prefixes.indexOf(prefix)]
  }

  static parseSearchApiResponse(data: any, site: tm.TMXSite, prefix: TMXPrefix): tm.TMXSearchResult[] {
    const ret: tm.TMXSearchResult[] = []
    for (const e of data.Results) {
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
        authorScore: e.AuthorScore ?? undefined,
        car: this.cars[e.Car as keyof typeof this.cars]
      })
    }
    return ret
  }

  static parseMapInfoApiResponse(data: any, replays: tm.TMXReplay[], site: tm.TMXSite, prefix: TMXPrefix): tm.TMXMap {
    return {
      id: data.UId,
      TMXId: data.TrackId,
      name: data.TrackName,
      authorId: data.Authors[0].User.UserId,
      author: data.Authors[0].User.Name,
      uploadDate: new Date(data.UploadedAt),
      lastUpdateDate: new Date(data.UpdatedAt),
      type: this.mapTypes[data.PrimaryType as keyof typeof this.mapTypes],
      environment: this.environments[data.Environment as keyof typeof this.environments],
      mood: this.moods[data.Mood as keyof typeof this.moods],
      style: this.styles[data.Style as keyof typeof this.styles],
      routes: this.routes[data.Routes as keyof typeof this.routes],
      difficulty: this.difficulties[data.Difficulty as keyof typeof this.difficulties],
      game: site,
      comment: data.AuthorComments,
      commentsAmount: data.Comments,
      awards: data.Awards,
      pageUrl: `https://${prefix}.tm-exchange.com/trackshow/${data.TrackId}`,
      screenshotUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreen&id=${data.TrackId}`,
      thumbnailUrl: `https://${prefix}.tm-exchange.com/get.aspx?action=trackscreensmall&id=${data.TrackId}`,
      downloadUrl: `https://${prefix}.tm-exchange.com/trackgbx/${data.TrackId}`,
      authorTime: data.AuthorTime,
      authorScore: data.AuthorScore ?? undefined,
      leaderboardRating: data.TrackValue,
      isClassic: data.TrackValue === 0 && data.Awards !== 0,
      isNadeo: data.TrackValue === 50000,
      replays,
      validReplays: replays.filter(a => a.mapDate.getTime() === new Date(data.UpdatedAt).getTime())
    }
  }


}
