import { Client } from "../client/Client.js";
import { PlayerRepository } from "../database/PlayerRepository.js";
import { PrivilegeRepository } from "../database/PrivilegeRepository.js";
import { MapService } from "./MapService.js";
import { Logger } from "../Logger.js";
import { Utils } from "../Utils.js";
import { Events } from "../Events.js";
import { RecordService } from "./RecordService.js";
import { titles } from "../../config/Titles.js";
import { Database } from '../database/DB.js'
import config from '../../config/Config.js'

/**
 * This service manages online players on the server and players table in the database
 */
export class PlayerService {
  private static _players: tm.Player[] = [];
  private static readonly repo: PlayerRepository = new PlayerRepository();
  private static readonly privilegeRepo = new PrivilegeRepository();
  private static newLocalsAmount = 0;
  private static ranks: string[];
  private static _totalPlayerCount: number;
  private static recalcChain: Promise<void> = Promise.resolve()
  private static lastKnownMapCount: number = 0

  /**
   * Fetches ranks, players and creates playerlist
   */
  static async initialize(): Promise<void> {
    this.ranks = await this.repo.getRanks();
    await this.addAllFromList();
    const res: any[] | Error = await tm.db.query(`SELECT count(*) ::int
                                                  FROM players;`);
    if (res instanceof Error) {
      await tm.log.fatal(`Failed to fetch player count.`, res.message, res.stack);
    } else {
      this._totalPlayerCount = res[0].count;
    }
    Events.addListener("LocalRecord", (info: tm.RecordInfo): void => {
      if (
        (info.previous?.position === undefined || info.previous?.position > RecordService.maxLocalsAmount) &&
        info.position <= RecordService.maxLocalsAmount
      ) {
        this.newLocalsAmount++;
      }
    })
    Events.addListener('MapAdded', (info: tm.MapAddedInfo | tm.MapAddedInfo[]) => {
      const maps = Array.isArray(info) ? info : [info]
      const oldCount = this.lastKnownMapCount
      this.lastKnownMapCount = oldCount + maps.length
      this.recalcChain = this.recalcChain
      .then(() => this.recalculateForMapAdded(maps.map(m => m.id), oldCount))
      .catch(err => Logger.error('Error in map-added recalculation', (err as Error).message))
    })
    Events.addListener('MapRemoved', (info: tm.MapRemovedInfo | tm.MapRemovedInfo[]) => {
      const maps = Array.isArray(info) ? info : [info]
      const oldCount = this.lastKnownMapCount
      this.lastKnownMapCount = oldCount - maps.length
      this.recalcChain = this.recalcChain
      .then(() => this.recalculateForMapRemoved(maps.map(m => m.id), oldCount))
      .catch(err => Logger.error('Error in map-removed recalculation', (err as Error).message))
    })
    Events.addListener('BeginMap', (): void => {
      this.newLocalsAmount = 0
    })
  }

  /**
   * Add all the players in the server into local storage and database
   * Only called in the beginning as a start job
   */
  private static async addAllFromList(): Promise<void> {
    const playerList: any[] | Error = await Client.call("GetPlayerList", [{ int: 250 }, { int: 0 }]);
    if (playerList instanceof Error) {
      Logger.fatal("Error when fetching players from the server", playerList.message);
      return;
    }
    for (const player of playerList) {
      const info: any | Error = await Client.call("GetDetailedPlayerInfo", [{ string: player.Login }]);
      if (info instanceof Error) {
        Logger.fatal(
          `Error when fetching player information from the server for ${Utils.strip(
            player.NickName,
          )} (${player.Login})`,
          info.message,
        );
        return;
      }
      // OnlineRights is 0 for nations and 3 for united ?XD
      await this.join(
        player.Login,
        player.NickName,
        info.Path,
        info.IsSpectator,
        info.PlayerId,
        info.IPAddress.split(":")[0],
        info.OnlineRights === 3,
        info.LadderStats.PlayerRankings[0].Score,
        info.LadderStats.PlayerRankings[0].Ranking,
        true,
      );
    }
  }

