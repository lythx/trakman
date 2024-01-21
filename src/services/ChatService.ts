import { ChatRepository } from '../database/ChatRepository.js'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import config from '../../config/Config.js'
import messages from '../../config/Messages.js'
import { prefixes } from '../../config/PrefixesAndPalette.js'

type MessageFunction = (info: tm.MessageInfo) => Promise<string | undefined> | (string | undefined)
type ModifyTextFunction = (info: tm.MessageInfo) => Promise<string | Error | undefined> | (string | Error | undefined)

/**
 * This service manages chat table and chat commands
 */
export abstract class ChatService {

  private static readonly messagesArraySize: number = config.chatMessagesInRuntime
  private static readonly _messages: tm.Message[] = []
  private static readonly repo: ChatRepository = new ChatRepository()
  private static readonly _commandList: tm.Command[] = []
  private static readonly customPrefixes: { callback: MessageFunction, position: number }[] = []
  private static readonly messageStyleFunctions: { importance: number, callback: MessageFunction }[] = []
  private static readonly messageTextModifiers: { importance: number, callback: ModifyTextFunction }[] = []
  static readonly manualChatRoutingEnabled = config.manualChatRoutingEnabled

  /**
   * Fetches messages from database
   */
  static async initialize(): Promise<void> {
    this._messages.push(...await this.repo.get({ limit: this.messagesArraySize }))
    tm.addListener('Startup', () => {
      Client.callNoRes('ChatEnableManualRouting', [
        { boolean: this.manualChatRoutingEnabled },
        { boolean: true }
      ])
    })
    Events.addListener('PlayerChat', (info): void => {
      const input: string = info.text?.trim()
      const [alias, ...params] = input.split(' ').filter(a => a !== '')
      const aliasUsed: string | undefined = alias?.toLowerCase()
      const matches = this._commandList.filter(command => {
        const prefix: string = command.privilege === 0 ? '/' : '//'
        return command.aliases.some((alias: string): boolean => aliasUsed === (prefix + alias))
      })
      if (matches.length === 1) {
        void this.commandCallback(matches[0], info, input, params, aliasUsed)
      } else if (matches.length > 1) {
        for (const e of matches) {
          if (params.length === 0 && (e.params === undefined || e.params.length === 0)) {
            this.commandCallback(e, info, input, params, aliasUsed)
            return
          } else if (params.length === e.params?.length) {
            this.commandCallback(e, info, input, params, aliasUsed)
            return
          }
        }
      }
    })
  }

  /**
   * Adds chat commands to the server
   * @param commands Chat commands to register
   */
  static addCommand(...commands: tm.Command[]): void {
    this._commandList.push(...commands)
    this._commandList.sort((a, b): number => a.aliases[0].localeCompare(b.aliases[0]))
  }

