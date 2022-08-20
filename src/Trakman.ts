import { Events } from './Events.js'
import { GameService } from './services/GameService.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { MapService } from './services/MapService.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import { Client } from './client/Client.js'
import { ChatService } from './services/ChatService.js'
import { Utils } from './Utils.js'
import { Database } from './database/DB.js'
import { TMXService } from './services/TMXService.js'
import 'dotenv/config'
import { AdministrationService } from './services/AdministrationService.js'
import _UIIDS from '../plugins/ui/config/ComponentIds.json' assert { type: 'json' }
import { VoteService } from './services/VoteService.js'
import { ManiakarmaService } from './services/ManiakarmaService.js'
import { ServerConfig } from './ServerConfig.js'
import { Logger } from './Logger.js'
import http from 'http'
import { PlayerRepository } from './database/PlayerRepository.js'
import { MapIdsRepository } from './database/MapIdsRepository.js'

const playerIdsRepo: PlayerRepository = new PlayerRepository()
await playerIdsRepo.initialize()

const mapIdsRepo: MapIdsRepository = new MapIdsRepository()
await mapIdsRepo.initialize()

const DB: Database = new Database()
await DB.initialize()

export const trakman = {

  utils: Utils,

  db: {

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
    }

  },

  tmx: {

    fetchMapInfo: TMXService.fetchMapInfo.bind(TMXService),

    fetchMapFile: TMXService.fetchMapFile.bind(TMXService),

    get current() { return TMXService.current },

    get next() { return TMXService.next },

    get previous() { return TMXService.previous }

  },

  players: {

    get: PlayerService.get.bind(PlayerService),

    fetch: PlayerService.fetch.bind(PlayerService),

    /**
     * Fetches Trackmania Webservices for player information
     * @param login Player login
     * @returns Player information in JSON or error if unsuccessful
     */
    async fetchWebservices(login: string): Promise<{
      id: number
      login: string
      nickname: string
      united: boolean
      path: string
      idZone: number
    } | Error> {
      if (process.env.USE_WEBSERVICES !== "YES") {
        return new Error('Use webservices set to false')
      }
      const au: string = "Basic " + Buffer.from(`${process.env.WEBSERVICES_LOGIN}:${process.env.WEBSERVICES_PASSWORD}`).toString('base64')
      const options = {
        host: `ws.trackmania.com`,
        path: `/tmf/players/${login}/`,
        headers: {
          'Authorization': au,
        }
      }
      return new Promise((resolve): void => {
        http.request(options, function (res): void {
          let data: string = ''
          res.on('data', function (chunk): void {
            data += chunk
          })
          if (res.statusCode === 200) {
            res.on('end', (): void => resolve(JSON.parse(data)))
            return
          }
          res.on('end', (): void => resolve(new Error(data)))
        }).end()
      })
    },

    get list() { return PlayerService.players },

    get count() { return PlayerService.playerCount }

  },

  records: {

    getLocal: RecordService.getLocal.bind(RecordService),

    getLive: RecordService.getLive.bind(RecordService),

    remove: RecordService.remove.bind(RecordService),

    removeAll: RecordService.removeAll.bind(RecordService),

    fetchByMap: RecordService.fetch.bind(RecordService),

    fetchOne: RecordService.fetchOne.bind(RecordService),

    fetchByLogin: RecordService.fetchRecordsByLogin.bind(RecordService),

    fetchRecordCount: RecordService.fetchRecordCount.bind(RecordService),

    get local() { return RecordService.localRecords },

    get localCount() { return RecordService.localRecordCount },

    get live() { return RecordService.liveRecords },

    get liveCount() { return RecordService.liveRecordsCount },

    get maxLocalsAmount() { return RecordService.maxLocalsAmount }

  },

  dedis: {

    get: DedimaniaService.getDedi.bind(DedimaniaService),

    get list() { return DedimaniaService.dedis }

  },

  messages: {

    fetch: ChatService.fetch.bind(ChatService),

    fetchByLogin: ChatService.fetchByLogin.bind(ChatService),

    get: ChatService.get.bind(ChatService),

    get list() { return ChatService._messages }

  },

  commands: {

    add: ChatService.addCommand.bind(ChatService),

    get list() { return ChatService.commandList }

  },

  client: {

    call: Client.call.bind(Client),

    callNoRes: Client.callNoRes.bind(Client),

    addProxy: Client.addProxy.bind(Client),

  },

  maps: {

    get: MapService.get.bind(MapService),

    fetch: MapService.fetch.bind(MapService),

    add: MapService.add.bind(MapService),

    remove: MapService.remove.bind(MapService),

    get list() { return MapService.maps },

    get current() { return MapService.current },

    get count() { return MapService.mapCount }

  },

  log: {

    fatal: Logger.fatal.bind(Logger),

    error: Logger.error.bind(Logger),

    warn: Logger.warn.bind(Logger),

    info: Logger.info.bind(Logger),

    debug: Logger.debug.bind(Logger),

    trace: Logger.trace.bind(Logger)

  },

  jukebox: {

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

  },

  karma: {

    /**
     * Adds a player vote to the database and to Maniakarma service if its running
     * @param mapId Map UID
     * @param player Player object containing login and nickname
     * @param vote Player vote
     */
    async add(mapId: string, player: { login: string, nickname: string }, vote: -3 | -2 | -1 | 1 | 2 | 3): Promise<void> {
      if (process.env.USE_MANIAKARMA === 'YES') {
        ManiakarmaService.addVote(mapId, player.login, vote)
      }
      await VoteService.add(player, vote)
    },

    fetch: VoteService.fetch.bind(VoteService),

    get: VoteService.get.bind(VoteService),

    get current() { return VoteService.current },

    get currentCount() { return VoteService.currentCount },

    get list() { return VoteService.votes }

  },

  state: {

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

    get gameConfig(): TMGame {
      return GameService.config
    },

    get serverConfig(): ServerInfo {
      return ServerConfig.config
    }

  },

  admin: {

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

  },

  /**
  * Sends a server message
  * @param message Message to be sent
  * @param login Optional player login (or comma-joined list of logins)
  */
  sendMessage(message: string, login?: string): void {
    if (login !== undefined) {
      Client.callNoRes('ChatSendServerMessageToLogin', [{ string: message }, { string: login }])
      return
    }
    Client.callNoRes('ChatSendServerMessage', [{ string: message }])
  },

  /**
   * Sends a server manialink
   * @param manialink Manialink XML to be sent
   * @param login Optional player login (or comma-joined list of logins)
   * @param deleteOnClick Whether to remove the manialink on player interaction
   * @param expireTime Amount of time (in seconds) for the manialink to disappear
   */
  sendManialink(manialink: string, login?: string, deleteOnClick: boolean = false, expireTime: number = 0): void {
    if (login !== undefined) {
      Client.callNoRes('SendDisplayManialinkPageToLogin', [
        { string: login }, { string: manialink }, { int: expireTime }, { boolean: deleteOnClick }])
      return
    }
    Client.callNoRes('SendDisplayManialinkPage', [{ string: manialink }, { int: expireTime }, { boolean: deleteOnClick }])
  },

  // TO BE REMOVED
  getPlayerDBId: playerIdsRepo.getId.bind(playerIdsRepo),

  // Implement client idk
  DatabaseClient: Database,


  //CHANGE LATER
  /**
   * Calls multiple dedicated server methods simultaneously and awaits the response
   * @param calls Array of dedicated server calls
   * @returns Server response or error if the server returns one
   */
  async multiCall(...calls: TMCall[]): Promise<({ method: string, params: any[] } | Error)[] | Error> {
    return Utils.multiCall(...calls)
  },

  //CHANGE LATER
  /**
   * Calls multiple dedicated server methods simultaneously without caring for the response
   * @param calls Array of dedicated server calls
   */
  multiCallNoRes(...calls: TMCall[]): void {
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
  },

  /**
   * Adds a listener to an event to execute callbacks
   * @param event Event to register the callback on
   * @param callback Callback to register on given event
   * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
   */
  addListener: Events.addListener,

  /**
   * Handles manialink interaction
   * @param id Manialink ID
   * @param login Player login
   */
  openManialink(id: number, login: string): void {
    const temp: any = PlayerService.get(login)
    temp.answer = id
    const info: ManialinkClickInfo = temp
    Events.emitEvent('Controller.ManialinkClick', info)
  },

  // TO BE REMOVED
  fetchMapRank: RecordService.getRank.bind(RecordService),

  // REMOVE LATER
  get UIIDS() {
    return { ..._UIIDS }
  },

  get mkPlayerVotes(): MKVote[] {
    return ManiakarmaService.playerVotes
  },

  get mkNewVotes(): MKVote[] {
    return ManiakarmaService.newVotes
  },

  get mkMapKarmaValue(): number {
    return ManiakarmaService.mapKarmaValue
  },

  get mkMapKarma() {
    return ManiakarmaService.mapKarma
  }

}

export const palette = Utils.palette 