import { Events } from './Events.js'
import { GameService } from './services/GameService.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { MapService } from './services/MapService.js'
import { Client } from './client/Client.js'
import { ChatService } from './services/ChatService.js'
import { Utils } from './Utils.js'
import { Database } from './database/DB.js'
import { TMXFetcher } from './TMXFetcher.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'
import { ServerConfig } from './ServerConfig.js'
import { Logger } from './Logger.js'
import { PlayerRepository } from './database/PlayerRepository.js'
import { MapIdsRepository } from './database/MapIdsRepository.js'
import prefixes from '../config/PrefixesAndPalette.js'
import controllerConfig from '../config/Config.js'
import { RoundsService } from './services/RoundsService.js'

const playersRepo: PlayerRepository = new PlayerRepository()
const mapIdsRepo: MapIdsRepository = new MapIdsRepository()

const DB: Database = new Database()

namespace trakman {

  export const utils = Utils

  export const db = {

    getMapId: mapIdsRepo.get.bind(mapIdsRepo),

    getPlayerId: playersRepo.getId.bind(playersRepo),

    /**
    * Executes a query on the database
    * @param query Query to execute
    * @returns Database response or error on invalid query
    */
    async query(query: string, ...params: any[]): Promise<any[] | Error> {
      const res = await DB.query(query, ...params).catch((err: Error) => err)
      if (res instanceof Error) {
        return res
      }
      return res.rows
    },

    /**
     * Initializes a database client and returns a function which executes database queries using the client.
     * Client queries are handled by a separate thread which makes them a bit faster.
     * Use this only if your plugin needs to execute database queries very frequently.
     * Only a few clients can be active at the same time, if there
     * is too many the program might hang
     * @returns Function to execute database queries using the client
     */
    async getClient(): Promise<(query: string, ...params: any[]) => Promise<any[] | Error>> {
      const db = new Database()
      await db.enableClient()
      return async (query: string, ...params: any[]): Promise<any[] | Error> => {
        const res = await db.query(query, ...params).catch((err: Error) => err)
        if (res instanceof Error) {
          return res
        }
        return res.rows
      }
    }

  }

  export const tmx = {

    fetchMapInfo: TMXFetcher.fetchMapInfo.bind(TMXFetcher),

    fetchMapFile: TMXFetcher.fetchMapFile.bind(TMXFetcher),

    searchForMap: TMXFetcher.searchForMap.bind(TMXFetcher),

    fetchRandomMapFile: TMXFetcher.fetchRandomMapFile.bind(TMXFetcher)

  }

  export const players = {

    get: PlayerService.get.bind(PlayerService),

    fetch: PlayerService.fetch.bind(PlayerService),

    /**
      All online players
     */
    get list() { return PlayerService.players },

    /**
     * Number of online players
     */
    get count(): number { return PlayerService.playerCount },

    /**
     * Number of all players who visited the server
     */
    get totalCount(): number { return PlayerService.totalPlayerCount }

  }

  export const records = {

    getLocal: RecordService.getLocal.bind(RecordService),

    getLive: RecordService.getLive.bind(RecordService),

    getFromQueue: RecordService.getFromQueue.bind(RecordService),

    getOneFromQueue: RecordService.getOneFromQueue.bind(RecordService),

    getFromHistory: RecordService.getFromHistory.bind(RecordService),

    getOneFromHistory: RecordService.getOneFromHistory.bind(RecordService),

    remove: RecordService.remove.bind(RecordService),

    removeAll: RecordService.removeAll.bind(RecordService),

    fetchByMap: RecordService.fetch.bind(RecordService),

    fetchOne: RecordService.fetchOne.bind(RecordService),

    fetchByLogin: RecordService.fetchRecordsByLogin.bind(RecordService),

    fetchRecordCount: RecordService.fetchRecordCount.bind(RecordService),

    getRank: RecordService.getRank.bind(RecordService),

    getLap: RecordService.getLap.bind(RecordService),

    getRound: RoundsService.getRoundRecord.bind(RecordService),

    /**
     * Current map local records.
     */
    get local(): Readonly<tm.LocalRecord>[] { return RecordService.localRecords },

    /**
     * Number of local records on the current map.
     */
    get localCount(): number { return RecordService.localRecordCount },

    /**
     * Current live records.
     */
    get live(): Readonly<tm.FinishInfo>[] { return RecordService.liveRecords },

    /**
     * Number of live records.
     */
    get liveCount(): number { return RecordService.liveRecordCount },

    /**
     * Maximum amount of local records. 
     * All local records get fetched, but only ones below max amount count towards server rank.
     */
    get maxLocalsAmount(): number { return RecordService.maxLocalsAmount },

    /**
     * Current map lap records. Same as local records if the map is not in multilap mode.
     */
    get lap(): Readonly<tm.LocalRecord>[] { return RecordService.lapRecords },

    /**
     * Number of lap records on the current map. Same as local records if the map is not in multilap mode.
     */
    get lapCount(): number { return RecordService.lapRecordCount },

    /**
     * Current round records.
     */
    get roundRecords(): Readonly<tm.FinishInfo>[] { return RoundsService.roundRecords },

    /**
     * Number of current round records.
     */
    get roundRecordCount(): number { return RoundsService.roundRecordCount },

  }