  private static async commandCallback(command: tm.Command, info: tm.MessageInfo,
    input: string, params: string[], alias: string): Promise<void> {
    if (info.privilege < command.privilege) {
      this.sendErrorMessage(messages.noPermission, info.login)
      return
    }
    Logger.info(`${Utils.strip(info.nickname)} (${info.login}) used command ${alias}${params.length === 0 ? '' : ` with params ${params.join(', ')}`}`)
    const parsedParams: (string | number | boolean | undefined | tm.Player | tm.OfflinePlayer)[] = []
    if (command.params !== undefined) {
      for (const [i, param] of command.params.entries()) {
        if (params[i] === undefined && param.optional === true) { continue }
        if (params[i] === undefined && param.optional === undefined) {
          this.sendErrorMessage(Utils.strVar(messages.noParam, { name: param.name }), info.login)
          return
        }
        if (params[i].toLowerCase() === '$u' && param.optional === true) {
          parsedParams.push(undefined)
          continue
        }
        if (param.validValues !== undefined) {
          const enumVal = param.validValues.find(a => a.toString().toLowerCase() === params[i].toLowerCase())
          if (enumVal === undefined) {
            this.sendErrorMessage(Utils.strVar(messages.invalidValue,
              { name: param.name, values: param.validValues.join(', ') }), info.login)
            return
          }
          parsedParams.push(enumVal)
          continue
        }
        switch (param.type) {
          case 'int':
            if (!Number.isInteger(Number(params[i]))) {
              this.sendErrorMessage(Utils.strVar(messages.notInt, { name: param.name }), info.login)
              return
            }
            parsedParams.push(Number(params[i]))
            break
          case 'double':
            if (isNaN(Number(params[i]))) {
              this.sendErrorMessage(Utils.strVar(messages.notDouble, { name: param.name }), info.login)
              return
            }
            parsedParams.push(Number(params[i]))
            break
          case 'boolean':
            if (![...config.truthyParams, ...config.falsyParams].includes(params[i].toLowerCase())) {
              this.sendErrorMessage(Utils.strVar(messages.notBoolean, { name: param.name }), info.login)
              return
            }
            parsedParams.push(config.truthyParams.includes(params[i].toLowerCase()))
            break
          case 'time':
            const timeOrError = Utils.parseTimeString(params[i])
            if (timeOrError instanceof RangeError) {
              this.sendErrorMessage(Utils.strVar(messages.timeTooBig,
                { name: param.name }), info.login)
              return
            } else if (timeOrError instanceof TypeError) {
              this.sendErrorMessage(Utils.strVar(messages.notTime,
                { name: param.name }), info.login)
              return
            }
            parsedParams.push(timeOrError)
            break
          case 'player': {
            let player = PlayerService.get(params[i])
            if (player === undefined) {
              player = Utils.nicknameToPlayer(params[i])
              if (player === undefined) {
                this.sendErrorMessage(Utils.strVar(messages.noPlayer, { name: params[i] }), info.login)
                return
              }
            }
            parsedParams.push(player)
            break
          }
          case 'offlinePlayer': {
            let player: tm.OfflinePlayer | undefined = PlayerService.get(params[i])
            if (player === undefined) {
              player = await PlayerService.fetch(params[i])
              if (player === undefined) {
                this.sendErrorMessage(Utils.strVar(messages.unknownPlayer, { name: params[i] }), info.login)
                return
              }
            }
            parsedParams.push(player)
            break
          }
          case 'multiword':
            const split: string[] = input.split(' ')
            let n: number = 0
            while (true) {
              const chunk: string | undefined = split.shift()
              if (params[n] === chunk) {
                if (n === i) {
                  parsedParams.push([chunk, ...split].join(' '))
                  break
                }
                n++
              }
            }
            break
          default:
            parsedParams.push(params[i])
        }
      }
    }
    const messageInfo: tm.MessageInfo & { aliasUsed: string } = {
      ...info,
      text: input.split(' ').splice(1).join(' '),
      aliasUsed: alias.slice(1)
    }
    command.callback(messageInfo, ...parsedParams)
  }

  private static sendErrorMessage(message: string, login: string): void {
    Client.callNoRes('ChatSendServerMessageToLogin', [{ string: prefixes.serverToPlayer + message }, { string: login }])
  }