  /**
   * Gets player title based on config
   * @param login Player login
   * @param country Player nation
   * @param countryCode Player nation code
   */
  static getTitle(login: string, privilege: number, country: string, countryCode: string): string {
    const loginTitle = titles.logins[login as keyof typeof titles.logins];
    if (loginTitle !== undefined) {
      return loginTitle;
    }
    const countryTitle = titles.countries[country as keyof typeof titles.countries];
    if (countryTitle !== undefined) {
      return countryTitle;
    }
    const countryCodeTitle = titles.countries[countryCode as keyof typeof titles.countries];
    if (countryCodeTitle !== undefined) {
      return countryCodeTitle;
    }
    return titles.privileges[privilege as keyof typeof titles.privileges];
  }

  /**
   * Adds a player into the list and database
   * @param login Player login
   * @param nickname Player nickname
   * @param fullRegion Player region received from dedicated server
   * @param isSpectator True if player joined as spectator
   * @param id Player dedicated server id
   * @param ip Player ip address
   * @param isUnited True if player has united version of game
   * @param serverStart True if executed on server start
   * @returns Player object
   */
  static async join(
    login: string,
    nickname: string,
    fullRegion: string,
    isSpectator: boolean,
    id: number,
    ip: string,
    isUnited: boolean,
    ladderPoints: number,
    ladderRank: number,
    serverStart?: true,
  ): Promise<tm.Player> {
    let { region, country, countryCode } = Utils.getRegionInfo(fullRegion);
    if (countryCode === undefined) {
      // This actually happens sometimes yes thanks nadeo
      Logger.warn(`Player ${Utils.strip(nickname)} (${login}) has undefined nation. Setting it to OTH.`);
      Logger.debug(`Login: "${login}", Region: "${fullRegion}".`);
      countryCode = "OTH";
      region = "Other Countries";
      country = "Other Countries";
    }
    const playerData: tm.OfflinePlayer | undefined = await this.repo.get(login);
    const privilege: number = await this.privilegeRepo.get(login);
    let player: tm.Player;
    const index: number = this.ranks.indexOf(login);
    if (playerData === undefined) {
      player = {
        id,
        login,
        nickname,
        country,
        countryCode,
        timePlayed: 0,
        joinTimestamp: Date.now(),
        visits: 1,
        currentCheckpoints: [],
        wins: 0,
        privilege,
        isSpectator,
        isTemporarySpectator: isSpectator,
        isPureSpectator: isSpectator,
        hasPlayerSlot: !isSpectator,
        ip,
        region,
        isUnited,
        average: RecordService.maxLocalsAmount,
        ladderPoints,
        ladderRank,
        rank: index === -1 ? undefined : index + 1,
        spectators: new Set<string>(),
        title: this.getTitle(login, privilege, country, countryCode),
        roundsPoints: 0,
        roundTimes: [],
        isCupFinalist: false,
      };
      this._totalPlayerCount++;
      await this.repo.add(player); // need to await so owner privilege gets set after player is added
    } else {
      player = {
        login,
        nickname,
        country,
        countryCode,
        timePlayed: playerData.timePlayed,
        joinTimestamp: Date.now(),
        visits: serverStart === true ? playerData.visits : playerData.visits + 1, // Prevent adding visits on server start
        currentCheckpoints: [],
        wins: playerData.wins,
        privilege,
        isSpectator,
        isTemporarySpectator: isSpectator,
        isPureSpectator: isSpectator,
        hasPlayerSlot: !isSpectator,
        id,
        ip,
        region,
        isUnited,
        lastOnline: playerData.lastOnline,
        rank: index === -1 ? undefined : index + 1,
        average: playerData.average,
        ladderPoints,
        ladderRank,
        spectators: new Set<string>(),
        title: this.getTitle(login, privilege, country, countryCode),
        roundsPoints: 0,
        roundTimes: [],
        isCupFinalist: false,
      };
      await this.repo.updateOnJoin(player.login, player.nickname, player.region, player.visits, player.isUnited); // need to await so owner privilege gets set after player is added
    }
    this._players.push(player);
    if (serverStart === undefined) {
      Logger.info(
        `${player.isSpectator ? "Spectator" : "Player"} ${Utils.strip(
          player.nickname,
        )} (${player.login}) joined the server, visits: ${player.visits}, ` +
          `region: ${player.region}, wins: ${player.wins}, privilege: ${player.privilege}`,
      );
    }
    return player;
  }

