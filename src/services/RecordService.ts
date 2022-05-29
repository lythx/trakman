'use strict'
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
  private static _topPlayers: TopPlayer[] = []

  static async initialize(repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async fetchRecords(challengeId: string): Promise<TMRecord[]> {
    this._records.length = 0
    this._topPlayers.length = 0
    const records = await this.repo.get(challengeId)
    records.sort((a, b) => a.score - b.score)
    const n = Math.min(Number(process.env.LOCALS_AMOUNT), records.length)
    for (let i = 0; i < n; i++) {
      const player = await PlayerService.fetchPlayer(records[i].login)
      if (player == null) {
        ErrorHandler.fatal('Cant find login in players table even though it has record in records table.')
        return []
      }
      const topPlayer: TopPlayer = {
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
      this._topPlayers.push(topPlayer)
    }
    for (const r of records) {
      this._records.push({ challenge: challengeId, score: r.score, login: r.login, date: r.date, checkpoints: r.checkpoints })
    }
    Events.emitEvent('Controller.LocalRecords', records)
    return this._records
  }

  static async fetchRecord(challengeId: string, login: string): Promise<TMRecord | null> {
    const res = (await this.repo.getByLogin(challengeId, login))?.[0]
    if (res == null) { return null }
    return { challenge: challengeId, score: res.score, login, date: res.date, checkpoints: res.checkpoints }
  }

  static get records(): TMRecord[] {
    return [...this._records]
  }

  static get topPlayers(): TopPlayer[] {
    return [...this._topPlayers]
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
    Events.emitEvent('Controller.PlayerFinish', finishInfo)
    if (checkpoints.length !== cpAmount - 1) {
      checkpoints.length = 0
      return
    }
    const pb = this._records.find(a => a.login === login)?.score
    const position = this._records.filter(a => a.score < score).length + 1
    if (pb == null) {
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
        date,
        checkpoints,
        status: 'new',
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        wins: player.wins,
        privilege: player.privilege,
        visits: player.visits,
        position
      }
      this._records.splice(position - 1, 0, { challenge, login, score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        const topPlayer: TopPlayer = {
          challenge, login, score, date, checkpoints, nickName: player.nickName,
          nation: player.nation, nationCode: player.nationCode,
          timePlayed: player.timePlayed, wins: player.wins,
          privilege: player.privilege, visits: player.visits, position
        }
        this._topPlayers.splice(position - 1, 0, topPlayer)
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.add(recordInfo)
      return
    }
    if (score === pb) {
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
        date,
        checkpoints,
        status: 'equal',
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        wins: player.wins,
        privilege: player.privilege,
        visits: player.visits,
        position
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      return
    }
    if (score < pb) {
      const recordInfo: RecordInfo = {
        challenge,
        login,
        score,
        date,
        checkpoints,
        status: 'improved',
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp,
        wins: player.wins,
        privilege: player.privilege,
        visits: player.visits,
        position
      }
      this._records = this._records.filter(a => a.login !== login)
      this._records.splice(position - 1, 0, { challenge, login, score, date, checkpoints })
      if (position <= Number(process.env.LOCALS_AMOUNT)) {
        this._topPlayers = this._topPlayers.filter(a => a.login !== login)
        const topPlayer: TopPlayer = {
          challenge, login, score, date, checkpoints, nickName: player.nickName,
          nation: player.nation, nationCode: player.nationCode,
          timePlayed: player.timePlayed, wins: player.wins,
          privilege: player.privilege, visits: player.visits, position
        }
        this._topPlayers.splice(position - 1, 0, topPlayer)
      }
      Events.emitEvent('Controller.PlayerRecord', recordInfo)
      await this.repo.update(recordInfo)
    }
  }
}
