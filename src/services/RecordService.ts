'use strict'
import { randomUUID } from 'crypto'
import { RecordRepository } from '../database/RecordRepository.js'
import { PlayerService } from './PlayerService.js'
import { ErrorHandler } from '../ErrorHandler.js'
import { Events } from '../Events.js'

export class RecordService {
  private static repo: RecordRepository
  private static readonly _records: TMRecord[] = []

  static async initialize (repo: RecordRepository = new RecordRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async fetchRecords (challengeId: string): Promise<TMRecord[]> {
    const records = await this.repo.get(challengeId)
    for (const r of records) {
      const record: TMRecord = {
        id: r.id,
        challenge: r.challenge,
        login: r.login,
        score: r.score,
        checkpoints: r.checkpoints,
        date: r.date
      }
      this._records.push(record)
    }
    return this._records
  }

  static get records (): TMRecord[] {
    return this._records
  }

  static async add (challenge: string, login: string, score: number): Promise<void> {
    let player: TMPlayer
    try {
      player = PlayerService.getPlayer(login)
    } catch (e: any) {
      ErrorHandler.error(e.message.toString())
      return
    }
    const record: TMRecord = {
      id: randomUUID(),
      challenge,
      login,
      score,
      checkpoints: player.checkpoints.map((c: TMCheckpoint) => c.time),
      date: new Date()
    }
    const res = await this.repo.add(record)
    // if (res?.rows?.[0].id != null) { Im not sure what that was for so im not deleting it but I think it shouldnt be here
    //   record.id = res.rows[0].id
    Events.emitEvent('Controller.PlayerRecord', [record])
    // }
  }
}