  /**
   * Updates the player information in runtime memory and the database
   * @param players Objects containing player login and infos to change
   */
  static async updateInfo(
    ...players: {
      login: string;
      nickname?: string;
      region?: string;
      title?: string;
    }[]
  ): Promise<void> {
    for (const p of players) {
      const obj: tm.Player | tm.OfflinePlayer | undefined =
        this._players.find((a) => a.login === p.login) ?? (await this.repo.get(p.login));
      if (obj === undefined) {
        continue;
      }
      if (p.title !== undefined && (obj as any).title !== undefined) {
        (obj as any).title = p.title;
      }
      const { region, countryCode } = Utils.getRegionInfo(p.region ?? obj.region);
      if (p.nickname !== undefined && p.nickname !== obj.nickname) {
        Logger.trace(`Updated the nickname for ${p.login} from Dedimania.`);
        await this.repo.updateNickname(p.login, p.nickname ?? obj.nickname);
      }
      if (countryCode !== undefined) {
        await this.repo.updateRegion(p.login, region);
      }
    }
  }

  /**
   * Remove the player from local memory, save timePlayed and lastOnline in database
   * @param login Player login
   */
  static leave(login: string): tm.LeaveInfo | Error {
    const date: Date = new Date();
    const playerIndex: number = this._players.findIndex((a) => a.login === login);
    if (playerIndex === -1) {
      const errStr = `Error removing player ${login} from memory, player is not in the memory`;
      Logger.error(errStr);
      return new Error(errStr);
    }
    const player: tm.Player = this._players[playerIndex];
    const sessionTime: number = Date.now() - player.joinTimestamp;
    const totalTimePlayed: number = sessionTime + player.timePlayed;
    const leaveInfo: tm.LeaveInfo = {
      ...player,
      timePlayed: totalTimePlayed,
      sessionTime,
    };
    // remove spec
    if (player.isSpectator) {
      this._players.forEach((a) => a.spectators.delete(player.login));
    }
    void this.repo.updateOnLeave(player.login, totalTimePlayed, date);
    this._players.splice(playerIndex, 1);
    Logger.info(
      `${Utils.strip(player.nickname)} (${player.login}) has quit after playing for ${Utils.getVerboseTime(
        sessionTime,
      )}`,
    );
    return leaveInfo;
  }

  /**
   * Clear a player's or everyone's current checkpoints
   * @param login player to clear the checkpoints of, leave undefined to clear for everyone
   */
  static resetCheckpoints(login?: string) {
    if (login === undefined) {
      for (const e of this._players) {
        e.currentCheckpoints.length = 0;
      }
      return;
    }
    const player = this.get(login);
    if (player !== undefined) {
      player.currentCheckpoints.length = 0;
    }
  }

  /**
   * Add a checkpoint time to the player object, returns true if the checkpoint is finish
   * @param player Player object
   * @param cp Checkpoint object
   */
  static addCP(
    player: tm.Player,
    cp: tm.Checkpoint,
  ):
    | Error
    | boolean
    | {
        lapTime: number;
        isFinish: boolean;
        lapCheckpoints: number[];
      } {
    const laps = tm.maps.current.lapsAmount;
    if (cp.index === 0) {
      if (laps === 1 && MapService.current.checkpointsPerLap === 1) {
        // finish if 0 cp map
        player.currentCheckpoints.length = 0;
        return true;
      }
      player.currentCheckpoints.unshift(cp);
      player.currentCheckpoints.length = 1; // reset checkpoints array on cp1
      return false;
    }
    if (player.currentCheckpoints.length === 0) {
      return new Error("Index not coherent with checkpoints length");
    } // handle people passing some cps before controller start
    const endLap: number = player.currentCheckpoints[0].lap + laps;
    if (cp.lap < endLap) {
      player.currentCheckpoints.push(cp);
      if (MapService.current.isInLapsMode && (cp.index + 1) % MapService.current.checkpointsPerLap === 0) {
        const startIndex = cp.index - MapService.current.checkpointsPerLap;
        const startTime = player.currentCheckpoints[startIndex]?.time ?? 0;
        return {
          lapTime: cp.time - startTime,
          isFinish: false,
          lapCheckpoints: player.currentCheckpoints.slice(startIndex + 1, -1).map((a) => a.time - startTime),
        };
      }
      return false;
    } else {
      if (MapService.current.isInLapsMode) {
        const startIndex = cp.index - MapService.current.checkpointsPerLap;
        const startTime = player.currentCheckpoints[startIndex]?.time ?? 0;
        return {
          lapTime: cp.time - startTime,
          isFinish: true,
          lapCheckpoints: player.currentCheckpoints.slice(startIndex + 1).map((a) => a.time - startTime),
        };
      }
      return true;
    }
  }

