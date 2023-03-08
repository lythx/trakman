import { ChatRepository } from '../database/ChatRepository.js'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import config from '../../config/Config.js'
import messages from '../../config/Messages.js'
import { prefixes } from '../../config/PrefixesAndPalette.js'

type PrefixFunction = (info: tm.MessageInfo) => Promise<string | undefined> | (string | undefined)

/**
 * This service manages chat table and chat commands
 */
export abstract class ChatService {

  private static readonly messagesArraySize: number = config.chatMessagesInRuntime
  private static readonly _messages: tm.Message[] = []
  private static readonly repo: ChatRepository = new ChatRepository()
  private static readonly _commandList: tm.Command[] = []
  private static readonly customPrefixes: { callback: PrefixFunction, position: number }[] = []
  private static readonly messageStyleFunctions: { importance: number, callback: PrefixFunction }[] = []
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
  }

  /**
   * Adds chat commands to the server
   * @param commands Chat commands to register
   */
  static addCommand(...commands: tm.Command[]): void {
    this._commandList.push(...commands)
    this._commandList.sort((a, b): number => a.aliases[0].localeCompare(b.aliases[0]))
    for (const command of commands) {
      Events.addListener('PlayerChat', (info): void => void this.commandCallback(command, info))
    }
  }

  private static async commandCallback(command: tm.Command, info: tm.MessageInfo): Promise<void> {
    const prefix: string = command.privilege === 0 ? '/' : '//'
    const input: string = info.text?.trim()
    const [alias, ...params] = input.split(' ').filter(a => a !== '')
    const aliasUsed: string | undefined = alias?.toLowerCase()
    if (!command.aliases.some((alias: string): boolean => aliasUsed === (prefix + alias))) { return }
    if (info.privilege < command.privilege) {
      this.sendErrorMessage(messages.noPermission, info.login)
      return
    }
    Logger.info(`${Utils.strip(info.nickname)} (${info.login}) used command ${aliasUsed}${params.length === 0 ? '' : ` with params ${params.join(', ')}`}`)
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
            if (!isNaN(Number(params[i])) && Number(params[i]) > 0) {
              if (isNaN(new Date(Number(params[i])).getTime())) {
                this.sendErrorMessage(Utils.strVar(messages.timeTooBig, { name: param.name }), info.login)
                return
              }
              parsedParams.push(Number(params[i]) * 1000 * 60)
              break
            } // If there's no modifier then time is treated as minutes
            const unit: string = params[i].substring(params[i].length - 1).toLowerCase()
            const time: number = Number(params[i].substring(0, params[i].length - 1))
            if (isNaN(time) || time < 0) {
              this.sendErrorMessage(Utils.strVar(messages.notTime, { name: param.name }), info.login)
              return
            }
            let parsedTime: number
            switch (unit) {
              case 's':
                parsedTime = time * 1000
                break
              case 'm':
                parsedTime = time * 1000 * 60
                break
              case 'h':
                parsedTime = time * 1000 * 60 * 60
                break
              case 'd':
                parsedTime = time * 1000 * 60 * 60 * 24
                break
              default:
                this.sendErrorMessage(Utils.strVar(messages.notTime, { name: param.name }), info.login)
                return
            }
            if (isNaN(new Date(parsedTime).getTime())) {
              this.sendErrorMessage(Utils.strVar(messages.timeTooBig, { name: param.name }), info.login)
              return
            }
            parsedParams.push(parsedTime)
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
      aliasUsed: aliasUsed.slice(1)
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
   * @returns Message object or Error if unsuccessfull
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
    if (text?.[0] !== '/') { // I dont trim here cuz if u put space in front of slash the message gets displayed
      this._messages.unshift(message)
      void this.repo.add(login, text, message.date)
      Logger.trace(`${Utils.strip(player.nickname)} (${player.login}) sent message: ${text}`)
      if (this.manualChatRoutingEnabled) {
        let str = ''
        for (const e of this.customPrefixes.filter(a => a.position < 0)) {
          str += await e.callback(messageInfo)
        }
        let customMessage = false
        for (const e of this.messageStyleFunctions) {
          const result = await e.callback(messageInfo)
          if (result !== undefined) {
            str += result
            customMessage = true
            break
          }
        }
        if (!customMessage) {
          str += Utils.strVar(prefixes.manualChatRoutingMessageFormat, { name: player.nickname })
        }
        for (const e of this.customPrefixes.filter(a => a.position >= 0)) {
          str += await e.callback(messageInfo)
        }
        Client.callNoRes('ChatSendServerMessage', [{
          string: str + text
        }])
      }
    }
    this._messages.length = Math.min(this.messagesArraySize, this._messages.length)
    return messageInfo
  }

  static addCustomPrefix(callback: PrefixFunction, position: number) {
    this.customPrefixes.push({ callback, position })
    this.customPrefixes.sort((a, b) => b.position - a.position)
  }

  static removeCustomPrefix(callback: PrefixFunction) {
    const index = this.customPrefixes.findIndex(a => a.callback === callback)
    this.customPrefixes.splice(index, 1)
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

  static addMessageStyle(callback: PrefixFunction, importance: number) {
    this.messageStyleFunctions.push({ callback, importance })
    this.messageStyleFunctions.sort((a, b) => b.importance - a.importance)
  }

}
