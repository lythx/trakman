import { Client } from '../Client.js'
import { ChallengeRepository } from '../database/ChallengeRepository.js'
import { ErrorHandler } from '../ErrorHandler.js'

export class ChallengeService {
  private static _current: TMChallenge
  private static readonly _challenges: TMChallenge[] = []
  private static repo: ChallengeRepository

  static async initialize(): Promise<void> {
    this.repo = new ChallengeRepository()
    await this.repo.initialize()
    await this.initializeList()
    await this.setCurrent()
  }

  static get current(): TMChallenge {
    return this._current
  }

  static get challenges(): TMChallenge[] {
    return this._challenges
  }

  /**
   * Sets the current challenge.
   */
  static async setCurrent(): Promise<void> {
    const res: any[] | Error = await Client.call('GetCurrentChallengeInfo')
    if (res instanceof Error) {
      ErrorHandler.error('Unable to retrieve current challenge info.', res.message)
      return
    }
    const info: any = res[0]
    const dbinfo: any[] = await this.repo.get(info.UId)
    this._current = {
      id: info.UId,
      name: info.Name,
      fileName: info.FileName,
      author: info.Author,
      environment: info.Environnement,
      mood: info.Mood,
      bronzeTime: info.BronzeTime,
      silverTime: info.SilverTime,
      goldTime: info.GoldTime,
      authorTime: info.AuthorTime,
      copperPrice: info.CopperPrice,
      lapRace: info.LapRace,
      lapsAmount: info.NbLaps,
      checkpointsAmount: info.NbCheckpoints,
      addDate: dbinfo[0].adddate
    }
  }

  /**
   * Download all the challenges from the server and store them in a field
   */
  private static async initializeList(): Promise<void> {
    const challengeList: any[] | Error = await Client.call('GetChallengeList', [
      { int: 5000 }, { int: 0 }
    ])
    if (challengeList instanceof Error) {
      ErrorHandler.fatal('Error getting the challenge list', challengeList.message)
      return
    }
    const DBChallengeList: any[] = await this.repo.getAll()
    const challengesInDB: any[] = challengeList.filter(a => DBChallengeList.some(b => a.UId === b.id))
    const challengesNotInDB: any[] = challengeList.filter(a => !DBChallengeList.some(b => a.UId === b.id))
    const challengesNotInDBInfo: TMChallenge[] = []
    for (const c of challengesNotInDB) {
      const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: c.FileName }])
      if (res instanceof Error) {
        ErrorHandler.error('Unable to retrieve challenge info.', `Map id: ${c.id}, filename: ${c.fileName}`, res.message)
        return
      }
      const info: any = res[0]
      const obj: TMChallenge = {
        id: info.UId,
        name: info.Name,
        fileName: info.FileName,
        author: info.Author,
        environment: info.Environnement,
        mood: info.Mood,
        bronzeTime: info.BronzeTime,
        silverTime: info.SilverTime,
        goldTime: info.GoldTime,
        authorTime: info.AuthorTime,
        copperPrice: info.CopperPrice,
        lapRace: info.LapRace,
        lapsAmount: info.NbLaps,
        checkpointsAmount: info.NbCheckpoints,
        addDate: new Date()
      }
      challengesNotInDBInfo.push(obj)
    }
    const challengesInDBInfo: TMChallenge[] = []
    for (const challenge of challengesInDB) {
      const c: any = DBChallengeList.find((a: any): boolean => a.id === challenge.UId)
      const info: TMChallenge = {
        id: c.id,
        name: c.name,
        fileName: c.filename,
        author: c.author,
        environment: c.environment,
        mood: c.mood,
        bronzeTime: c.bronzetime,
        silverTime: c.silvertime,
        goldTime: c.goldtime,
        authorTime: c.authortime,
        copperPrice: c.copperprice,
        lapRace: c.laprace,
        lapsAmount: c.lapsamount,
        checkpointsAmount: c.checkpointsamount,
        addDate: new Date(c.adddate)
      }
      challengesInDBInfo.push(info)
    }
    for (const c of [...challengesInDBInfo, ...challengesNotInDBInfo]) {
      this._challenges.push(c)
    }
    await this.repo.add(...challengesNotInDBInfo)
  }

  static async add(fileName: string): Promise<TMChallenge | Error> {
    const insert: any[] | Error = await Client.call('InsertChallenge', [{ string: fileName }])
    if (insert instanceof Error) { return insert }
    if (insert[0] === false) { return new Error(`Failed to insert challenge ${fileName}`) }
    const res: any[] | Error = await Client.call('GetChallengeInfo', [{ string: fileName }])
    if (res instanceof Error) { return res }
    const info: any = res[0]
    const obj: TMChallenge = {
      id: info.UId,
      name: info.Name,
      fileName: info.FileName,
      author: info.Author,
      environment: info.Environnement,
      mood: info.Mood,
      bronzeTime: info.BronzeTime,
      silverTime: info.SilverTime,
      goldTime: info.GoldTime,
      authorTime: info.AuthorTime,
      copperPrice: info.CopperPrice,
      lapRace: info.LapRace,
      lapsAmount: info.NbLaps,
      checkpointsAmount: info.NbCheckpoints,
      addDate: new Date()
    }
    this._challenges.push(obj)
    return obj
  }

  static async setNextChallenge(id: string): Promise<void | Error> {
    const challenge: TMChallenge | undefined = this.challenges.find(a => a.id === id)
    if (challenge === undefined) { return new Error(`Cant find challenge with UId ${id} in memory`) }
    const res: any[] | Error = await Client.call('ChooseNextChallenge', [{ string: challenge.fileName }])
    if (res instanceof Error) { return new Error(`Failed to queue challenge ${challenge.name}`) }
  }
}