  /**
   * Sets spectator status, player slot and team in the player object.
   * @param info Player login
   * @returns True if successful, false if the player is not in the runtime memory
   */
  static setPlayerInfo(info: tm.InfoChangedInfo): boolean {
    const player: tm.Player | undefined = this._players.find((a) => a.login === info.login);
    if (player === undefined) {
      return false;
    }
    player.isSpectator = info.isSpectator;
    player.isPureSpectator = info.isPureSpectator;
    player.isTemporarySpectator = info.isTemporarySpectator;
    player.hasPlayerSlot = info.hasPlayerSlot;
    // update spectators
    const spectated: tm.Player | undefined =
      info.currentTargetId % 255 === 0 ? undefined : this._players.find((a) => a.id === info.currentTargetId);
    let specChanged = true;
    if (spectated === undefined) {
      if (!player.isSpectator && info.currentTargetId % 255 !== 0) {
        Logger.error(`The player that ${player.login} is spectating does not exist.`);
      }
    } else if (spectated.spectators.has(player.login)) {
      specChanged = false;
    } else {
      spectated.spectators.add(player.login);
      Logger.debug(`Player ${player.login} is now spectating player ${spectated.login}.`);
    }
    if (specChanged) {
      this._players.forEach((a) => {
        if (a !== spectated) {
          a.spectators.delete(player.login);
        }
      });
    }
    if (info.teamId === -1) {
      player.team = undefined;
    } else {
      player.team = info.teamId === 0 ? "blue" : "red";
    }
    return true;
  }

  /**
   * Adds a win to a player object
   * @param login Player login
   * @returns Number of wins
   */
  static async addWin(login: string): Promise<number> {
    const player: any = this.get(login) ?? (await this.fetch(login));
    await this.repo.updateOnWin(login, ++player.wins);
    Logger.trace(
      `Player ${Utils.strip(player.nickname)} (${player.login}) won for the ${Utils.getOrdinalSuffix(
        player.wins,
      )} time.`,
    );
    return player.wins;
  }

  /**
   * Calculates and updates averages and ranks in players table and runtime
   */
  static async calculateAveragesAndRanks(): Promise<void> {
    const logins = RecordService.localRecords
      .slice(0, RecordService.maxLocalsAmount + this.newLocalsAmount)
      .map((a) => a.login);
    const localRecords = RecordService.localRecords;
    const initialLocals = RecordService.initialLocals;
    const amount: number = MapService.mapCount;
    const averages = await this.repo.getAverage(logins);
    const arr: {
      login: string;
      average: number;
    }[] = [];
    for (const avg of averages) {
      // Get rank from the start of the race
      let previousRank: number = initialLocals.findIndex((a) => a.login === avg.login) + 1;
      // If player doesn't have rank set it to locals amount
      if (previousRank === 0) {
        previousRank = RecordService.maxLocalsAmount;
      }
      // Get rank from the end of the race
      const newRank: number = localRecords.findIndex((a) => a.login === avg.login) + 1;
      // Calculate average
      const average: number = (amount * avg.average + newRank - previousRank) / amount;
      const onlinePlayer: tm.Player | undefined = this.get(avg.login);
      if (onlinePlayer !== undefined) {
        // Set average in runtime if player is online
        onlinePlayer.average = average;
      }
      arr.push({
        login: avg.login,
        average,
      });
      await this.repo.updateAverage(avg.login, average); // Set average in the database
    }
    // Get ranks for all players
    this.ranks = await this.repo.getRanks();
    for (const e of this._players) {
      const index = this.ranks.indexOf(e.login);
      e.rank = index === -1 ? undefined : index + 1;
    }
    Events.emit("RanksAndAveragesUpdated", arr);
  }