  export const rounds = {

    getRecord: RoundsService.getRoundRecord.bind(RecordService),

    /**
     * Current round records.
     */
    get currentRecords() { return RoundsService.roundRecords },

    /**
     * Number of current round records.
     */
    get currentRecordCount(): number { return RoundsService.roundRecordCount },

    /**
     * Current team scores (Teams mode only).
     */
    get teamScores() { return RoundsService.teamScores },

    /**
     * Point system for Rounds and Cup mode.
     */
    get roundsPointSystem() { return RoundsService.roundsPointSystem },

    /**
     * Amount of points to end the map in Rounds mode.
     */
    get roundsPointsLimit() { return RoundsService.roundsPointsLimit },

    /**
     * Amount of points to become a finalist in Cup mode.
     */
    get cupPointsLimit() { return RoundsService.cupPointsLimit },

    /**
     * Amount of points to end map in Teams mode.
     */
    get teamsPointsLimit() { return RoundsService.teamsPointsLimit },

    /**
     * Current round points ranking (Rounds/Cup mode only).
     */
    get pointsRanking() { return RoundsService.pointsRanking },

    /**
     * Max amount of winners in Cup mode.
     */
    get cupMaxWinnersCount() { return RoundsService.cupMaxWinnersCount },

    /**
     * Current Cup winners (Cup mode only).
     */
    get cupWinners() { return RoundsService.cupWinners }

  }

  export const chat = {

    fetch: ChatService.fetch.bind(ChatService),

    fetchByLogin: ChatService.fetchByLogin.bind(ChatService),

    get: ChatService.get.bind(ChatService),

    addMessagePrefix: ChatService.addMessagePrefix.bind(ChatService),

    setMessageStyle: ChatService.setMessageStyle.bind(ChatService),

    addMessageTextModifier: ChatService.addMessageTextModifier.bind(ChatService),

    /**
     * Recent chat messages. 
     */
    get messages(): tm.Message[] { return ChatService.messages },

    /**
     * Number of recent chat messages.
     */
    get messageCount(): number { return ChatService.messageCount }

  }

  export const commands = {

    add: ChatService.addCommand.bind(ChatService),

    /**
     * All registered chat commands.
     */
    get list(): tm.Command[] { return ChatService.commandList },

    /**
     * Number of commands.
     */
    get count(): number { return ChatService.commandCount }

  }

  export const client = {

    call: Client.call.bind(Client),

    callNoRes: Client.callNoRes.bind(Client),

    addProxy: Client.addProxy.bind(Client),

  }

  export const maps = {

    get: MapService.get.bind(MapService),

    fetch: MapService.fetch.bind(MapService),

    add: MapService.add.bind(MapService),

    remove: MapService.remove.bind(MapService),

    writeFileAndAdd: MapService.writeFileAndAdd.bind(MapService),

    /**
     * All maps from current playlist.
     */
    get list(): Readonly<tm.Map>[] { return MapService.maps },

    /**
     * Currently played map.
     */
    get current(): Readonly<tm.CurrentMap> { return MapService.current },

    /**
     * Amount of maps in current playlist.
     */
    get count(): number { return MapService.mapCount }

  }

  export const log = {

    fatal: Logger.fatal.bind(Logger),

    error: Logger.error.bind(Logger),

    warn: Logger.warn.bind(Logger),

    info: Logger.info.bind(Logger),

    debug: Logger.debug.bind(Logger),

    trace: Logger.trace.bind(Logger)

  }

  export const jukebox = {

    add: MapService.addToJukebox.bind(MapService),

    remove: MapService.removeFromJukebox.bind(MapService),

    clear: MapService.clearJukebox.bind(MapService),

    shuffle: MapService.shuffle.bind(MapService),

    getFromQueue: MapService.getFromQueue.bind(MapService),

    getFromJukebox: MapService.getFromJukebox.bind(MapService),

    getFromHistory: MapService.getFromHistory.bind(MapService),

    clearHistory: MapService.clearHistory.bind(MapService),

    /**
     * Amout of maps in the queue (maps juked by the players and the server). 
     * This is always equal to maxQueueCount.
     */
    get queueCount(): number { return MapService.queueSize },

    /**
     * Amount of maps in the history.
     */
    get historyCount(): number { return MapService.historyCount },

    /**
     * Max amount of maps in the queue (maps juked by the players and the server).
     * This is always equal to queueCount.
     */
    get maxQueueCount(): number { return MapService.queueSize },

    /**
     * Max amount of maps in the history.
     */
    get maxHistoryCount(): number { return MapService.historySize },

    /**
     * Amount of maps juked by the players.
     */
    get jukedCount(): number { return MapService.jukeboxCount },

    /**
     * Map queue (maps juked by the players and the server).
     */
    get queue(): Readonly<tm.Map>[] { return MapService.queue },

    /**
     * Map history.
     */
    get history(): Readonly<tm.Map>[] { return MapService.history },

    /**
     * Currently played map.
     */
    get current(): Readonly<tm.CurrentMap> { return MapService.current },

    /**
     * Maps juked by the players.
     */
    get juked() { return MapService.jukebox }

  }

