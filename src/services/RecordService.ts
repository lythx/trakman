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
  private static readonly _records: TMRecord[] = [] // TODO: dont hold all records in memory this is probably a bad idea since there is a lot of them
  private static readonly _localRecords: LocalRecord[] = []
  private static readonly _liveRecords: FinishInfo[] = []

  static async initialize(): Promise<void> {
    if (process.env.LOCALS_AMOUNT === undefined || Number(process.env.LOCALS_AMOUNT) === NaN) {
      Logger.fatal('LOCALS_AMOUNT is undefined or not a number. Check your .env file')
    }
    await this.repo.initialize()
    const res: RecordsDBEntry[] = await this.repo.getAll()
    for (const record of res) { this._records.push({ map: record.map, time: record.score, login: record.login, date: record.date, checkpoints: record.checkpoints }) }
    await this.fetchRecords(MapService.current.id)
  }

  static async fetchRecords(mapId: string): Promise<LocalRecord[]> {
    this._localRecords.length = 0
    this._liveRecords.length = 0
    const records: RecordsDBEntry[] = await this.repo.get(mapId)
    records.sort((a, b): number => a.score - b.score)
    const n: number = Math.min(Number(process.env.LOCALS_AMOUNT), records.length)
    for (let i: number = 0; i < n; i++) {
      const player: PlayersDBEntry | undefined = await PlayerService.fetchPlayer(records[i].login)
      if (player === undefined) {
        Logger.fatal('Cant find login in players table even though it has record in records table.')
        return []
      }
      const localRecord: LocalRecord = {
        map: mapId,
        login: records[i].login,
        time: records[i].score,
        date: records[i].date,
        checkpoints: records[i].checkpoints,
        position: i + 1,
        nickName: player.nickname,
        nation: player.nation,
        nationCode: player.nation, // TODO: fix nation code or just dont store it idk (its not in db)
        privilege: player.privilege,
        timePlayed: player.timePlayed,
        wins: player.wins,
        visits: player.visits,
      }
      this._localRecords.push(localRecord)
    }
    Events.emitEvent('Controller.LocalRecords', records)
    return this._localRecords
  }

  static async fetchRecord(mapId: string, login: string): Promise<TMRecord | undefined> {
    const res = await this.repo.getByLogin(mapId, login)
    if (res === undefined) { return undefined }
    return { map: mapId, time: res.score, login, date: res.date, checkpoints: res.checkpoints }
  }

  static get records(): TMRecord[] {
    return [...this._records]
  }

  static get localRecords(): LocalRecord[] {
    return [...this._localRecords]
  }

  static get liveRecords(): FinishInfo[] {
    return [...this._liveRecords]
  }

  static add(map: string, player: TMPlayer, time: number): false | { finishInfo: FinishInfo, localRecord?: RecordInfo, liveRecord?: RecordInfo } {
    const date: Date = new Date()
    const cpsPerLap: number = MapService.current.checkpointsAmount
    let laps: number
    if (GameService.game.gameMode === 1 || !MapService.current.lapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else if (GameService.game.gameMode === 4) {
      return false// TODO STUNTS MODE
    } else {
      laps = MapService.current.lapsAmount
    }
    const cpAmount: number = cpsPerLap * laps
    const checkpoints: number[] = [...player.checkpoints.map(a => a.time)]
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
    Events.emitEvent('Controller.PlayerFinish', finishInfo)
    return { localRecord, finishInfo, liveRecord }
  }

  // TODO MOVE FUNCTION TO FORMAT RECORD CHAT MESSAGE TO UTILS OR HERE AND USE IT TO LOG
  private static handleLocalRecord(mapId: string, time: number, date: Date, checkpoints: number[], player: TMPlayer): RecordInfo | undefined {
    const pb: number | undefined = this._localRecords.find(a => a.login === player.login)?.time
    const position: number = this._localRecords.filter(a => a.time <= time).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = this.constructRecordObject(player, mapId, date, checkpoints, time, -1, position, -1)
      this._records.splice(position - 1, 0, recordInfo)
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords.splice(position - 1, 0, recordInfo)
      }
      Logger.info(...this.getLogString(-1, position, -1, time, player.login, 'local'))
      void this.repo.add(recordInfo)
      return recordInfo
    }
    if (time === pb) {
      const previousPosition: number = this.records.findIndex(a => a.login === this.records.find(a => a.login === player.login)?.login) + 1
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
      this._records.splice(this._records.findIndex(a => !(a.login == player.login && a.map === mapId)), 1)
      this._records.splice(position - 1, 0, { map: mapId, login: player.login, time: time, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords.splice(previousIndex, 1)
        this._localRecords.splice(position - 1, 0, recordInfo)
      }
      Logger.info(...this.getLogString(previousIndex + 1, position, previousTime, time, player.login, 'local'))
      void this.repo.update(recordInfo)
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
    this._records.splice(this._records.findIndex(a => a.login === login && a.map === mapId), 1)
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
    while (this._records.some(a => a.map === mapId)) {
      this._records.splice(this._records.findIndex(a => a.map === mapId), 1)
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
      nickName: player.nickName,
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
      playerId: player.playerId,
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