  /**
   * Recalculates averages when maps are added. Queries records for the
   * added maps since they may have existing records from a previous time
   * on the server.
   */
  private static async recalculateForMapAdded(addedMapUids: string[], oldCount: number): Promise<void> {
    const limit = RecordService.maxLocalsAmount
    const addedCount = addedMapUids.length
    const newCount = oldCount + addedCount
    const db = new Database()
    const addedUidSet = new Set(addedMapUids)
    const allMapIds: {
      uid: string,
      id: number
    }[] = (await db.query(`SELECT id, uid
                           FROM map_ids`)).rows
    const addedDbIds = allMapIds.filter(a => addedUidSet.has(a.uid)).map(a => a.id)
    let addedRecords: {
      player_id: number,
      map_id: number
    }[] = []
    if (addedDbIds.length > 0) {
      addedRecords = (await db.query(`SELECT player_id, map_id
                                      FROM records
                                      WHERE map_id IN (${addedDbIds.join(',')})
                                      ORDER BY map_id ASC, time ASC, date ASC;`)).rows
    }
    const positionSums = new Map<number, number>()
    const mapsWithRecords = new Map<number, Set<number>>()
    for (let i = 0; i < addedRecords.length; i++) {
      let position = 1
      for (let k = i - 1; k >= 0; k--) {
        if (addedRecords[k].map_id !== addedRecords[i].map_id) { break }
        position++
      }
      if (position > limit) { position = limit }
      const playerId = addedRecords[i].player_id
      positionSums.set(playerId, (positionSums.get(playerId) ?? 0) + position)
      if (!mapsWithRecords.has(playerId)) { mapsWithRecords.set(playerId, new Set()) }
      mapsWithRecords.get(playerId)!.add(addedRecords[i].map_id)
    }
    const addedMapDbCount = addedDbIds.length
    const mapsNotInDb = addedCount - addedMapDbCount
    const playerRows: {
      id: number,
      login: string,
      average: number
    }[] = (await db.query(`SELECT id, login, average
                           FROM players`)).rows
    const sums: {
      id: number,
      login: string,
      average: number
    }[] = []
    for (const p of playerRows) {
      const recordPositionSum = positionSums.get(p.id) ?? 0
      const playerMapsWithRecords = mapsWithRecords.get(p.id)?.size ?? 0
      const playerMapsWithoutRecords = addedMapDbCount - playerMapsWithRecords + mapsNotInDb
      const addedSum = recordPositionSum + playerMapsWithoutRecords * limit
      const newAvg = oldCount <= 0 ? addedSum / newCount : (p.average * oldCount + addedSum) / newCount
      sums.push({
        id: p.id,
        login: p.login,
        average: newAvg
      })
    }
    if (sums.length !== 0) {
      await db.query(`UPDATE players AS p
                      SET average = v.average FROM (VALUES ${sums.map(a => `(${a.id}, ${a.average}),`).join('')
                      .slice(0, -1)}
                        ) AS v(id
                        , average)
                      WHERE v.id = p.id;`)
    }
    for (const s of sums) {
      const onlinePlayer = this.get(s.login)
      if (onlinePlayer !== undefined) { (onlinePlayer as any).average = s.average }
    }
    this.ranks = await this.repo.getRanks()
    for (const e of this._players) {
      const index = this.ranks.indexOf(e.login)
      e.rank = index === -1 ? undefined : (index + 1)
    }
    Events.emit('RanksAndAveragesUpdated', sums.map(s => ({
      login: s.login,
      average: s.average
    })))
  }