  export const karma = {

    add: VoteService.add.bind(VoteService),

    fetch: VoteService.fetch.bind(VoteService),

    get: VoteService.get.bind(VoteService),

    /**
     * Current map votes.
     */
    get current(): Readonly<tm.Vote>[] { return VoteService.current },

    /**
     * Current map vote count.
     */
    get currentCount(): number { return VoteService.currentCount },

    /**
     * All votes in runtime memory. Only votes for maps in the history, 
     * queue and the current map are stored.
     */
    get allVotes() { return VoteService.votes }

  }

  export const timer = {

    enableDynamic: GameService.enableDynamicTimer.bind(GameService),

    disableDynamic: GameService.disableDynamicTimer.bind(GameService),

    setTime: GameService.setTime.bind(GameService),

    addTime: GameService.addTime.bind(GameService),

    subtractTime: GameService.subtractTime.bind(GameService),

    resume: GameService.resumeTimer.bind(GameService),

    pause: GameService.pauseTimer.bind(GameService),

    /**
     * Remaining race time in miliseconds. 
     */
    get remainingRaceTime(): number {
      return GameService.remainingRaceTime
    },

    /**
     * Remaining result screen time in miliseconds.
     */
    get remainingResultTime(): number {
      return GameService.remainingResultTime
    },

    /**
     * Race time limit in the current round in miliseconds.
     */
    get raceTimeLimit(): number {
      return GameService.raceTimeLimit
    },

    /**
     * Result time limit in the current round in miliseconds.
     */
    get resultTimeLimit(): number {
      return GameService.resultTimeLimit
    },

    /**
     * Timestamp at which the current map has started.
     */
    get mapStartTimestamp(): number {
      return GameService.mapStartTimestamp
    },

    /**
     * Boolean indicating whether the dynamic timer is paused.
     */
    get isPaused(): boolean {
      return GameService.isTimerPaused
    },

    /**
     * Boolean indicating whether the dynamic timer is enabled.
     */
    get isDynamic(): boolean {
      return GameService.dynamicTimerEnabled
    },

    /**
     * Boolean indicating whether the dynamic timer will be enabled in the next round.
     */
    get isDynamicOnNextRound(): boolean {
      return GameService.dynamicTimerOnNextRound
    }

  }

  export const admin = {

    setPrivilege: AdministrationService.setPrivilege.bind(AdministrationService),

    ban: AdministrationService.ban.bind(AdministrationService),

    unban: AdministrationService.unban.bind(AdministrationService),

    addToBlacklist: AdministrationService.addToBlacklist.bind(AdministrationService),

    unblacklist: AdministrationService.unblacklist.bind(AdministrationService),

    mute: AdministrationService.mute.bind(AdministrationService),

    unmute: AdministrationService.unmute.bind(AdministrationService),

    addGuest: AdministrationService.addGuest.bind(AdministrationService),

    removeGuest: AdministrationService.removeGuest.bind(AdministrationService),

    getBan: AdministrationService.getBan.bind(AdministrationService),

    getBlacklist: AdministrationService.getBlacklist.bind(AdministrationService),

    getMute: AdministrationService.getMute.bind(AdministrationService),

    getGuest: AdministrationService.getGuest.bind(AdministrationService),

    /**
     * Banned players.
     */
    get banlist(): Readonly<tm.BanlistEntry>[] { return AdministrationService.banlist },

    /**
     * Blacklisted players.
     */
    get blacklist(): Readonly<tm.BlacklistEntry>[] { return AdministrationService.blacklist },

    /**
     * Muted players.
     */
    get mutelist(): Readonly<tm.MutelistEntry>[] { return AdministrationService.mutelist },

    /**
     * Server guests.
     */
    get guestlist(): Readonly<tm.GuestlistEntry>[] { return AdministrationService.guestlist },

    /**
     * Number of banned players.
     */
    get banCount(): number { return AdministrationService.banCount },

    /**
     * Number of blacklisted players.
     */
    get blacklistCount(): number { return AdministrationService.blacklistCount },

    /**
     * Number of muted players.
     */
    get muteCount(): number { return AdministrationService.muteCount },

    /**
     * Number of guests.
     */
    get guestCount(): number { return AdministrationService.guestCount },

    /**
     * Privilege levels for each of the administrative actions.
     */
    get privileges() { return AdministrationService.privileges },

    /**
     * Relative path (/GameData/Config/) to the blacklist file.
     */
    get blacklistFile() { return AdministrationService.blacklistFile },

    /**
     * Relative path (/GameData/Config/) to the guestlist file.
     */
    get guestlistFile() { return AdministrationService.guestlistFile },

    /**
     * Server operators.
     */
    get oplist(): Readonly<tm.PrivilegeEntry>[] { return AdministrationService.oplist },

    /**
     * Number of server operators.
     */
    get opCount(): number { return AdministrationService.opCount },

    /**
     * Server admins.
     */
    get adminlist(): Readonly<tm.PrivilegeEntry>[] { return AdministrationService.adminlist },

    /**
     * Number of server admins.
     */
    get adminCount(): number { return AdministrationService.adminCount },

    /**
     * Server masteradmins.
     */
    get masteradminlist(): Readonly<tm.PrivilegeEntry>[] { return AdministrationService.masteradminlist },

    /**
     * Number of server masteradmins.
     */
    get masteradminCount(): number { return AdministrationService.masteradminCount },

  }

