import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../client/Client.js'
import { Logger } from '../Logger.js'
import { Utils } from '../Utils.js'
import CONFIG from '../../config.json' assert { type: 'json' }

/**
 * This service manages chat table and chat commands
 */
export abstract class ChatService {

  private static readonly messagesArraySize: number = CONFIG.messagesInRuntimeMemory
  static readonly _messages: TMMessage[] = []
  private static readonly repo: ChatRepository = new ChatRepository()
  private static readonly _commandList: TMCommand[] = []

  /**
   * Fetches messages from database
   */
  static async initialize(): Promise<void> {
    await this.repo.initialize()
    this._messages.push(...await this.repo.get({ limit: this.messagesArraySize }))
  }

  /**
   * Adds a chat command to the server
   * @param command Chat command to register
   */
  static addCommand(command: TMCommand): void { // TODO CHANGE AFTER IMPLEMENTING LOGIN TYPE
    const prefix: string = command.privilege === 0 ? '/' : '//'
    this._commandList.push(command)
    this._commandList.sort((a, b): number => a.aliases[0].localeCompare(b.aliases[0]))
    Events.addListener('Controller.PlayerChat', async (info: MessageInfo): Promise<void> => {
      const input: string = info.text?.trim()
      const usedAlias: string | undefined = input.split(' ').shift()?.toLowerCase()
      if (!command.aliases.some((alias: string): boolean => usedAlias === (prefix + alias))) {
        return
      }
      if (info.privilege < command.privilege) {
        Client.callNoRes('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}»${Utils.palette.error} You have no permission to use this command.` }, { string: info.login }])
        return
      }
      const [val, ...params] = input.split(' ').filter(a => a !== '')
      Logger.info(`${info.login} used command ${usedAlias}${params.length === 0 ? '' : ` with params ${params.join(', ')}`}`)
      const parsedParams: (string | number | boolean | undefined)[] = []
      if (command.params) {
        for (const [i, param] of command.params.entries()) {
          if (params[i] === undefined && param.optional === true) { continue }
          if (params[i] === undefined && param.optional === undefined) {
            Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Required param ${param.name} not specified.` }, { string: info.login }])
            return
          }
          if (params[i].toLowerCase() === '$u' && param.optional === undefined) { parsedParams.push(undefined) }
          switch (param.type) {
            case 'int':
              if (!Number.isInteger(Number(params[i]))) {
                Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Provided wrong argument type for parameter <${param.name}>: int.` }, { string: info.login }])
                return
              }
              parsedParams.push(Number(params[i]))
              break
            case 'double':
              if (isNaN(Number(params[i]))) {
                Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Provided wrong argument type for parameter <${param.name}>: double.` }, { string: info.login }])
                return
              }
              parsedParams.push(Number(params[i]))
              break
            case 'boolean':
              if (!['true', 'yes', 'y', '1', 'false', 'no', 'n', '0'].includes(params[i].toLowerCase())) {
                Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Provided wrong argument type for parameter <${param.name}>: boolean.` }, { string: info.login }])
                return
              }
              parsedParams.push(['true', 'yes', 'y', '1',].includes(params[i].toLowerCase()))
              break
            case 'time':
              if (!isNaN(Number(params[i]))) {
                parsedParams.push(Number(params[i]) * 1000 * 60)
                break
              } // If there's no modifier then time is treated as minutes
              const unit: string = params[i].substring(params[i].length - 1).toLowerCase()
              const time: number = Number(params[i].substring(0, params[i].length - 1))
              if (isNaN(time)) {
                Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Provided wrong argument type for time parameter <${param.name}>: time.` }, { string: info.login }])
                return
              }
              switch (unit) {
                case 's':
                  parsedParams.push(time * 1000)
                  break
                case 'm':
                  parsedParams.push(time * 1000 * 60)
                  break
                case 'h':
                  parsedParams.push(time * 1000 * 60 * 60)
                  break
                case 'd':
                  parsedParams.push(time * 1000 * 60 * 60 * 24)
                  break
                default:
                  Client.call('ChatSendServerMessageToLogin', [{ string: `${Utils.palette.server}» ${Utils.palette.error}Provided wrong argument type for time <${param.name}>: time.` }, { string: info.login }])
              }
              break
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
      const messageInfo: MessageInfo = {
        ...info,
        text: input.split(' ').splice(1).join(' ')
      }
      command.callback(messageInfo, ...parsedParams)
    })
  }

  /**
   * Adds message to the database and runtime memory
   * @param login Player login
   * @param text Message text
   * @returns Message object or Error if unsuccessfull
   */
  static add(login: string, text: string): MessageInfo | Error {
    const player: TMPlayer | undefined = PlayerService.get(login)
    if (player === undefined) {
      const errStr: string = `Error while adding message. Cannot find player ${login} in the memory`
      Logger.error(errStr)
      return new Error(errStr)
    }
    const message: TMMessage = {
      login,
      nickname: player.nickname,
      text,
      date: new Date()
    }
    const messageInfo: MessageInfo = {
      text,
      date: message.date,
      ...player
    }
    if (text?.[0] !== '/') { // I dont trim here cuz if u put space in front of slash the message gets displayed
      this._messages.unshift(message)
      void this.repo.add(login, text, message.date)
      Logger.trace(`${player.login} sent message: ${text}`)
    }
    this._messages.length = Math.min(this.messagesArraySize, this._messages.length)
    return messageInfo
  }

  /**
   * Fetches chat messages written by specified player
   * @param login Player login
   * @param options Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched
   * @returns Array of message objects
   */
  static async fetchByLogin(login: string, options: { limit?: number; date?: Date; }): Promise<TMMessage[]> {
    return await this.repo.getByLogin(login, options)
  }

  /**
   * Fetches chat messages
   * @param options Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched
   * @returns Array of message objects
   */
  static async fetch(options: { limit?: number; date?: Date; }): Promise<TMMessage[]> {
    return await this.repo.get(options)
  }

  /**
   * Gets recent chat messages written by specified player
   * @param login Player login 
   * @returns Array of message objects
   */
  static get(login: string): Readonly<TMMessage>[] {
    return this._messages.filter(a => a.login === login)
  }

  /**
   * @returns Array of message objects
   */
  static get messages(): Readonly<TMMessage>[] {
    return [...this._messages]
  }

  /**
   * @returns Array of command objects
   */
  static get commandList(): TMCommand[] {
    return [...this._commandList]
  }

}
