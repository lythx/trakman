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
import { JukeboxService } from './services/JukeboxService.js'
import 'dotenv/config'
import { AdministrationService } from './services/AdministrationService.js'
import _UIIDS from '../plugins/ui/config/ComponentIds.json' assert { type: 'json' }
import { VoteService } from './services/VoteService.js'
import { ManiakarmaService } from './services/ManiakarmaService.js'
import { ServerConfig } from './ServerConfig.js'
import { Logger } from './Logger.js'
import http from 'http'
import { PlayerIdsRepository } from './database/PlayerIdsRepository.js'
import { MapIdsRepository } from './database/MapIdsRepository.js'

const playerIdsRepo: PlayerIdsRepository = new PlayerIdsRepository()
await playerIdsRepo.initialize()

const mapIdsRepo: MapIdsRepository = new MapIdsRepository()
await mapIdsRepo.initialize()

const DB: Database = new Database()
await DB.initialize()

export const TRAKMAN = {

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

    fetchMapFile: TMXService.fetchMapFile.bind(TMXService)

  },

  // TO BE REMOVED
  getPlayerDBId: playerIdsRepo.get.bind(playerIdsRepo),

  // Implement client idk
  DatabaseClient: Database,

  /**
   * Gets the player information
   * @param login Player login
   * @returns Player object or undefined if the player isn't online
   */
  getPlayer(login: string): TMPlayer | undefined {
    return PlayerService.players.find(a => a.login === login)
  },

  /**
   * Fetches the player information from the database
   * @param login Player login
   * @returns Player object or undefined if the player isn't in the database
   */
  async fetchPlayer(login: string): Promise<TMOfflinePlayer | undefined> {
    return (await PlayerService.fetchPlayer(login))
  },


  /**
   * Gets the player record on the ongoing map
   * @param login Player login
   * @returns Record object or undefined if the player doesn't have a local record
   */
  getPlayerRecord(login: string): TMRecord | undefined {
    return RecordService.localRecords.find(a => a.login === login && a.map === MapService.current.id)
  },

  /**
   * Gets the player dedimania record on the ongoing map
   * @param login Player login
   * @returns Dedi record object or undefined if the player doesn't have a dedi record
   */
  getPlayerDedi(login: string): TMDedi | undefined {
    return DedimaniaService.dedis.find(a => a.login === login)
  },

  /**
   * Gets the recent player messages
   * @param login Player login
   * @returns Array of recent player messages
   */
  getPlayerMessages(login: string): TMMessage[] {
    return ChatService.messages.filter(a => a.login === login)
  },

  /**
   * Calls a dedicated server method and awaits the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method
   * @returns Server response or error if the server returns one
   */
  async call(method: string, params: any[] = []): Promise<any[] | Error> {
    return await Client.call(method, params)
  },

  /**
   * Calls a dedicated server method without caring for the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method
   */
  callNoRes(method: string, params: any[] = []): void {
    Client.callNoRes(method, params)
  },

  /**
   * Calls multiple dedicated server methods simultaneously and awaits the response
   * @param calls Array of dedicated server calls
   * @returns Server response or error if the server returns one
   */
  async multiCall(...calls: TMCall[]): Promise<({ method: string, params: any[] } | Error)[] | Error> {
    return Utils.multiCall(...calls)
  },

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

  /**
   * Adds a chat command to the server
   * @param command Chat command to register
   */
  addCommand(command: TMCommand): void {
    ChatService.addCommand(command)
  },

  /**
   * Adds a listener to an event to execute callbacks
   * @param event Event to register the callback on
   * @param callback Callback to register on given event
   * @param prepend If set to true puts the listener on the beggining of the array (it will get executed before other listeners)
   */
  addListener: Events.addListener,

  /**
   * Adds a map to the server
   * @param filename Path to the map file
   * @param callerLogin Login of the player who is adding the map
   * @returns Added map object or error if unsuccessful
   */
  async addMap(filename: string, callerLogin?: string): Promise<TMMap | Error> {
    return await MapService.add(filename, callerLogin)
  },

  async removeMap(id: string, callerLogin?: string): Promise<boolean | Error> {
    return await MapService.remove(id, callerLogin)
  },

  /**
   * Outputs an error message into the console
   * @param lines Error messages
   */
  error(...lines: any[]): void {
    Logger.error(...lines)
  },

  /**
   * Outputs an error message into the console and exits the process
   * @param lines Error messages
   */
  async fatalError(...lines: string[]): Promise<void> {
    await Logger.fatal(...lines)
  },

  /**
   * Sets a player privilege level
   * @param login Player login
   * @param privilege Privilege level
   */
  setPrivilege(login: string, privilege: number, adminLogin: string): void {
    PlayerService.setPrivilege(login, privilege, adminLogin)
  },

  /**
   * Adds a map to the queue
   * @param mapId Map UID
   */
  addToJukebox(mapId: string, callerLogin?: string, setAsNextMap?: true): void {
    JukeboxService.add(mapId, callerLogin, setAsNextMap)
  },

  /**
   * Removes a map from the queue
   * @param mapId Map UID
   */
  removeFromJukebox(mapId: string, callerLogin?: string): void {
    JukeboxService.remove(mapId, callerLogin)
  },

  /**
   * Removes all maps from jukebox
   */
  clearJukebox(callerLogin?: string): void {
    JukeboxService.clear(callerLogin)
  },

  /**
   * Shuffle the map list and jukebox
   */
  shuffleJukebox(adminLogin: string): void {
    JukeboxService.shuffle(adminLogin)
  },

  /**
   * Handles manialink interaction
   * @param id Manialink ID
   * @param login Player login
   */
  openManialink(id: number, login: string): void {
    const temp: any = PlayerService.getPlayer(login)
    temp.answer = id
    const info: ManialinkClickInfo = temp
    Events.emitEvent('Controller.ManialinkClick', info)
  },

  /**
   * Fetches Trackmania Webservices for player information
   * @param login Player login
   * @returns Player information in JSON or error if unsuccessful
   */
  async fetchWebServices(login: string): Promise<{
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

  /**
   * Adds a player to the server ban list
   * @param ip Player IP address
   * @param login Player login
   * @param callerLogin Admin login
   * @param reason Optional ban reason
   * @param expireDate Optional ban expire date
   */
  addToBanlist: (ip: string, login: string, callerLogin: string, reason?: string, expireDate?: Date): void => {
    AdministrationService.addToBanlist(ip, login, callerLogin, reason, expireDate)
  },

  /**
   * Removes a player from the server ban list
   * @param login Player login
   */
  removeFromBanlist: (login: string, callerLogin?: string): boolean => {
    return AdministrationService.removeFromBanlist(login, callerLogin)
  },

  /**
   * Adds a player to the server blacklist
   * @param login Player login
   * @param callerLogin Admin login
   * @param reason Optional blacklist reason
   * @param expireDate Optional blacklist expire date
   */
  addToBlacklist: (login: string, callerLogin: string, reason?: string, expireDate?: Date): void => {
    AdministrationService.addToBlacklist(login, callerLogin, reason, expireDate)
  },

  /**
   * Removes a player from the server blacklist
   * @param login Player login
   */
  removeFromBlacklist: (login: string, callerLogin?: string): boolean => {
    return AdministrationService.removeFromBlacklist(login, callerLogin)
  },

  /**
   * Adds a player to the server mute list
   * @param login Player login
   * @param callerLogin Admin login
   * @param reason Optional mute reason
   * @param expireDate Optional mute expire date
   */
  addToMutelist: async (login: string, callerLogin: string, reason?: string, expireDate?: Date): Promise<true | Error> => {
    return await AdministrationService.addToMutelist(login, callerLogin, reason, expireDate)
  },

  /**
   * Removes a player from the server mute list
   * @param login Player login
   */
  removeFromMutelist: async (login: string, callerLogin: string): Promise<boolean | Error> => {
    return await AdministrationService.removeFromMutelist(login, callerLogin)
  },

  /**
   * Adds a player to the server guest list
   * @param login Player login
   * @param callerLogin Admin login
   */
  addToGuestlist: async (login: string, callerLogin: string): Promise<boolean | Error> => {
    return await AdministrationService.addToGuestlist(login, callerLogin)
  },

  /**
   * Removes a player from the server guest list
   * @param login Player login
   */
  removeFromGuestlist: async (login: string, callerLogin?: string): Promise<boolean | Error> => {
    return await AdministrationService.removeFromGuestlist(login, callerLogin)
  },

  /**
   * @returns remaining map time in seconds
   */
  get remainingMapTime(): number {
    return GameService.remainingMapTime
  },

  get remainingResultTime(): number {
    return GameService.remainingResultTime
  },

  /**
   * Adds a callback listener which will be executed when one of the specified dedicated methods gets called
   * @param methods Array of dedicated server methods
   * @param callback Callback to execute
   */
  addProxy: (methods: string[], callback: ((parms: any) => void)): void => {
    Client.addProxy(methods, callback)
  },

  /**
   * Removes a player record
   * @param login Player login
   * @param mapId Map UID
   * @returns Database response
   */
  removeRecord: (login: string, mapId: string, callerLogin?: string): void => {
    RecordService.remove(login, mapId, callerLogin)
  },

  /**
   * Removes all player records on given map
   * @param mapId Map UID
   * @returns Database response
   */
  removeAllRecords: (mapId: string, callerLogin?: string): void => {
    RecordService.removeAll(mapId, callerLogin)
  },

  get serverState(): "race" | "result" {
    return GameService.state
  },

  get localRecordsAmount(): number {
    return RecordService.localsAmount
  },

  get playerRanks(): {
    [login: string]: {
      mapId: string;
      rank: number;
    }[];
  } {
    return RecordService.playerRanks
  },

  fetchRecords: RecordService.fetchRecords.bind(RecordService),

  fetchRecord: RecordService.fetchRecord.bind(RecordService),

  fetchRecordsByLogin: RecordService.fetchRecordsByLogin.bind(RecordService),

  fetchMapRank: RecordService.fetchMapRank.bind(RecordService),

  /**
   * Adds a player vote to the database and to Maniakarma service if its running
   * @param mapId Map UID
   * @param login Player login
   * @param vote Player vote
   */
  async addVote(mapId: string, login: string, vote: -3 | -2 | -1 | 1 | 2 | 3): Promise<void> {
    if (process.env.USE_MANIAKARMA === 'YES') {
      ManiakarmaService.addVote(mapId, login, vote)
    }
    await VoteService.add(mapId, login, vote)
  },

  /**
   * Fetches all votes for a map
   * @param mapId Map UID
   * @returns Database response
   */
  async fetchVotes(mapId: string): Promise<any[]> {
    return await VoteService.fetch(mapId)
  },

  sendCoppers: Utils.sendCoppers.bind(Utils),

  get gameInfo(): TMGame {
    return Object.assign(GameService.game)
  },

  get serverConfig(): ServerInfo {
    return ServerConfig.config
  },

  get players(): TMPlayer[] {
    return PlayerService.players
  },

  get localRecords(): TMLocalRecord[] {
    return RecordService.localRecords
  },

  get dediRecords(): TMDedi[] {
    return [...DedimaniaService.dedis]
  },

  get liveRecords(): FinishInfo[] {
    return RecordService.liveRecords
  },

  get map(): TMCurrentMap {
    return MapService.current
  },

  get messages(): TMMessage[] {
    return [...ChatService.messages]
  },

  get maps(): TMMap[] {
    return MapService.maps
  },

  get TMXInfo(): TMXMapInfo | null {
    return TMXService.current
  },

  get mapQueue(): TMMap[] {
    return JukeboxService.queue
  },

  get jukebox() {
    return JukeboxService.jukebox
  },

  get previousMaps(): TMMap[] {
    return JukeboxService.previous
  },

  get TMXPrevious(): (TMXMapInfo | null)[] {
    return TMXService.previous
  },

  get TMXCurrent(): TMXMapInfo | null {
    return TMXService.current
  },

  get TMXNext(): (TMXMapInfo | null)[] {
    return TMXService.next
  },

  get votes(): TMVote[] {
    return VoteService.votes
  },

  get voteRatios() {
    return VoteService.voteRatios
  },

  get commandList(): TMCommand[] {
    return ChatService.commandList
  },

  get UIIDS() {
    return { ..._UIIDS }
  },

  get banlist() {
    return AdministrationService.banlist
  },

  get blacklist() {
    return AdministrationService.blacklist
  },

  get mutelist() {
    return AdministrationService.mutelist
  },

  get guestlist() {
    return AdministrationService.guestlist
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
