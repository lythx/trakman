import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { ChallengeService } from './ChallengeService.js'
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
    const res = await this.repo.getAll()
    for (const record of res) { this._records.push({ challenge: record.challenge, score: record.score, login: record.login, date: record.date, checkpoints: record.checkpoints }) }
  }

  static async fetchRecords(challengeId: string): Promise<LocalRecord[]> {
    this._localRecords.length = 0
    this._liveRecords.length = 0
    const records = await this.repo.get(challengeId)
    records.sort((a, b) => a.score - b.score)
    const n = Math.min(Number(process.env.LOCALS_AMOUNT), records.length)
    for (let i = 0; i < n; i++) {
      const player = await PlayerService.fetchPlayer(records[i].login)
      if (player == null) {
        ErrorHandler.fatal('Cant find login in players table even though it has record in records table.')
        return []
      }
      const localRecord: LocalRecord = {
        challenge: challengeId,
        login: records[i].login,
        score: records[i].score,
        date: records[i].date,
        checkpoints: records[i].checkpoints,
        position: i + 1,
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        privilege: player.privilege,
        timePlayed: player.timePlayed,
        wins: player.wins,
        visits: player.visits
      }
      this._localRecords.push(localRecord)
    }
    Events.emitEvent('Controller.LocalRecords', records)
    return this._localRecords
  }

  static async fetchRecord(challengeId: string, login: string): Promise<TMRecord | null> {
    const res = (await this.repo.getByLogin(challengeId, login))?.[0]
    if (res == null) { return null }
    return { challenge: challengeId, score: res.score, login, date: res.date, checkpoints: res.checkpoints }
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

  static async add(challenge: string, login: string, score: number): Promise<void> {
    const date = new Date()
    const player = PlayerService.getPlayer(login)
    const cpsPerLap = ChallengeService.current.checkpointsAmount
    let laps
    if (GameService.game.gameMode === 1 || !ChallengeService.current.lapRace) {
      laps = 1
    } else if (GameService.game.gameMode === 3) {
      laps = GameService.game.lapsNo
    } else if (GameService.game.gameMode === 4) {
      return // TODO STUNTS MODE
    } else {
      laps = ChallengeService.current.lapsAmount
    }
    const cpAmount = cpsPerLap * laps
    const checkpoints = [...player.checkpoints.map(a => a.time)]
    const temp: any = player
    temp.checkpoints = [...checkpoints] // break the reference
    temp.challenge = challenge
    temp.score = score
    const finishInfo: FinishInfo = temp
    await this.handleLocalRecord(challenge, login, score, date, cpAmount, [...checkpoints], player)
    this.handleLiveRecord(challenge, login, score, date, cpAmount, [...checkpoints], player)
    Events.emitEvent('Controller.PlayerFinish', finishInfo)
  }

  private static async handleLocalRecord(challenge: string, login: string, score: number, date: Date, cpAmount: number, checkpoints: number[], player: TMPlayer) {
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb = this._localRecords.find(a => a.login === login)?.score
    const position = this._localRecords.filter(a => a.score <= score).length + 1
    if (pb == null) {
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore: -1,
        previousPosition: -1
      }
      this._records.splice(position - 1, 0, { challenge, login, score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        const localRecord: LocalRecord = {
          challenge,
          login,
          score,
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
      const previousPosition = this.records.findIndex(a => a.login === this.records.find(a => a.login === login)?.login) + 1
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore: score,
        previousPosition
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      return
    }
    if (score < pb) {
      const previousScore = this._localRecords.find(a => a.login === login)?.score
      if (previousScore === undefined) {
        ErrorHandler.error(`Can't find player ${login} in memory`)
        return
      }
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore
      }
      this._records = this._records.filter(a => !(a.login == login && a.challenge === challenge))
      this._records.splice(position - 1, 0, { challenge, login, score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._localRecords = this._localRecords.filter(a => a.login !== login)
        const localRecord: LocalRecord = {
          challenge,
          login,
          score,
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

  private static handleLiveRecord(challenge: string, login: string, score: number, date: Date, cpAmount: number, checkpoints: number[], player: TMPlayer): void {
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb = this._liveRecords.find(a => a.login === login)?.score
    const position = this._liveRecords.filter(a => a.score <= score).length + 1
    if (pb == null) {
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore: -1,
        previousPosition: -1
      }
      this._liveRecords.splice(position - 1, 0, {
        login,
        nickName: player.nickName,
        score,
        checkpoints,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        visits: player.visits,
        wins: player.wins,
        privilege: player.privilege,
        challenge,
        nation: player.nation,
        nationCode: player.nationCode
      })
      Events.emitEvent('Controller.LiveRecord', recordInfo)
      return
    }
    if (score === pb) {
      const previousPosition = this._liveRecords.findIndex(a => a.login === this._liveRecords.find(a => a.login === login)?.login) + 1
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore: score,
        previousPosition
      }
      Events.emitEvent('Controller.LiveRecord', recordInfo)
      return
    }
    if (score < pb) {
      const previousScore = this._liveRecords.find(a => a.login === login)?.score
      if (previousScore === undefined) {
        ErrorHandler.error(`Can't find player ${login} in memory`)
        return
      }
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
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
        previousScore
      }
      this._liveRecords = this._liveRecords.filter(a => a.login !== login)
      this._liveRecords.splice(position - 1, 0, {
        login,
        nickName: player.nickName,
        score,
        checkpoints,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        visits: player.visits,
        wins: player.wins,
        privilege: player.privilege,
        challenge,
        nation: player.nation,
        nationCode: player.nationCode
      })
      Events.emitEvent('Controller.LiveRecord', recordInfo)
    }
  }
}