import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { MapService } from './MapService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import { Logger } from '../Logger.js'
import 'dotenv/config'
import { Utils } from '../Utils.js'

export class RecordService {

  private static repo: RecordRepository = new RecordRepository()
  private static readonly _localRecords: TMLocalRecord[] = []
  private static readonly _liveRecords: FinishInfo[] = []
  private static readonly localsAmount = Number(process.env.LOCALS_AMOUNT)

  static async initialize(): Promise<void> {
    if (this.localsAmount === NaN) {
      await Logger.fatal('LOCALS_AMOUNT is undefined or not a number. Check your .env file')
    }
    await this.repo.initialize()
    await this.fetchRecords(MapService.current.id)
  }

  static async fetchRecords(mapId: string): Promise<TMLocalRecord[]> {
    this._localRecords.length = 0
    this._liveRecords.length = 0
    const records: TMRecord[] = await this.repo.get(mapId)
    for (const e of records) {
      const player: TMOfflinePlayer | undefined = await PlayerService.fetchPlayer(e.login)
      if (player === undefined) {
        Logger.fatal('Cant find login in players table even though it has record in records table.')
        return []
      }
      this._localRecords.push({
        ...e,
        ...player
      })
    }
    Events.emitEvent('Controller.LocalRecords', records)
    return this._localRecords
  }

  static async fetchRecord(mapId: string, login: string): Promise<TMRecord | undefined> {
    return await this.repo.getByLogin(mapId, login)
  }

  static get localRecords(): TMLocalRecord[] {
    return [...this._localRecords]
  }

  static get liveRecords(): FinishInfo[] {
    return [...this._liveRecords]
  }

  static add(map: string, player: TMPlayer, time: number): false | { finishInfo: FinishInfo, localRecord?: RecordInfo, liveRecord?: RecordInfo } {
    console.log(map, player,time)
    const date: Date = new Date()
    const cpsPerLap: number = MapService.current.checkpointsAmount
    let laps: number
    if (GameService.game.gameMode === 1 || !MapService.current.isLapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else if (GameService.game.gameMode === 4) {
      return false// TODO STUNTS MODE
    } else {
      laps = MapService.current.lapsAmount
    }
    const cpAmount: number = cpsPerLap * laps
    const checkpoints: number[] = [...player.currentCheckpoints.map(a => a.time)]
    const temp: any = player
    temp.checkpoints = [...checkpoints] // break the reference
    temp.map = map
    temp.time = time
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return false
    }
    const finishInfo: FinishInfo = temp
    const localRecord = this.handleLocalRecord(map, time, date, [...checkpoints], player)
    const liveRecord = this.handleLiveRecord(map, time, date, [...checkpoints], player)
    return { localRecord, finishInfo, liveRecord }
  }

