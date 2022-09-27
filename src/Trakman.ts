import { Events } from './Events.js'
import { GameService } from './services/GameService.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { MapService } from './services/MapService.js'
import { Client } from './client/Client.js'
import { ChatService } from './services/ChatService.js'
import { Utils } from './Utils.js'
import { Database } from './database/DB.js'
import { TMXService } from './TMXService.js'
import { AdministrationService } from './services/AdministrationService.js'
import { VoteService } from './services/VoteService.js'
import { ServerConfig } from './ServerConfig.js'
import { Logger } from './Logger.js'
import { PlayerRepository } from './database/PlayerRepository.js'
import { MapIdsRepository } from './database/MapIdsRepository.js'
import prefixes from '../config/Prefixes.js'
import controllerConfig from '../config/Config.js'
import { TMCallParams } from './types/TMCallParams.js'
import { TMServerInfo } from './types/TMServerInfo.js'
import { TMBanlistEntry } from './types/TMBanlistEntry.js'
import { TMBlacklistEntry } from './types/TMBlacklistEntry.js'
import { TMCall } from './types/TMCall.js'
import { TMCheckpoint } from './types/TMCheckpoint.js'
import { TMCommand } from './types/TMCommand.js'
import { TMEvents } from './types/TMEvents.js'
import { TMGame } from './types/TMGame.js'
import { TMGuestlistEntry } from './types/TMGuestlistEntry.js'
import { TMOfflinePlayer } from './types/TMOfflinePlayer.js'
import { TMLocalRecord } from './types/TMLocalRecord.js'
import { TMPlayer } from './types/TMPlayer.js'
import { TMRecord } from './types/TMRecord.js'
import { TMVote } from './types/TMVote.js'
import { TMCurrentMap } from './types/TMCurrentMap.js'
import { TMMap } from './types/TMMap.js'
import { TMMessage } from './types/TMMessage.js'
import { TMMutelistEntry } from './types/TMMutelistEntry.js'
import { TMXMapInfo } from './types/TMXMapInfo.js'
import { TMXReplay as TMTMXReplay } from './types/TMXReplay.js'
import { MessageInfo as TMMessageInfo } from './types/TMMessageInfo.js'

const playerIdsRepo: PlayerRepository = new PlayerRepository()
await playerIdsRepo.initialize()

const mapIdsRepo: MapIdsRepository = new MapIdsRepository()
await mapIdsRepo.initialize()

const DB: Database = new Database()

namespace trakman {

  export const utils = Utils

  export const db = {

    getMapId: mapIdsRepo.get.bind(mapIdsRepo),

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
      await db.initializeClient()
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

    fetchMapInfo: TMXService.fetchMapInfo.bind(TMXService),

    fetchMapFile: TMXService.fetchMapFile.bind(TMXService)

  }

  export const players = {

    get: PlayerService.get.bind(PlayerService),

    fetch: PlayerService.fetch.bind(PlayerService),

    get list() { return PlayerService.players },

    get count() { return PlayerService.playerCount }

  }

  export const records = {

    getLocal: RecordService.getLocal.bind(RecordService),

    getLive: RecordService.getLive.bind(RecordService),

    remove: RecordService.remove.bind(RecordService),

    removeAll: RecordService.removeAll.bind(RecordService),

    fetchByMap: RecordService.fetch.bind(RecordService),

    fetchOne: RecordService.fetchOne.bind(RecordService),

    fetchByLogin: RecordService.fetchRecordsByLogin.bind(RecordService),

    fetchRecordCount: RecordService.fetchRecordCount.bind(RecordService),

    getRank: RecordService.getRank.bind(RecordService),

    get local() { return RecordService.localRecords },

    get localCount() { return RecordService.localRecordCount },

    get live() { return RecordService.liveRecords },

    get liveCount() { return RecordService.liveRecordsCount },

    get maxLocalsAmount() { return RecordService.maxLocalsAmount }

  }

  export const messages = {

    fetch: ChatService.fetch.bind(ChatService),

    fetchByLogin: ChatService.fetchByLogin.bind(ChatService),

    get: ChatService.get.bind(ChatService),

    get list() { return ChatService._messages }

  }

