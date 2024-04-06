import fs from 'fs/promises'

import { Logger } from '../../src/Logger.js'
import { Client } from '../../src/client/Client.js'
import config from '../../config/Config.js'

export class ManualMapLoading {
  static readonly prefix: string = config.mapsDirectoryPrefix
  static mapIndex: number = 0

  static async parseMaps(dirname: string = config.mapsDirectory) {
    const filesOrDirs = await fs.readdir(this.prefix + dirname, {withFileTypes: true})
    if (filesOrDirs.length > 5000) Logger.warn(`Trying to parse a large amount of maps (${filesOrDirs.length}), reading their info might take a while.`)
    let maps: tm.ServerMap[] = []
    let i = 0
    for (const f of filesOrDirs) {
      if (++i > 130000) break
      if (i <= 119996) continue
      if (f.isDirectory()) {
        maps.push(...(await this.parseMaps(dirname + f.name)))
        continue
      }
      const map = await this.parseMap(dirname + '/' + f.name)
      if (map.UId != undefined && !maps.map(a => a.UId).includes(map.UId)) maps.push(map)
    }
    Logger.trace("Parsed maps")
    return maps
  }

  static async writeMS(curr: tm.CurrentMap, queue: tm.Map[], startAt: number = 0) {
    let maps = queue.slice(0, config.preloadMaps).map(a => `  <challenge>
    <file>${a.fileName.replaceAll('/', '\\')}</file>
    <ident>${a.id}</ident>
  </challenge>
`)
    maps.unshift(`  <challenge>
    <file>${curr.fileName.replaceAll('/', '\\')}</file>
    <ident>${curr.id}</ident>
  </challenge>
`)

    const game = tm.config.game
    const header: string = `<?xml version="1.0" encoding="utf-8" ?>
<playlist>
  <gameinfos>
    <game_mode>${game.gameMode}</game_mode>
    <chat_time>10000</chat_time>
    <finishtimeout>${game.finishTimeout}</finishtimeout>
    <allwarmupduration>${game.warmUpDuration}</allwarmupduration>
    <disablerespawn>${game.disableRespawn ? 1 : 0}</disablerespawn>
    <forceshowallopponents>${game.forceShowOpponents}</forceshowallopponents>
    <rounds_pointslimit>${game.roundsPointLimitOld}</rounds_pointslimit>
    <rounds_usenewrules>1</rounds_usenewrules>
    <rounds_forcedlaps>${game.roundsModeLapsAmount}</rounds_forcedlaps>
    <rounds_pointslimitnewrules>${game.roundsPointLimitNew}</rounds_pointslimitnewrules>
    <team_pointslimit>${game.teamPointLimitOld}</team_pointslimit>
    <team_maxpoints>${game.teamMaxPoints}</team_maxpoints>
    <team_usenewrules>1</team_usenewrules>
    <team_pointslimitnewrules>${game.teamPointLimitNew}</team_pointslimitnewrules>
    <timeattack_limit>${game.timeAttackLimit}</timeattack_limit>
    <timeattack_synchstartperiod>0</timeattack_synchstartperiod>
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

    if (!await Client.call('WriteFile', [{string: 'MatchSettings.trakman.txt'}, {base64: btoa(header + maps.join('') + '</playlist>')}])) {
      Logger.error('Could not write new MatchSettings file')
      return
    }
    const res = await Client.call(`LoadMatchSettings`, [{string: 'MatchSettings.trakman.txt'}])
    if (res instanceof Error) {
      Logger.error('Could not load new match settings')
      return
    }
    Logger.info("Updated MatchSettings, starting at " + startAt)
    this.mapIndex = startAt
  }

  static async nextMap(curr: tm.CurrentMap, queue: tm.Map[]) {
    if (++this.mapIndex >= config.preloadMaps) await this.writeMS(curr, queue, 1)
  }

  public static async parseMap(filename: string) {
    if (filename.slice(-14) !== ".Challenge.Gbx") return {}
    const file = (await fs.readFile(this.prefix + '/' + filename)).toString()
    let rawUid = file.match(/ident uid=".*?"/gm)?.[0]
    if (rawUid == null) rawUid = file.match(/challenge uid=".*?"/gm)?.[0]
    if (rawUid == undefined) {
      Logger.warn('Could not get uid of file ', filename)
      return {}
    }
    const uid = rawUid.match(/".*?"/gm)?.[0].slice(1, -1)
    const envir = file.match(/desc envir=".*?"/gm)?.[0].slice(12, -1)
    if (config.stadiumOnly && envir !== "Stadium") {
      Logger.warn('Non-stadium environment in file ', filename)
      return {}
    }
    const author = file.match(/" author=".*?"/gm)?.[0].slice(10, -1)
    const name = file.match(/" name=".*?"/gm)?.[0].slice(8, -1).slice(0, 60)
    const price = file.match(/price=".*?"/gm)?.[0].slice(7, -1)
    const goldTime = file.match(/gold=".*?"/gm)?.[0].slice(6, -1)
    const mood = file.match(/["\x00](Day|Night|Sunrise|Sunset)/gm)?.[0].slice(1)
    const bronzeTime = file.match(/bronze=".*?"/gm)?.[0].slice(8, -1)
    const silverTime = file.match(/silver=".*?"/gm)?.[0].slice(8, -1)
    const authorTime = file.match(/authortime=".*?"/gm)?.[0].slice(12, -1)
    const nbLaps = file.match(/nblaps=".*?"/gm)?.[0].slice(8, -1)
    if (uid == undefined || author == undefined || name == undefined || envir == undefined) {
      Logger.warn('Could not get map info of file ', filename)
      return {}
    }
    return {
      Name: name,
      UId: uid,
      FileName: filename,
      Environnement: envir,
      Author: author,
      GoldTime: goldTime == undefined? 0 : parseInt(goldTime),
      CopperPrice: price == undefined? 0 : parseInt(price),
      Mood: mood == undefined? "Day" : mood,
      BronzeTime: bronzeTime == undefined? 0 : parseInt(bronzeTime),
      SilverTime: silverTime == undefined? 0 : parseInt(silverTime),
      AuthorTime: authorTime == undefined? 0 : parseInt(authorTime),
      NbLaps: nbLaps == undefined? 0 : parseInt(nbLaps)
    }
  }

}