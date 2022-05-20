import { GameService } from './services/GameService.js'
import { PlayerService } from './services/PlayerService.js'
import { RecordService, TMRecord } from './services/RecordService.js'
import { ChallengeService } from './services/ChallengeService.js'
import { Client } from './Client.js'
import { ChatService } from './services/ChatService.js'
import colours from './data/Colours.json' assert {type: 'json'}
import { Events } from './Events.js'
import { Utils } from './Utils.js'

export const TRAKMAN = {
  /**
     * Returns an object containing various information about game state
     */
  get gameInfo (): TMGame {
    return Object.assign(GameService.game)
  },

  /**
     * Returns an array of objects containing information about current server players
     */
  get players (): TMPlayer[] {
    return [...PlayerService.players]
  },

  /**
     * Returns an object containing information about specified player or undefined if player is not on the server
     */
  getPlayer (login: string): TMPlayer | undefined {
    return PlayerService.players.find(a => a.login === login)
  },

  /**
     * Searches the database for player information, returns object containing player info or undefined if player isn't in the database
     */
  async fetchPlayer (login: string): Promise<any | undefined> {
    return (await PlayerService.fetchPlayer(login))
  },

  /**
     * Returns an array of objects containing information about local records on current challenge
     */
  getLocalRecords (challenge: string, amount: number): TMRecord[] {
    // love me some lambda expressions
    return RecordService.records.filter(r => r.challenge === challenge)
      .sort((a, b) => a.score - b.score).slice(0, amount)
  },

  /**
     * Returns an object containing information about specified player's record on current map
     * or undefined if the player doesn't have a record
     */
  getPlayerRecord (login: string): TMRecord | undefined {
    return RecordService.records.find(a => a.login === login)
  },

  // static get dediRecords():DediRecord[] {
  //     return [...DedimaniaService.records]
  // }

  // static getPlayerDedi():DediRecord | undefined {
  //     return DedimaniaService.records.find(a=>a.login===login)
  // }

  /**
     * Returns an object containing various information about current challenge
     */
  get challenge (): TMChallenge {
    return Object.assign(ChallengeService.current)
  },

  /**
     * Returns an array of objects containing information about recent messages
     */
  get messages (): TMMessage[] {
    return [...ChatService.messages]
  },

  /**
     * Returns an array of objects containing information about recent messages from a specified player
     */
  getPlayerMessages (login: string): TMMessage[] {
    return ChatService.messages.filter(a => a.login === login)
  },

  /**
     * Calls a dedicated server method. Throws error if the server responds with error.
     */
  async call (method: string, params: any[] = [], expectsResponse: boolean = false): Promise<any[]> {
    return await Client.call(method, params, expectsResponse).catch((err: Error) => { throw err })
  },

  async multiCall (expectsResponse: boolean, ...calls: TMCall[]): Promise<CallResponse[]> {
    const arr: any[] = []
    for (const c of calls) {
      const params = c.params == null ? [] : c.params
      arr.push({
        struct: {
          methodName: { string: c.method },
          params: { array: params }
        }
      })
    }
    if (!expectsResponse) {
      await Client.call('system.multicall', [{
        array: arr
      }], expectsResponse)
      return []
    }
    const res = await Client.call('system.multicall', [{
      array: arr
    }], expectsResponse)
    const ret: CallResponse[] = []
    for (const [i, r] of res.entries()) { ret.push({ method: calls[i].method, params: r }) }
    return ret
  },

  /**
     * Sends a server message. If login is specified the message is sent only to login, otherwise it's sent to everyone
     */
  async sendMessage (message: string, login?: string): Promise<void> {
    if (login) {
      await Client.call('ChatSendServerMessageToLogin', [{ string: message }, { string: login }], false)
      return
    }
    await Client.call('ChatSendServerMessage', [{ string: message }], false)
  },

  /**
     * Returns an object containing various colors as keys, and their 3-digit hexes as values. Useful for text colouring in plugins
     */
  get colours () {
    return colours
  },

  /**
     * Adds a chat command
     */
  addCommand (command: TMCommand) {
    ChatService.addCommand(command)
  },

  /**
     * Adds callback function to execute on given event
     */
  addListener (event: string, callback: Function) {
    Events.addListener(event, callback)
  },

  get Utils () {
    return Utils
  }
}