  private static handleLocalRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: TMPlayer): RecordInfo | undefined {
    const pb: number | undefined = this._localRecords.find(a => a.login === player.login)?.time
    const position: number = this._localRecords.filter(a => a.time <= time).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, -1, position, -1)
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords.splice(position - 1, 0, recordInfo)
      }
      Logger.info(...this.getLogString(-1, position, -1, time, player.login, 'local'))
      void this.repo.add(recordInfo)
      return recordInfo
    }
    if (time === pb) {
      const previousPosition: number = this._localRecords
        .findIndex(a => a.login === this._localRecords.find(a => a.login === player.login)?.login) + 1
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousPosition, previousPosition)
      Logger.info(...this.getLogString(previousPosition, previousPosition, time, time, player.login, 'local'))
      return recordInfo
    }
    if (time < pb) {
      const previousIndex = this._localRecords.findIndex(a => a.login === player.login)
      if (previousIndex === -1) {
        Logger.error(`Can't find player ${player.login} in memory`)
        return
      }
      const previousTime: number | undefined = this._localRecords[previousIndex].time
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords.splice(previousIndex, 1)
        this._localRecords.splice(position - 1, 0, recordInfo)
      }
      Logger.info(...this.getLogString(previousIndex + 1, position, previousTime, time, player.login, 'local'))
      void this.repo.update(recordInfo.map, recordInfo.login, recordInfo.time, recordInfo.checkpoints, recordInfo.date)
      return recordInfo
    }
  }

  // TODO MOVE FUNCTION TO FORMAT RECORD CHAT MESSAGE TO UTILS OR HERE AND USE IT TO LOG
  private static handleLiveRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: TMPlayer): RecordInfo | undefined {
    const pb: number | undefined = this._liveRecords.find(a => a.login === player.login)?.time
    const position: number = this._liveRecords.filter(a => a.time <= time).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, -1, position, -1)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(-1, position, -1, time, player.login, 'live'))
      return recordInfo
    }
    if (time === pb) {
      const previousPosition: number = this._liveRecords.findIndex(a => a.login === this._liveRecords.find(a => a.login === player.login)?.login) + 1
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, time, previousPosition, previousPosition)
      Logger.trace(...this.getLogString(previousPosition, previousPosition, time, time, player.login, 'live'))
      return recordInfo
    }
    if (time < pb) {
      const previousIndex = this._liveRecords.findIndex(a => a.login === player.login)
      if (previousIndex === -1) {
        Logger.error(`Can't find player ${player.login} in memory`)
        return
      }
      const previousTime: number | undefined = this._liveRecords[previousIndex].time
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, previousTime, position, previousIndex + 1)
      this._liveRecords.splice(previousIndex, 1)
      this._liveRecords.splice(position - 1, 0, recordInfo)
      Logger.trace(...this.getLogString(previousIndex + 1, position, previousTime, time, player.login, 'live'))
      return recordInfo
    }
  }

  static remove(login: string, mapId: string, callerLogin?: string): void {
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has removed ${login} record on map ${mapId}`)
    } else {
      Logger.info(`${login} record on map ${mapId} has been removed`)
    }
    this._localRecords.splice(this._localRecords.findIndex(a => a.login === login && a.map === mapId), 1)
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    void this.repo.remove(login, mapId)
  }

  static removeAll(mapId: string, callerLogin?: string): void {
    if (callerLogin !== undefined) {
      Logger.info(`${callerLogin} has removed records on map ${mapId}`)
    } else {
      Logger.info(`Records on map ${mapId} have been removed`)
    }
    while (this._localRecords.some(a => a.map === mapId)) {
      this._localRecords.splice(this._localRecords.findIndex(a => a.map === mapId), 1)
    }
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    void this.repo.removeAll(mapId)
  }

  private static constructRecordObject(player: TMPlayer, mapId: string, date: Date, checkpoints: number[],
    time: number, previousTime: number, position: number, previousPosition: number): RecordInfo {
    return {
      map: mapId,
      login: player.login,
      time,
      date,
      checkpoints,
      nickname: player.nickname,
      nation: player.nation,
      nationCode: player.nationCode,
      timePlayed: player.timePlayed,
      joinTimestamp: player.joinTimestamp,
      wins: player.wins,
      privilege: player.privilege,
      visits: player.visits,
      position,
      previousTime,
      previousPosition,
      playerId: player.id,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited
    }
  }

  private static getLogString(previousPosition: number, position: number, previousTime: number, time: number, login: string, recordType: 'live' | 'local'): string[] {
    let rs = { str: '', calcDiff: false } // Rec status
    let diff // Difference
    if (previousPosition === -1) { rs.str = 'acquired', rs.calcDiff = false }
    else if (previousPosition > position) { rs.str = 'obtained', rs.calcDiff = true }
    else if (previousPosition === position && previousTime === time) { rs.str = 'equaled', rs.calcDiff = false }
    else if (previousPosition === position) { rs.str = 'improved', rs.calcDiff = true }
    if (rs.calcDiff) {
      diff = Utils.getTimeString(previousTime - time)
      let i: number = -1
      while (true) {
        i++
        if (diff[i] === undefined || (!isNaN(Number(diff[i])) && Number(diff[i]) !== 0) || diff.length === 4) { break }
        if (Number(diff[i]) !== 0) { continue }
        diff = diff.substring(1)
        i--
        if (diff[i + 1] === ':') {
          diff = diff.substring(1)
        }
      }
    }
    return [`${login} has ${rs.str} the ${Utils.getPositionString(position)} ${recordType} record. Time: ${Utils.getTimeString(time)}${rs.calcDiff ? ` (${previousPosition} -${diff})` : ``}`]
  }

}