  /**
   * Recalculates averages when maps are removed. Only queries records
   * for the removed maps instead of the entire records table.
   */
  private static async recalculateForMapRemoved(removedMapUids: string[], oldCount: number): Promise<void> {
    const limit = RecordService.maxLocalsAmount
    const removedCount = removedMapUids.length
    const newCount = oldCount - removedCount
    if (newCount <= 0) {
      Logger.warn('All maps removed; skipping rank recalculation.')
      return
    }
    const db = new Database()
    const allMapIds: {
      uid: string,
      id: number
    }[] = (await db.query(`SELECT id, uid
                           FROM map_ids`)).rows
    const removedUidSet = new Set(removedMapUids)
    const removedDbIds = allMapIds.filter(a => removedUidSet.has(a.uid)).map(a => a.id)
    let removedRecords: {
      player_id: number,
      map_id: number
    }[] = []
    if (removedDbIds.length > 0) {
      removedRecords = (await db.query(`SELECT player_id, map_id
                                        FROM records
                                        WHERE map_id IN (${removedDbIds.join(',')})
                                        ORDER BY map_id ASC, time ASC, date ASC;`)).rows
    }
    const positionSums = new Map<number, number>()
    const mapsWithRecords = new Map<number, Set<number>>()
    for (let i = 0; i < removedRecords.length; i++) {
      let position = 1
      for (let k = i - 1; k >= 0; k--) {
        if (removedRecords[k].map_id !== removedRecords[i].map_id) { break }
        position++
      }
      if (position > limit) { position = limit }
      const playerId = removedRecords[i].player_id
      positionSums.set(playerId, (positionSums.get(playerId) ?? 0) + position)
      if (!mapsWithRecords.has(playerId)) { mapsWithRecords.set(playerId, new Set()) }
      mapsWithRecords.get(playerId)!.add(removedRecords[i].map_id)
    }
    const removedMapDbCount = removedDbIds.length
    const mapsNotInDb = removedCount - removedMapDbCount
    const playerRows: {
      id: number,
      login: string,
      average: number
    }[] = (await db.query(`SELECT id, login, average
                           FROM players`)).rows
    const sums: {
      id: number,
      login: string,
      average: number
    }[] = []
    for (const p of playerRows) {
      const recordPositionSum = positionSums.get(p.id) ?? 0
      const playerMapsWithRecords = mapsWithRecords.get(p.id)?.size ?? 0
      const playerMapsWithoutRecords = removedMapDbCount - playerMapsWithRecords + mapsNotInDb
      const removedSum = recordPositionSum + playerMapsWithoutRecords * limit
      const newAvg = (p.average * oldCount - removedSum) / newCount
      sums.push({
        id: p.id,
        login: p.login,
        average: newAvg
      })
    }
    if (sums.length !== 0) {
      await db.query(`UPDATE players AS p
                      SET average = v.average FROM (VALUES ${sums.map(a => `(${a.id}, ${a.average}),`).join('')
                      .slice(0, -1)}
                        ) AS v(id
                        , average)
                      WHERE v.id = p.id;`)
    }
    for (const s of sums) {
      const onlinePlayer = this.get(s.login)
      if (onlinePlayer !== undefined) { (onlinePlayer as any).average = s.average }
    }
    this.ranks = await this.repo.getRanks()
    for (const e of this._players) {
      const index = this.ranks.indexOf(e.login)
      e.rank = index === -1 ? undefined : (index + 1)
    }
    Events.emit('RanksAndAveragesUpdated', sums.map(s => ({
      login: s.login,
      average: s.average
    })))
  }

