import { GameService } from './services/GameService.js'
import { PlayerService, Player } from './services/PlayerService.js'
import { RecordService, TMRecord } from './services/RecordService.js'
import { DedimaniaService } from './services/DedimaniaService.js'
import { ChallengeService, Challenge } from './services/ChallengeService.js'
import { Client } from './Client.js'
import { ChatService } from './services/ChatService.js'
import colours from './data/Colours.json' assert {type: "json"}
import { Events } from './Events.js'
import { Time } from './types/Time.js'

export const TRAKMAN = {
  /**
     * Returns an object containing various information about game state
     */
  get gameInfo (): Game {
    const gameInfo: Game = Object.assign(GameService.game)
    return gameInfo
  },

  /**
     * Returns an array of objects containing information about current server players
     */
   get players (): Player[] {
    return [...PlayerService.players]
  },

  /**
     * Returns an object containing information about specified player or undefined if player is not on the server
     */
   getPlayer (login: string): Player | undefined {
    return PlayerService.players.find(a => a.login === login)
  },

  /**
     * Searches the database for player information, returns object containing player info or undefined if player isn't in the database
     */
   async fetchPlayer (login: string): Promise<any | undefined> {
    return (await PlayerService.fetchPlayer(login))?.[0]
  },

  /**
     * Returns an array of objects containing information about local records on current challenge
     */
   get localRecords (): TMRecord[] {
    return [...RecordService.records]
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
   get challenge (): Challenge {
    const challengeInfo: Challenge = Object.assign(ChallengeService.current)
    return challengeInfo
  },

  /**
     * Returns an array of objects containing information about recent messages
     */
   get messages (): Message[] {
    return [...ChatService.messages]
  },

  /**
     * Returns an array of objects containing information about recent messages from a specified player
     */
   getPlayerMessages (login: string): Message[] {
    return ChatService.messages.filter(a => a.login === login)
  },

  /**
     * Calls a dedicated server method. Throws error if the server responds with error.
     */
   async call (method: string, params: any[] = [], expectsResponse: boolean = false): Promise<any[]> {
    return await Client.call(method, params, expectsResponse).catch((err: Error) => { throw err })
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
   addCommand (command: Command) {
    ChatService.addCommand(command)
  },

  /**
     * Adds callback function to execute on given event
     */
   addListener (event: string, callback: Function) {
    Events.addListener(event, callback)
  },

   get Time () {
    return Time
  }
}
