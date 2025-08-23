import fs from 'fs/promises'

import { Logger } from '../Logger.js'
import { Client } from '../client/Client.js'
import config from '../../config/Config.js'
import { MapService } from './MapService.js'
import { GameService } from './GameService.js'

export class ManualMapLoading {
  private static readonly prefix: string = config.manualMapLoading.mapsDirectoryPrefix
  private static readonly stadium: boolean = config.manualMapLoading.stadiumOnly !== undefined ? config.manualMapLoading.stadiumOnly : process.env.SERVER_PACKMASK === 'nations'
  private static mapIndex = 0
  private static oldQueue: tm.Map[]
  private static oldCurr: tm.CurrentMap

  static async getFileNames(): Promise<string[]> {
    const files: string[] = await fs.readdir(this.prefix + config.manualMapLoading.mapsDirectory, { recursive: true })
    return files.map(a => config.manualMapLoading.mapsDirectory + a)
  }

  /**
   * Parse every map in the `config.mapsDirectoryPrefix/config.mapsDirectory
   * @param presentMaps list of already existing maps to compare with
   * @param dirname the directory name
   * @returns list of maps in the same format that the server returns them
   */
  static async parseMaps(presentMaps: tm.Map[] = [],
    dirname: string = config.manualMapLoading.mapsDirectory): Promise<[Set<string>, Set<tm.Map>]> {
    const filesOrDirs = await fs.readdir(this.prefix + dirname, { withFileTypes: true })
    if (filesOrDirs.length > 10000) {
      Logger.warn(
        `Trying to parse a large amount of maps (${filesOrDirs.length}), reading their info might take a while.`)
    }
    const parsed: Set<string> = new Set()
    const addedMaps: Set<tm.Map> = new Set()
    const presentSet: Set<string> = new Set(presentMaps.map(a => a.id))
    let done = 0
    for (const f of filesOrDirs) {
      if ((++done) % 10000 === 0) {
        Logger.info(`Parsed ${done}/${filesOrDirs.length} maps`)
      }
      if (f.isDirectory()) {
        const res: [Set<string>, Set<tm.Map>] = await this.parseMaps(presentMaps, dirname + f.name + '/')
        res[0].forEach(a => parsed.add(a))
        res[1].forEach(a => addedMaps.add(a))
        continue
      }
      const map = await this.parseMap(dirname + f.name, presentSet, parsed)
      if (map instanceof Error) {
        if (map.message.startsWith('PARSEERROR')) {
          Logger.debug(map.message)
        }
        continue
      }
      if (typeof map === 'string') {
        parsed.add(map)
        continue
      }
      if ((map as tm.ServerMap).UId !== undefined) {
        const mapObject: tm.Map = { ...MapService.constructNewMapObject(map), voteRatio: 0, voteCount: 0 }
        parsed.add(mapObject.id)
        addedMaps.add(mapObject)
      } else {
        Logger.error(
          'Function parseMap did not return error, but the resulting object does not contain a uid. File ' + dirname + f.name)
      }
    }
    return [parsed, addedMaps]
  }

