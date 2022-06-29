import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { MapService } from './MapService.js'
import { Events } from '../Events.js'
import { GameService } from './GameService.js'
import 'dotenv/config'
import { ErrorHandler } from '../ErrorHandler.js'

export class RecordService {
  private static repo: RecordRepository
  private static _records: TMRecord[] = []
  private static _localRecords: LocalRecord[] = []
  private static _liveRecords: FinishInfo[] = []

  static async initialize(repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
    const res: any[] = await this.repo.getAll()
    for (const record of res) { this._records.push({ map: record.map, time: record.score, login: record.login, date: record.date, checkpoints: record.checkpoints }) }
  }

  static async fetchRecords(mapId: string): Promise<LocalRecord[]> {
    this._localRecords.length = 0
    this._liveRecords.length = 0
    const records: any[] = await this.repo.get(mapId)
    records.sort((a, b): number => a.score - b.score)
    const n: number = Math.min(Number(process.env.LOCALS_AMOUNT), records.length)
    for (let i: number = 0; i < n; i++) {
      const player: DBPlayerInfo | undefined = await PlayerService.fetchPlayer(records[i].login)
      if (player === undefined) {
        ErrorHandler.fatal('Cant find login in players table even though it has record in records table.')
        return []
      }
      const localRecord: LocalRecord = {
        map: mapId,
        login: records[i].login,
        time: records[i].score,
        date: records[i].date,
        checkpoints: records[i].checkpoints,
        position: i + 1,
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
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
    const res: any = (await this.repo.getByLogin(mapId, login))?.[0]
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

  static async add(map: string, login: string, score: number): Promise<void> {
    const date: Date = new Date()
    const player: TMPlayer | undefined = PlayerService.getPlayer(login)
    if (player === undefined) {
      return
    }
    const cpsPerLap: number = MapService.current.checkpointsAmount
    let laps
    if (GameService.game.gameMode === 1 || !MapService.current.lapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else if (GameService.game.gameMode === 4) {
      return // TODO STUNTS MODE
    } else {
      laps = MapService.current.lapsAmount
    }
    const cpAmount: number = cpsPerLap * laps
    const checkpoints: number[] = [...player.checkpoints.map(a => a.time)]
    const temp: any = player
    temp.checkpoints = [...checkpoints] // break the reference
    temp.map = map
    temp.score = score
    const finishInfo: FinishInfo = temp
    await this.handleLocalRecord(map, login, score, date, cpAmount, [...checkpoints], player)
    this.handleLiveRecord(map, login, score, date, cpAmount, [...checkpoints], player)
    Events.emitEvent('Controller.PlayerFinish', finishInfo)
  }

  private static async handleLocalRecord(map: string, login: string, score: number, date: Date, cpAmount: number, checkpoints: number[], player: TMPlayer) {
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb: number | undefined = this._localRecords.find(a => a.login === login)?.time
    const position: number = this._localRecords.filter(a => a.time <= score).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        previousTime: -1,
        previousPosition: -1,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      this._records.splice(position - 1, 0, { map: map, login, time: score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        const localRecord: LocalRecord = {
          map: map,
          login,
          time: score,
          date,
          checkpoints,
          nickName: player.nickName,
          nation: player.nation,
          nationCode: player.nationCode,
          timePlayed: player.timePlayed,
          wins: player.wins,
          privilege: player.privilege,
          visits: player.visits,
          position
        }
        this._localRecords.splice(position - 1, 0, localRecord)
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      this.repo.add(recordInfo)
      return
    }
    if (score === pb) {
      const previousPosition: number = this.records.findIndex(a => a.login === this.records.find(a => a.login === login)?.login) + 1
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        position: previousPosition,
        previousTime: score,
        previousPosition,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      return
    }
    if (score < pb) {
      const previousScore: number | undefined = this._localRecords.find(a => a.login === login)?.time
      if (previousScore === undefined) {
        ErrorHandler.error(`Can't find player ${login} in memory`)
        return
      }
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        previousPosition: this._localRecords.findIndex(a => a.login === login) + 1,
        previousTime: previousScore,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      this._records = this._records.filter(a => !(a.login == login && a.map === map))
      this._records.splice(position - 1, 0, { map: map, login, time: score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords = this._localRecords.filter(a => a.login !== login)
        const localRecord: LocalRecord = {
          map: map,
          login,
          time: score,
          date,
          checkpoints,
          nickName: player.nickName,
          nation: player.nation,
          nationCode: player.nationCode,
          timePlayed: player.timePlayed,
          wins: player.wins,
          privilege: player.privilege,
          visits: player.visits,
          position
        }
        this._localRecords.splice(position - 1, 0, localRecord)
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      this.repo.update(recordInfo)
    }
  }

  private static handleLiveRecord(map: string, login: string, score: number, date: Date, cpAmount: number, checkpoints: number[], player: TMPlayer): void {
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb: number | undefined = this._liveRecords.find(a => a.login === login)?.time
    const position: number = this._liveRecords.filter(a => a.time <= score).length + 1
    if (pb === undefined) {
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        previousTime: -1,
        previousPosition: -1,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      this._liveRecords.splice(position - 1, 0, {
        login,
        nickName: player.nickName,
        time: score,
        checkpoints,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        visits: player.visits,
        wins: player.wins,
        privilege: player.privilege,
        map: map,
        nation: player.nation,
        nationCode: player.nationCode,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      })
      Events.emitEvent('Controller.LiveRecord', recordInfo)
      return
    }
    if (score === pb) {
      const previousPosition: number = this._liveRecords.findIndex(a => a.login === this._liveRecords.find(a => a.login === login)?.login) + 1
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        position: previousPosition,
        previousTime: score,
        previousPosition,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      Events.emitEvent('Controller.LiveRecord', recordInfo)
      return
    }
    if (score < pb) {
      const previousScore: number | undefined = this._liveRecords.find(a => a.login === login)?.time
      if (previousScore === undefined) {
        ErrorHandler.error(`Can't find player ${login} in memory`)
        return
      }
      const recordInfo: RecordInfo = {
        map: map,
        login,
        time: score,
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
        previousPosition: this._liveRecords.findIndex(a => a.login === login) + 1,
        previousTime: previousScore,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      }
      this._liveRecords = this._liveRecords.filter(a => a.login !== login)
      this._liveRecords.splice(position - 1, 0, {
        login,
        nickName: player.nickName,
        time: score,
        checkpoints,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        visits: player.visits,
        wins: player.wins,
        privilege: player.privilege,
        map: map,
        nation: player.nation,
        nationCode: player.nationCode,
        playerId: player.playerId,
        ip: player.ip,
        region: player.region,
        isUnited: player.isUnited
      })
      Events.emitEvent('Controller.LiveRecord', recordInfo)
    }
  }

  static async remove(login: string, mapId: string): Promise<any[]> {
    this._records.splice(this._records.findIndex(a => a.login === login && a.map === mapId), 1)
    this._localRecords.splice(this._localRecords.findIndex(a => a.login === login && a.map === mapId), 1)
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    return await this.repo.remove(login, mapId)
  }

  static async removeAll(mapId: string): Promise<any[]> {
    while (this._records.some(a => a.map === mapId)) {
      this._records.splice(this._records.findIndex(a => a.map === mapId), 1)
    }
    while (this._localRecords.some(a => a.map === mapId)) {
      this._localRecords.splice(this._localRecords.findIndex(a => a.map === mapId), 1)
    }
    Events.emitEvent('Controller.LocalRecords', this.localRecords)
    return await this.repo.removeAll(mapId)
  }

}