  /**
   * Adds message to the database and runtime memory
   * @param login Player login
   * @param text Message text
   * @returns Message object or Error if unsuccessful
   */
  static async add(login: string, text: string): Promise<tm.MessageInfo | Error> {
    const player: tm.Player | undefined = PlayerService.get(login)
    if (player === undefined) {
      const errStr: string = `Error while adding message. Cannot find player ${login} in the memory`
      Logger.error(errStr)
      return new Error(errStr)
    }
    const message: tm.Message = {
      login,
      nickname: player.nickname,
      text,
      date: new Date()
    }
    const messageInfo: tm.MessageInfo = {
      text,
      date: message.date,
      ...player
    }
    if (text[0] !== '/') { // I dont trim here cuz if u put space in front of slash the message gets displayed
      Logger.trace(`${Utils.strip(player.nickname)} (${player.login}) sent message: ${text}`)
      if (this.manualChatRoutingEnabled) {
        let str = ''
        for (const e of this.customPrefixes.filter(a => a.position < 0)) {
          str += await e.callback(messageInfo)
        }
        let customStyle = false
        for (const e of this.messageStyleFunctions) {
          const result = await e.callback(messageInfo)
          if (result !== undefined) {
            str += result
            customStyle = true
            break
          }
        }
        if (!customStyle) {
          str += Utils.strVar(prefixes.manualChatRoutingMessageStyle, { name: player.nickname })
        }
        for (const e of this.messageTextModifiers) {
          const result = await e.callback(messageInfo)
          if (result instanceof Error) {
            return result
          }
          if (result !== undefined) {
            text = result
            break
          }
        }
        for (const e of this.customPrefixes.filter(a => a.position >= 0)) {
          str += await e.callback(messageInfo)
        }
        Client.callNoRes('ChatSendServerMessage', [{
          string: str + text
        }])
      }
      this._messages.unshift(message)
      void this.repo.add(login, text, message.date)
    }
    this._messages.length = Math.min(this.messagesArraySize, this._messages.length)
    return messageInfo
  }

  /**
   * Registers a function to add a prefix or postfix to chat messages when using manual chat routing.
   * @param callback The function takes MessageInfo object and returns string (the prefix) or undefined (then its ignored)
   * @param position Prefixes are positioned based on this, lowest one is first, 
   * negative values are positioned before the nickname, positive after it
   */
  static addMessagePrefix(callback: MessageFunction, position: number): void {
    this.customPrefixes.push({ callback, position })
    this.customPrefixes.sort((a, b) => b.position - a.position)
  }

  /**
   * Registers a function to modify the player name on chat message.
   * @param callback The function takes MessageInfo object and returns string (the name) or undefined (then its ignored)
   * @param importance In case multiple functions are registered the most important one will be executed.
   * If it returns undefined the 2nd most important function will be executed and so on
   */
  static setMessageStyle(callback: MessageFunction, importance: number) {
    this.messageStyleFunctions.push({ callback, importance })
    this.messageStyleFunctions.sort((a, b) => b.importance - a.importance)
  }

  /**
   * Registers a function to modify chat message text.
   * @param callback The function takes MessageInfo object and returns string (the name), 
   * error (prevents message from being sent) or undefined (then its ignored)
   * @param importance In case multiple functions are registered the most important one will be executed.
   * If it returns undefined the 2nd most important will be executed and so on
   */
  static addMessageTextModifier(callback: ModifyTextFunction, importance: number) {
    this.messageTextModifiers.push({ callback, importance })
    this.messageTextModifiers.sort((a, b) => b.importance - a.importance)
  }

  /**
   * Fetches chat messages written by specified player
   * @param login Player login
   * @param options Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched
   * @returns Array of message objects
   */
  static async fetchByLogin(login: string, options: { limit?: number; date?: Date; }): Promise<tm.Message[]> {
    return await this.repo.getByLogin(login, options)
  }

  /**
   * Fetches chat messages.
   * @param options Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched
   * @returns Array of message objects
   */
  static async fetch(options: { limit?: number; date?: Date; }): Promise<tm.Message[]> {
    return await this.repo.get(options)
  }

  /**
   * Gets recent chat messages written by specified player
   * @param login Player login 
   * @returns Array of message objects
   */
  static get(login: string): Readonly<tm.Message>[] {
    return this._messages.filter(a => a.login === login)
  }

  /**
   * Recent chat messages.
   */
  static get messages(): Readonly<tm.Message>[] {
    return [...this._messages]
  }

  /**
   * Number of recent chat messages.
   */
  static get messageCount(): number {
    return this._messages.length
  }

  /**
   * All registered chat commands.
   */
  static get commandList(): tm.Command[] {
    return [...this._commandList]
  }

  /**
   * Number of commands.
   */
  static get commandCount(): number {
    return this._commandList.length
  }

}