  /**
   * Performs a full recalculation of all player averages and ranks from scratch.
   */
  static async fullRecalculation(): Promise<void> {
    const db = new Database()
    Logger.info('Recalculating ranks...')
    let activeMapUids: string[]
    if (config.manualMapLoading.enabled) {
      activeMapUids = MapService.maps.map(m => m.id)
    } else {
      const mapList: any[] | Error = await Client.call('GetChallengeList', [{ int: 5000 }, { int: 0 }])
      if (mapList instanceof Error) {
        Logger.error('Error while getting the map list for rank recalculation', mapList.message)
        return
      }
      activeMapUids = mapList.map((m: any) => m.UId)
    }
    if (activeMapUids.length === 0) {
      Logger.warn('No active maps found; skipping rank recalculation.')
      return
    }
    const activeUidSet = new Set(activeMapUids)
    const allMapIds: {
      uid: string,
      id: number
    }[] = (await db.query(`SELECT id, uid
                           FROM map_ids`)).rows
    const maps = allMapIds.filter(a => activeUidSet.has(a.uid))
    if (maps.length === 0) {
      Logger.warn('No active maps found in database; skipping rank recalculation.')
      return
    }
    const mapIds = maps.map(m => m.id)
    const playerRows: {
      id: number,
      login: string
    }[] = (await db.query(`SELECT id, login
                           FROM players`)).rows
    const records: {
      player_id: number,
      map_id: number
    }[] = (await db.query(`SELECT player_id, map_id
                           FROM records
                           WHERE map_id IN (${mapIds.join(',')})
                           ORDER BY map_id ASC, time ASC, date ASC;`)).rows
    const limit = RecordService.maxLocalsAmount
    const mapCount = maps.length
    const sums: {
      id: number,
      login: string,
      average: number
    }[] = []
    const indexesMap = new Map<number, number[]>(playerRows.map(a => [a.id, []]))
    for (let i = 0; i < records.length; i++) {
      indexesMap.get(records[i].player_id)?.push(i)
    }
    for (const player of playerRows) {
      const indexes = indexesMap.get(player.id) as number[]
      let sum = 0
      for (const idx of indexes) {
        let position = 1
        for (let k = idx - 1; k >= 0; k--) {
          if (records[k].map_id !== records[idx].map_id) { break }
          position++
        }
        if (position > limit) { position = limit }
        sum += position
      }
      sum += (mapCount - indexes.length) * limit
      sums.push({
        average: sum / mapCount,
        id: player.id,
        login: player.login
      })
    }
    if (sums.length !== 0) {
      await db.query(`UPDATE players AS p
                      SET average = v.average FROM (VALUES ${sums.map(a => `(${a.id}, ${a.average}),`).join('')
                      .slice(0, -1)}
                        ) AS v(id
                        , average)
                      WHERE v.id = p.id;`)
    }
    for (const s of sums) {
      const onlinePlayer = this.get(s.login)
      if (onlinePlayer !== undefined) {
        (onlinePlayer as any).average = s.average
      }
    }
    this.ranks = await this.repo.getRanks()
    for (const e of this._players) {
      const index = this.ranks.indexOf(e.login)
      e.rank = index === -1 ? undefined : (index + 1)
    }
    const updated = sums.map(s => ({
      login: s.login,
      average: s.average
    }))
    this.lastKnownMapCount = mapCount
    Events.emit('RanksAndAveragesUpdated', updated)
    Logger.info('Ranks recalculated successfully')
  }

  /**
   * Fetches a player from the database. This method should be used to get players who are not online
   * @param login Player login
   * @returns Player object or undefined if player is not in the database
   */
  static fetch(login: string): Promise<tm.OfflinePlayer | undefined>;
  /**
   * Fetches multiple players from the database. This method should be used to get players who are not online
   * If some player is not present in the database he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Player objects array
   */
  static fetch(logins: string[]): Promise<tm.OfflinePlayer[]>;
  static fetch(logins: string | string[]): Promise<tm.OfflinePlayer | undefined | tm.OfflinePlayer[]> {
    return this.repo.get(logins as any);
  }

  /**
   * Gets the player information from runtime memory. Only online players are stored
   * @param login Player login
   * @returns Player object or undefined if the player isn't online
   */
  static get(login: string):
    | Readonly<
        tm.Player & {
          currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]>;
        }
      >
    | undefined;
  /**
   * Gets multiple players information from runtime memory. Only online players are stored
   * If some player is not online he won't be returned. Returned array is not in initial order
   * @param logins Array of player logins
   * @returns Array of player objects
   */
  static get(logins: string[]): Readonly<
    tm.Player & {
      currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]>;
    }
  >[];
  static get(logins: string | string[]):
    | Readonly<
        tm.Player & {
          currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]>;
        }
      >
    | undefined
    | Readonly<
        tm.Player & {
          currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]>;
        }
      >[] {
    if (typeof logins === "string") {
      return this._players.find((a) => a.login === logins);
    }
    return this._players.filter((a) => logins.includes(a.login));
  }

  /**
   * All online players
   */
  static get players(): Readonly<
    tm.Player & {
      currentCheckpoints: Readonly<tm.Checkpoint>[];
    }
  >[] {
    return [...this._players];
  }

  /**
   * Number of online players
   */
  static get playerCount(): number {
    return this._players.length;
  }

  /**
   * Number of all players who visited the server
   */
  static get totalPlayerCount(): number {
    return this._totalPlayerCount;
  }
}
