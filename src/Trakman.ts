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

    fetchMapFile: TMXFetcher.fetchMapFile.bind(TMXFetcher)

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
    get count(): number { return PlayerService.playerCount }

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
    get liveCount(): number { return RecordService.liveRecordsCount },

    /**
     * Maximum amount of local records. 
     * All local records get fetched, but only ones below max amount count towards server rank.
     */
    get maxLocalsAmount(): number { return RecordService.maxLocalsAmount }

  }

  export const messages = {

    fetch: ChatService.fetch.bind(ChatService),

    fetchByLogin: ChatService.fetchByLogin.bind(ChatService),

    get: ChatService.get.bind(ChatService),

    /**
     * Recent chat messages. 
     */
    get list(): tm.Message[] { return ChatService.messages }

  }

  export const commands = {

    add: ChatService.addCommand.bind(ChatService),

    /**
     * All registered chat commands.
     */
    get list(): tm.Command[] { return ChatService.commandList }

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

  export const state = {

    /**
     * Remaining map time in seconds
     */
    get remainingMapTime(): number {
      return GameService.remainingMapTime
    },

    /**
     * Remaining result screen time in seconds
     */
    get remainingResultTime(): number {
      return GameService.remainingResultTime
    },

    /**
     * Server state
     */
    get current(): "race" | "result" | "transition" {
      return GameService.state
    },

    get gameConfig(): tm.Game {
      return GameService.config
    },

    get serverConfig(): tm.ServerInfo {
      return ServerConfig.config
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
    get guestCount(): number { return AdministrationService.guestCount }

  }

  /**
  * Sends a server message
  * @param message Message to be sent
  * @param login Optional player login (or comma-joined list of logins)
  */
  export const sendMessage = (message: string, login?: string, prefix: boolean = true): void => {
    if (login !== undefined) {
      Client.callNoRes('ChatSendServerMessageToLogin',
        [{ string: (prefix ? prefixes.prefixes.serverToPlayer : '') + message }, { string: login }])
      return
    }
    Client.callNoRes('ChatSendServerMessage', [{ string: (prefix ? prefixes.prefixes.serverToAll : '') + message }])
  }

  /**
   * Sends a server manialink
   * @param manialink Manialink XML to be sent
   * @param login Optional player login (or comma-joined list of logins)
   * @param deleteOnClick Whether to remove the manialink on player interaction
   * @param expireTime Amount of time (in seconds) for the manialink to disappear
   */
  export const sendManialink = (manialink: string, login?: string, deleteOnClick: boolean = false, expireTime: number = 0): void => {
    if (login !== undefined) {
      Client.callNoRes('SendDisplayManialinkPageToLogin', [
        { string: login }, { string: manialink }, { int: expireTime }, { boolean: deleteOnClick }])
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
    Events.emit('PlayerInfoUpdated', players)
  }

  /**
   * Adds a listener to an event to execute callbacks
   * @param event Event to register the callback on
   * @param callback Callback to register on given event
   * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
   */
  export const addListener = Events.addListener

  /**
   * Removes event listener
   * @param callback Callback function of listener to remove
   */
  export const removeListener = Events.removeListener

  /**
   * Handles manialink interaction
   * @param id Manialink ID
   * @param login Player login
   */
  export const openManialink = (id: number, login: string): void => {
    const temp: any = PlayerService.get(login)
    temp.actionId = id
    const info: tm.ManialinkClickInfo = temp
    Events.emit('ManialinkClick', info)
  }

  /**
   * Controller config
   */
  export const config = controllerConfig
}

declare global {
  const tm: typeof trakman
}

(global as any).tm = trakman
