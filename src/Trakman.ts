import { GameService } from './services/GameService.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService } from './services/RecordService.js'
import { MapService } from './services/MapService.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import { Client } from './client/Client.js'
import { ChatService } from './services/ChatService.js'
import colours from './data/Colours.json' assert {type: 'json'}
import { Events } from './Events.js'
import { Utils } from './Utils.js'
import { randomUUID } from 'crypto'
import { Database } from './database/DB.js'
import { TMXService } from './services/TMXService.js'
import { ErrorHandler } from './ErrorHandler.js'
import { JukeboxService } from './services/JukeboxService.js'
import fetch from 'node-fetch'
import tls from 'node:tls'
import 'dotenv/config'
import { AdministrationService } from './services/AdministrationService.js'
import specialCharmap from './data/SpecialCharmap.json' assert { type: 'json' }
import _UIIDS from '../plugins/ui/config/ComponentIds.json' assert { type: 'json' }
import { VoteService } from './services/VoteService.js'
import { ManiakarmaService } from './services/ManiakarmaService.js'
import { ServerConfig } from './ServerConfig.js'
import dsc from 'dice-similarity-coeff';

if (process.env.USE_WEBSERVICES === 'YES') {
  tls.DEFAULT_MIN_VERSION = 'TLSv1'
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const DB: Database = new Database()
DB.initialize()

const bills: { id: number, callback: ((status: 'error' | 'refused' | 'accepted', errorString?: string) => void) }[] = []
Events.addListener('Controller.BillUpdated', (info: BillUpdatedInfo) => {
  const billIndex = bills.findIndex(a => a.id === info.id)
  if (billIndex !== -1) {
    switch (info.state) {
      case 4:
        bills[billIndex].callback('accepted')
        break
      case 5:
        bills[billIndex].callback('refused')
        break
      case 6:
        bills[billIndex].callback('error', info.stateName)
        break
      default:
        return
    }
    bills.splice(billIndex, 1)
  }
})

export const TRAKMAN = {

  // TODO THIS IN A CONFIG FILE
  specialTitles: [
    { login: 'redgreendevil', title: 'Venti the Anemo Archon' },
    { login: 'petr_kharpe', title: 'SUSPICIOUS PETER 丹丹丹丹丹丹丹' }
  ],
  titles: ['Player', 'Operator', 'Admin', 'Masteradmin', 'Server Owner'],

  /**
   * Determines the player title on join/actions
   * @param player Player to get the title for
   * @returns The title string
   */
  getTitle(player: any): string {
    const title: string = TRAKMAN.titles[player.privilege]
    const specialTitle = TRAKMAN.specialTitles.find(a => a.login === player.login)
    if (specialTitle !== undefined) {
      return specialTitle.title
    }
    return title
  },

  /**
   * Removes all TM formatting from a string
   * @param str String to strip tags off of
   * @param removeColours Whether to strip colour tags
   * @returns String without format tags
   */
  strip(str: string, removeColours: boolean = true): string {
    let regex: RegExp
    if (removeColours) {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]|\$(?:[\da-f][^$][^$]|[\da-f][^$]|[^][hlp]|(?=[][])|$)|\${1}[^\💀]/gi
    } else {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]/gi
    }
    return str.replace('$$', '💀').replace(regex, '').replace('💀', '$$$$')
  },

  /**
   * Converts milliseconds to humanly readable time
   * @param ms Time to convert (in milliseconds)
   * @returns Humanly readable time string
   */
  msToTime(ms: number): string {
    const d: Date = new Date(ms)
    let str: string = ''
    const seconds: number = d.getUTCSeconds()
    const minutes: number = d.getUTCMinutes()
    const hours: number = d.getUTCHours()
    const days: number = d.getUTCDate() - 1
    const months: number = d.getUTCMonth()
    const years: number = d.getUTCFullYear() - 1970
    if (years > 0) { str += years === 1 ? `${years} year, ` : `${years} years, ` }
    if (months > 0) { str += months === 1 ? `${months} month, ` : `${months} months, ` }
    if (days > 0) { str += days === 1 ? `${days} day, ` : `${days} days, ` }
    if (hours > 0) { str += hours === 1 ? `${hours} hour, ` : `${hours} hours, ` }
    if (minutes > 0) { str += minutes === 1 ? `${minutes} minute, ` : `${minutes} minutes, ` }
    if (seconds > 0) { str += seconds === 1 ? `${seconds} second, ` : `${seconds} seconds, ` }
    str = str.substring(0, str.length - 2)
    const index: number = str.lastIndexOf(',')
    if (index !== -1) { str = str.substring(0, index) + ' and' + str.substring(index + 1) }
    if (str === '') { return '0 seconds' }
    return str
  },

  /**
   * Fetches TMX for map information
   * @param mapId Map UID
   * @returns Map info from TMX or error if unsuccessful
   */
  async fetchTMXMapInfo(mapId: string): Promise<TMXMapInfo | Error> {
    return await TMXService.fetchMapInfo(mapId)
  },

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
  async fetchPlayer(login: string): Promise<any | undefined> {
    return (await PlayerService.fetchPlayer(login))
  },


  /**
   * Gets the player record on the ongoing map
   * @param login Player login
   * @returns Record object or undefined if the player doesn't have a local record
   */
  getPlayerRecord(login: string): TMRecord | undefined {
    return RecordService.records.find(a => a.login === login && a.map === MapService.current.id)
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
    const res: any[] | Error = await Client.call('system.multicall', [{ array: arr }])
    if (res instanceof Error) {
      return res
    }
    const ret: ({ method: string, params: any[] } | Error)[] = []
    for (const [i, r] of res.entries()) {
      if (r.faultCode !== undefined) {
        ret.push(new Error(`Error in system.multicall in response for call ${calls[i].method}: ${r?.faultString ?? ''} Code: ${r.faultCode}`))
      } else {
        ret.push({ method: calls[i].method, params: r })
      }
    }
    return ret
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
   * Removes certain HTML tags that may harm XML manialinks
   * @param str Original string
   * @returns Escaped string
   */
  safeString(str: string): string {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;'
    }
    return str.replace(/[&<>"]/g, (m): string => { return map[m as keyof typeof map] })
  },

  /**
   * Adds a listener to an event to execute callbacks
   * @param event Event to register the callback on
   * @param callback Callback to register on given event
   */
  addListener(event: TMEvent, callback: ((params: any) => void)): void {
    Events.addListener(event, callback)
  },

  /**
   * Adds a map to the server
   * @param filename Path to the map file
   * @param adminLogin Login of the player who is adding the map
   * @returns Added map object or error if unsuccessful
   */
  async addMap(filename: string, adminLogin?: string): Promise<TMMap | Error> {
    return await MapService.add(filename, adminLogin)
  },

  /**
   * Generates a random UUID
   * @returns Random UUID
   */
  randomUUID(): string {
    return randomUUID()
  },

  /**
   * Executes a query on the database
   * @param query Query to execute
   * @returns Database response or error on invalid query
   */
  async queryDB(query: string): Promise<any[] | Error> {
    let res
    try {
      res = await DB.query(query)
    } catch (err: any) {
      return new Error(err)
    } finally {
      if (res === undefined) {
        return new Error('Database response undefined')
      }
      return res.rows
    }
  },

  /**
   * Fetches the map from TMX via its UID
   * @param mapId Map UID
   * @returns TMX map data or error if unsuccessful
   */
  async fetchMapFileByUid(mapId: string): Promise<TMXFileData | Error> {
    return await TMXService.fetchMapFileByUid(mapId)
  },

  /**
   * Outputs an error message into the console
   * @param lines Error messages
   */
  error(...lines: string[]): void {
    ErrorHandler.error(...lines)
  },

  /**
   * Outputs an error message into the console and exits the process
   * @param lines Error messages
   */
  fatalError(...lines: string[]): void {
    ErrorHandler.fatal(...lines)
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
  addToJukebox(mapId: string): void {
    JukeboxService.add(mapId)
  },

  /**
   * Removes a map from the queue
   * @param mapId Map UID
   */
  removeFromJukebox(mapId: string): void {
    JukeboxService.remove(mapId)
  },

  /**
   * Removes all maps from jukebox
   */
  clearJukebox(): void {
    JukeboxService.clear()
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
  async fetchWebServices(login: string): Promise<any | Error> {
    if (process.env.USE_WEBSERVICES !== "YES") {
      return new Error('Use webservices set to false')
    }
    const au: string = "Basic " + Buffer.from(`${process.env.WEBSERVICES_LOGIN}:${process.env.WEBSERVICES_PASSWORD}`).toString('base64')
    const response = await fetch(`https://ws.trackmania.com/tmf/players/${login}/`, {
      headers: {
        "Authorization": au
      }
    }).catch(err => err)
    if (response instanceof Error) {
      ErrorHandler.error(`Error while fetching webservices data dor login ${login}`, response.message)
      return response
    }
    return await response.json()
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
  removeFromBanlist: (login: string, callerLogin: string): boolean => {
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
  removeFromBlacklist: (login: string, callerLogin: string): boolean => {
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
  removeFromGuestlist: async (login: string, callerLogin: string): Promise<boolean | Error> => {
    return await AdministrationService.removeFromGuestlist(login, callerLogin)
  },

  /**
   * Parses the 'time' type of TMCommand parameter
   * @param timeString String to be parsed to number
   * @returns Parsed number (in milliseconds) or undefined if format is invalid
   */
  parseParamTime: (timeString: string): number | undefined => {
    if (!isNaN(Number(timeString))) { return Number(timeString) * 1000 * 60 } // If there's no modifier then time is treated as minutes
    const unit: string = timeString.substring(timeString.length - 1).toLowerCase()
    const time: number = Number(timeString.substring(0, timeString.length - 1))
    if (isNaN(time)) { return undefined }
    switch (unit) {
      case 's':
        return time * 1000
      case 'm':
        return time * 1000 * 60
      case 'h':
        return time * 1000 * 60 * 60
      case 'd':
        return time * 1000 * 60 * 60 * 24
      default:
        return undefined
    }
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
  removeRecord: async (login: string, mapId: string): Promise<any[]> => {
    return await RecordService.remove(login, mapId)
  },

  /**
   * Removes all player records on given map
   * @param mapId Map UID
   * @returns Database response
   */
  removeAllRecords: async (mapId: string): Promise<any[]> => {
    return await RecordService.removeAll(mapId)
  },

  stripSpecialChars(str: string): string {
    const charmap = Object.fromEntries(Object.entries(specialCharmap).map((a: [string, string[]]): [string, string[]] => {
      return [a[0], [a[0], ...a[1]]]
    }))
    let strippedStr = ''
    for (const letter of str) {
      let foundLetter = false
      for (const key in charmap) {
        if (charmap[key].includes(letter)) {
          strippedStr += key
          foundLetter = true
          break
        }
      }
      if (!foundLetter) {
        strippedStr += letter
      }
    }
    return strippedStr
  },


  /**
   * Attempts to convert the player nickname to their login via charmap
   * @param nickName Player nickname
   * @returns Possibly matching login or undefined if unsuccessful
   */
  nicknameToLogin(nickName: string): string | undefined {
    const nicknames = this.players.map(a => ({ login: a.login, nickname: this.strip(a.nickName).toLowerCase() }))
    const strippedNicknames: { nickname: string, login: string }[] = []
    for (const e of nicknames) {
      strippedNicknames.push({ nickname: this.stripSpecialChars(e.nickname), login: e.login })
    }
    const matches: { login: string, value: number }[] = []
    for (const e of strippedNicknames) {
      const value = dsc.twoStrings(e.nickname, nickName.toLowerCase())
      if (value > 0.4) {
        matches.push({ login: e.login, value })
      }
    }
    if (matches.length === 0) {
      return undefined
    }
    const s = matches.sort((a, b) => b.value - a.value)
    if (s[0].value - s?.[1]?.value ?? 0 < 0.15) {
      return undefined
    }
    return s[0].login
  },

  matchString(searchString: string, possibleMatches: string[]): string[] {
    const arr: { str: string, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({ str: e, value: dsc.twoStrings(searchString, e) })
    }
    return arr.sort((a, b) => b.value - a.value).map(a => a.str)
  },

  /**
   * Formats date into calendar display
   * @param date Date to be formatted
   * @param displayDay Whether to display day
   * @returns Formatted date string
   */
  formatDate(date: Date, displayDay?: true): string {
    if (displayDay === true) {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  },

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

  async sendCoppers(payerLogin: string, amount: number, message: string, targetLogin: string = ''): Promise<boolean | Error> {
    const billId = await Client.call('SendBill', [{ string: payerLogin }, { int: amount }, { string: message }, { string: targetLogin }])
    if (billId instanceof Error) { return billId }
    return await new Promise((resolve): void => {
      const callback = (status: 'error' | 'refused' | 'accepted', errorString?: string): void => {
        switch (status) {
          case 'accepted':
            resolve(true)
            if (targetLogin === '' /* || targetLogin === TODO check if server*/) {
              // TODO push to donors table
            }
            break
          case 'refused':
            resolve(false)
            break
          case 'error':
            resolve(new Error(errorString ?? 'error'))
        }
      }
      bills.push({ id: billId[0], callback })
    })
  },

  get gameInfo(): TMGame {
    return Object.assign(GameService.game)
  },

  get players(): TMPlayer[] {
    return PlayerService.players
  },

  get records(): TMRecord[] {
    return RecordService.records
  },

  get localRecords(): LocalRecord[] {
    return RecordService.localRecords
  },

  get dediRecords(): TMDedi[] {
    return [...DedimaniaService.dedis]
  },

  get liveRecords(): FinishInfo[] {
    return RecordService.liveRecords
  },

  get map(): TMMap {
    return Object.assign(MapService.current)
  },

  get messages(): TMMessage[] {
    return [...ChatService.messages]
  },

  get colours() {
    return colours
  },

  get palette() {
    return {
      // All admin commands
      admin: this.colours.erin,
      // Dedi record messages
      dedirecord: this.colours.darkpastelgreen,
      // Dedi misc messages
      dedimessage: this.colours.kellygreen,
      // Donation messages
      donation: this.colours.brilliantrose,
      // Error messages
      error: this.colours.red,
      // General highlighting colour
      highlight: this.colours.white,
      // Karma messages
      karma: this.colours.greenyellow,
      // Server messages
      servermsg: this.colours.erin,
      // Misc messages
      message: this.colours.lightseagreen,
      // Rank highlighting colour
      rank: this.colours.icterine,
      // Record messages
      record: this.colours.erin,
      // Server message prefix colour
      server: this.colours.yellow,
      // Voting messages
      vote: this.colours.chartreuse,
    }
  },

  get Utils() {
    return Utils
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

  get jukebox(): TMMap[] {
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
  },
}