  /**
   * Parse a Challenge.Gbx file into a map object
   * @param filename path to the file
   * @param presentMaps list of maps to check against, whether such a map already exists to skip parsing
   * @param parsed already parsed maps to check against
   * @returns trakman map object if the uid matches one from the present maps
   *          map object (same format as returned from the server) if parsing successful
   * @throws PARSEERROR if parsing failed
   *         EXISTS if map was already passed
   *         MISMATCH if map is incompatible with current game mode or environment setting
   */
  public static async parseMap(filename: string, presentMaps: Set<string>,
    parsed: Set<string> = new Set()): Promise<tm.ServerMap | string | Error> {
    const file = (await fs.readFile(this.prefix + filename)).toString()
    if (file.match(/<header +type="challenge"/gm)?.[0] === undefined) {
      return new Error('PARSEERROR: ' + filename + ' is not a challenge file')
    }
    let rawUid = file.match(/ident uid=".*?"/gm)?.[0]
    if (rawUid == null) {
      rawUid = file.match(/challenge uid=".*?"/gm)?.[0]
    }
    if (rawUid === undefined) {
      return new Error('PARSEERROR: Could not get uid of file ' + filename)
    }
    const uid = rawUid.match(/".*?"/gm)?.[0].slice(1, -1)
    if (uid === undefined) {
      return new Error('PARSEERROR: Uid exists in file ' + filename + ' but is not accessible!')
    }
    if (parsed.has(uid)) {
      return new Error('EXISTS: Map with uid ' + uid + ' has already been parsed')
    }
    if (presentMaps.has(uid)) {
      return uid
    }
    const mapType = file.match(/(?<!header +)type=".*?"/gm)?.[0].slice(6, -1)
    if (!((GameService.config.gameMode === 4 && mapType === 'Stunts') || mapType === 'Race')) {
      return new Error(
        'MISMATCH: Map ' + uid + ' is of type ' + mapType + ', which will not work with the current game mode')
    }
    const envir = file.match(/desc envir=".*?"/gm)?.[0].slice(12, -1)
    if (this.stadium && envir !== 'Stadium') {
      return new Error('MISMATCH: Map ' + uid + ' has environment ' + envir + ', not Stadium')
    }
    // Yes, author logins can sometimes be longer than 40 characters and map names can be longer than 60
    // ...for some reason (thanks Nadeo). Cut them here to prevent errors later.
    const author = file.match(/" author=".*?"/gm)?.[0].slice(10, -1).slice(0, 40)
    const name = file.match(/" name=".*?"/gm)?.[0].slice(8, -1).slice(0, 60)
    if (author === undefined || name === undefined || envir === undefined) {
      return new Error('PARSEERROR: Could not get map info of file ' + filename)
    }
    const price = file.match(/price=".*?"/gm)?.[0].slice(7, -1)
    const goldTime = file.match(/gold=".*?"/gm)?.[0].slice(6, -1)
    const mood = file.match(/["\x00](Day|Night|Sunrise|Sunset)/gm)?.[0].slice(1)
    const bronzeTime = file.match(/bronze=".*?"/gm)?.[0].slice(8, -1)
    const silverTime = file.match(/silver=".*?"/gm)?.[0].slice(8, -1)
    const authorTime = file.match(/authortime=".*?"/gm)?.[0].slice(12, -1)
    const nbLaps = file.match(/nblaps=".*?"/gm)?.[0].slice(8, -1)
    return {
      Name: name, UId: uid, FileName: filename, Environnement: envir, Author: author,
      GoldTime: goldTime == undefined ? 0 : parseInt(goldTime), CopperPrice: price == undefined ? 0 : parseInt(price),
      Mood: mood == undefined ? 'Day' : mood, BronzeTime: bronzeTime == undefined ? 0 : parseInt(bronzeTime),
      SilverTime: silverTime == undefined ? 0 : parseInt(silverTime),
      AuthorTime: authorTime == undefined ? 0 : parseInt(authorTime),
      NbLaps: nbLaps == undefined ? 0 : Math.min(Math.max(parseInt(nbLaps), 32767), -32768)
    }
  }

  /**
   * Create a MatchSettings file from the queue and load it into the server.
   * Does not write the file if it would have not changed.
   * WARNING: If the queue contains invalid maps (e.g. puzzles) the server keeps the old MatchSettings.
   * @param curr the current map
   * @param queue the queue
   * @param startAt
   */
  static async writeMS(curr: tm.CurrentMap, queue: tm.Map[], startAt = 0) {
    const newQueue = (queue.slice(0, config.manualMapLoading.preloadMaps))
    // don't write unless something has changed
    if (this.oldQueue !== undefined && this.oldCurr !== undefined && curr.id === this.oldCurr.id &&
      curr.fileName === this.oldCurr.fileName && this.oldQueue.length === newQueue.length && this.oldQueue.every(
      ((a, i) => a.id === newQueue[i].id && a.fileName === newQueue[i].fileName))) {
      Logger.trace('Did not write new MatchSettings')
      return
    }

    const maps = newQueue.map(a => `  <challenge>
    <file>${a.fileName.replaceAll('/', '\\')}</file>
    <ident>${a.id}</ident>
  </challenge>
`)
    maps.unshift(`  <challenge>
    <file>${curr.fileName.replaceAll('/', '\\')}</file>
    <ident>${curr.id}</ident>
  </challenge>
`)

    const game = GameService.config
    const header = `<?xml version="1.0" encoding="utf-8" ?>
<playlist>
  <gameinfos>
    <game_mode>${game.gameMode}</game_mode>
    <chat_time>${game.resultTime}</chat_time>
    <finishtimeout>${game.finishTimeout}</finishtimeout>
    <allwarmupduration>${game.warmUpDuration}</allwarmupduration>
    <disablerespawn>${game.disableRespawn ? 1 : 0}</disablerespawn>
    <forceshowallopponents>${game.forceShowOpponents}</forceshowallopponents>
    <rounds_pointslimit>${game.roundsPointLimitOld}</rounds_pointslimit>
    <rounds_usenewrules>${game.roundsPointSystemType === 'new' ? 1 : 0}</rounds_usenewrules>
    <rounds_forcedlaps>${game.roundsModeLapsAmount}</rounds_forcedlaps>
    <rounds_pointslimitnewrules>${game.roundsPointLimitNew}</rounds_pointslimitnewrules>
    <team_pointslimit>${game.teamPointLimitOld}</team_pointslimit>
    <team_maxpoints>${game.teamMaxPoints}</team_maxpoints>
    <team_usenewrules>${game.teamPointSystemType === 'old' ? 1 : 0}</team_usenewrules>
    <team_pointslimitnewrules>${game.teamPointLimitNew}</team_pointslimitnewrules>
    <timeattack_limit>${game.timeAttackLimit}</timeattack_limit>
    <timeattack_synchstartperiod>${game.countdownAdditionalTime}</timeattack_synchstartperiod>
    <laps_nblaps>${game.lapsModeLapsAmount}</laps_nblaps>
    <laps_timelimit>${game.lapsModeTimeLimit}</laps_timelimit>
    <cup_pointslimit>${game.cupPointsLimit}</cup_pointslimit>
    <cup_roundsperchallenge>${game.cupRoundsPerMap}</cup_roundsperchallenge>
    <cup_nbwinners>${game.cupWinnersAmount}</cup_nbwinners>
    <cup_warmupduration>${game.cupWarmUpRounds}</cup_warmupduration>
  </gameinfos>
  <hotseat>
    <game_mode>0</game_mode>
    <time_limit>300000</time_limit>
    <rounds_count>5</rounds_count>
  </hotseat>
  <filter>
    <is_lan>1</is_lan>
    <is_internet>1</is_internet>
    <is_solo>0</is_solo>
    <is_hotseat>0</is_hotseat>
    <sort_index>1000</sort_index>
    <random_map_order>0</random_map_order>
    <force_default_gamemode>0</force_default_gamemode>
  </filter>
  <startindex>${startAt}</startindex>
`
    if (!await Client.call('WriteFile', [{ string: 'MatchSettings.trakman.txt' },
      { base64: Buffer.from(header + maps.join('') + '</playlist>').toString('base64') }])) {
      Logger.error('Could not write new MatchSettings file')
      return
    }
    const res = await Client.call(`LoadMatchSettings`, [{ string: 'MatchSettings.trakman.txt' }])
    if (res instanceof Error) {
      Logger.error('Could not load new match settings')
      return
    }
    Logger.info('Updated MatchSettings, starting at ' + startAt)
    this.mapIndex = startAt
    this.oldCurr = curr
    this.oldQueue = newQueue
  }

  /**
   * Update current map and write a new MatchSettings if the next map hasn't been loaded yet.
   * @param curr the current map
   * @param queue the queue
   */
  static async nextMap(curr: tm.CurrentMap, queue: tm.Map[]) {
    if (++this.mapIndex >= config.manualMapLoading.preloadMaps) {
      await this.writeMS(curr, queue, 1)
    }
  }
}