  /** 
  * Sends a server message
  * @param message Message to be sent
  * @param login Optional player login or array of logins
  */  export const sendMessage = (message: string, login?: string | string[], prefix: boolean = true): void => {
    if (login !== undefined) {

      Client.callNoRes('ChatSendServerMessageToLogin',
        [{ string: (prefix ? prefixes.prefixes.serverToPlayer : '') + message },
        { string: typeof login === 'string' ? login : login.join(',') }])
      return
    }
    Client.callNoRes('ChatSendServerMessage', [{ string: (prefix ? prefixes.prefixes.serverToAll : '') + message }])
  }

  /**
   * Sends a server manialink
   * @param manialink Manialink XML to be sent
   * @param login Optional player login or array of logins
   * @param deleteOnClick Whether to remove the manialink on player interaction
   * @param expireTime Amount of time (in seconds) for the manialink to disappear
   */
  export const sendManialink = (manialink: string, login?: string | string[],
    deleteOnClick: boolean = false, expireTime: number = 0): void => {
    if (tm.players.count === 0) { return }
    if (login !== undefined) {
      Client.callNoRes('SendDisplayManialinkPageToLogin', [
        { string: typeof login === 'string' ? login : login.join(',') },
        { string: manialink }, { int: expireTime }, { boolean: deleteOnClick }])
      return
    }
    Client.callNoRes('SendDisplayManialinkPage', [{ string: manialink }, { int: expireTime }, { boolean: deleteOnClick }])
  }

  /**
   * Updates player information in runtime memory and database
   * @param players Objects containing player login and infos to update
   */
  export const updatePlayerInfo = async (...players:
    { login: string, nickname?: string, region?: string, title?: string }[]): Promise<void> => {
    await PlayerService.updateInfo(...players)
    RecordService.updateInfo(...players)
    AdministrationService.updateNickname(...players.filter(a => a.nickname !== undefined) as any)
    Events.emit('PlayerDataUpdated', players)
  }

  /**
   * Gets current server state. ('result', 'race', 'transition')
   */
  export const getState = (): tm.ServerState => {
    return GameService.state
  }

  /**
   * Gets current server gamemode. ('Rounds', 'TimeAttack', 'Teams', 'Laps', 'Stunts', 'Cup')
   */
  export const getGameMode = (): tm.GameMode => {
    return GameService.gameMode
  }

  /**
   * Adds a listener to an event to execute callbacks.
   * @param event Event or array of events to register the callback on
   * @param callback Callback to register on given event
   * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
   */
  export const addListener = Events.addListener

  /**
   * Removes event listener,
   * @param callback Callback function of the listener to remove
   */
  export const removeListener = Events.removeListener

  /**
   * Emits ManialinkClick for given player and actionId. 
   * Used for manialink interaction such as opening UI windows.
   * @param id Manialink ID
   * @param login Player login
   */
  export const openManialink = (id: number, login: string): void => {
    const player = PlayerService.get(login)
    if (player === undefined) { return }
    const info: tm.ManialinkClickInfo = {
      ...player,
      actionId: id
    }
    Events.emit('ManialinkClick', info)
  }

  export const config = {

    /**
     * Controller config.
     */
    controller: controllerConfig,

    /**
     * Current dedicated server config.
     */
    get server() { return ServerConfig.config },

    /**
     * Current game config.
     */
    get game() { return GameService.config }

  }
}

declare global {
  const tm: typeof trakman
}

(global as any).tm = trakman