  export const commands = {

    add: ChatService.addCommand.bind(ChatService),

    get list() { return ChatService.commandList }

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

    get list() { return MapService.maps },

    get current() { return MapService.current },

    get count() { return MapService.mapCount }

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

    get queueCount() { return MapService.queueSize },

    get historyCount() { return MapService.historyCount },

    get maxHistoryCount() { return MapService.historySize },

    get jukedCount() { return MapService.jukeboxCount },

    get queue() { return MapService.queue },

    get history() { return MapService.history },

    get current() { return MapService.current },

    get juked() { return MapService.jukebox }

  }

  export const karma = {

    /**
     * Adds a player vote to the database and to Maniakarma service if its running
     * @param player Player object containing login and nickname
     * @param vote Player vote
     */
    add(player: { login: string, nickname: string }, vote: -3 | -2 | -1 | 1 | 2 | 3): void {
      VoteService.add(player, vote)
    },

    fetch: VoteService.fetch.bind(VoteService),

    get: VoteService.get.bind(VoteService),

    get current() { return VoteService.current },

    get currentCount() { return VoteService.currentCount },

    get list() { return VoteService.votes }

  }

  export const state = {

    /**
     * @returns remaining map time in seconds
     */
    get remainingMapTime(): number {
      return GameService.remainingMapTime
    },

    get remainingResultTime(): number {
      return GameService.remainingResultTime
    },

    get current(): "race" | "result" {
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

    get banlist() { return AdministrationService.banlist },

    get blacklist() { return AdministrationService.blacklist },

    get mutelist() { return AdministrationService.mutelist },

    get guestlist() { return AdministrationService.guestlist },

    get banCount() { return AdministrationService.banCount },

    get blacklistCount() { return AdministrationService.blacklistCount },

    get muteCount() { return AdministrationService.muteCount },

    get guestCount() { return AdministrationService.guestCount }

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

  // TO BE REMOVED
  export const getPlayerDBId = playerIdsRepo.getId.bind(playerIdsRepo)

  //CHANGE LATER
  /**
   * Calls multiple dedicated server methods simultaneously and awaits the response
   * @param calls Array of dedicated server calls
   * @returns Server response or error if the server returns one
   */
  export const multiCall = async (...calls: tm.Call[]): Promise<({ method: string, params: any[] } | Error)[] | Error> => {
    return Utils.multiCall(...calls)
  }

  //CHANGE LATER
  /**
   * Calls multiple dedicated server methods simultaneously without caring for the response
   * @param calls Array of dedicated server calls
   */
  export const multiCallNoRes = (...calls: tm.Call[]): void => {
    const arr: any[] = []
    for (const c of calls) {
      const params: any[] = c.params === undefined ? [] : c.params
      arr.push({
        struct: {
          methodName: { string: c.method },
          params: { array: params }
        }
      })
    }
    Client.callNoRes('system.multicall', [{ array: arr }])
  }

  /**
   * Adds a listener to an event to execute callbacks
   * @param event Event to register the callback on
   * @param callback Callback to register on given event
   * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
   */
  export const addListener = Events.addListener

  /**
   * Handles manialink interaction
   * @param id Manialink ID
   * @param login Player login
   */
  export const openManialink = (id: number, login: string): void => {
    const temp: any = PlayerService.get(login)
    temp.actionId = id
    const info: ManialinkClickInfo = temp
    Events.emit('ManialinkClick', info)
  }

  /**
   * Controller config
   */
  export const config = controllerConfig
}

declare global {
  const tm: typeof trakman
  namespace tm {
    export type Player = TMPlayer
    export type CallParams = TMCallParams
    export type ServerInfo = TMServerInfo
    export type BanlistEntry = TMBanlistEntry
    export type BlacklistEntry = TMBlacklistEntry
    export type Call = TMCall
    export type Checkpoint = TMCheckpoint
    export type Command = TMCommand
    export type CurrentMap = TMCurrentMap
    export type Game = TMGame
    export type GuestlistEntry = TMGuestlistEntry
    export type LocalRecord = TMLocalRecord
    export type Map = TMMap
    export type Message = TMMessage
    export type MutelistEntry = TMMutelistEntry
    export type OfflinePlayer = TMOfflinePlayer
    export type Record = TMRecord
    export type Vote = TMVote
    export type TMXMap = TMXMapInfo
    export type TMXReplay = TMTMXReplay
    export type Events = TMEvents
    export type MessageInfo = TMMessageInfo
  }
}

(global as any).tm = trakman
