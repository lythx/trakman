import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../client/Client.js'
import { TRAKMAN as TM } from '../Trakman.js'
import { Logger } from '../Logger.js'
import CONFIG from '../../config.json' assert { type: 'json' }

export abstract class ChatService {

  private static readonly messagesArraySize = CONFIG.messagesInRuntimeMemory
  static readonly messages: TMMessage[] = []
  private static readonly repo: ChatRepository = new ChatRepository()
  private static readonly _commandList: TMCommand[] = []

  static async initialize(): Promise<void> {
    await this.repo.initialize()
    await this.loadLastSessionMessages()
  }

  static addCommand(command: TMCommand): void {
    const prefix: string = command.privilege === 0 ? '/' : '//'
    this._commandList.push(command)
    this._commandList.sort((a, b): number => a.aliases[0].localeCompare(b.aliases[0]))
    Events.addListener('Controller.PlayerChat', async (info: MessageInfo): Promise<void> => {
      const input: string = info.text?.trim()
      const usedAlias = input.split(' ').shift()?.toLowerCase()
      if (!command.aliases.some((alias: string): boolean => usedAlias === (prefix + alias))) {
        return
      }
      if (info.privilege < command.privilege) {
        Client.callNoRes('ChatSendServerMessageToLogin', [{ string: `${TM.palette.server}»${TM.palette.error} You have no permission to use this command.` }, { string: info.login }])
        return
      }
      const [val, ...params] = input.split(' ').filter(a => a !== '')
      Logger.info(`${info.login} used command ${usedAlias}${params.length === 0 ? '' : ` with params ${params.join(', ')}`}`)
      const parsedParams: (string | number | boolean | undefined)[] = []
      if (command.params) {
        for (const [i, param] of command.params.entries()) {
          if (params[i] === undefined && param.optional === true) { continue }
          if (params[i] === undefined && param.optional === undefined) {
            TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Required param ${param.name} not specified.`, info.login)
            return
          }
          if (params[i].toLowerCase() === '$u' && param.optional === undefined) { parsedParams.push(undefined) }
          switch (param.type) {
            case 'int':
              if (!Number.isInteger(Number(params[i]))) {
                TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Provided wrong argument type for parameter <${param.name}>: int.`, info.login)
                return
              }
              parsedParams.push(Number(params[i]))
              break
            case 'double':
              if (isNaN(Number(params[i]))) {
                TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Provided wrong argument type for parameter <${param.name}>: double.`, info.login)
                return
              }
              parsedParams.push(Number(params[i]))
              break
            case 'boolean':
              if (!['true', 'yes', 'y', '1', 'false', 'no', 'n', '0'].includes(params[i].toLowerCase())) {
                TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Provided wrong argument type for parameter <${param.name}>: boolean.`, info.login)
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
                TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Provided wrong argument type for time parameter <${param.name}>: time.`, info.login)
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
                  TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Provided wrong argument type for time <${param.name}>: time.`, info.login)
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
        id: info.id,
        login: info.login,
        text: input.split(' ').splice(1).join(' '),
        nickname: info.nickname,
        nation: info.nation,
        nationCode: info.nationCode,
        wins: info.wins,
        timePlayed: info.timePlayed,
        joinTimestamp: info.joinTimestamp,
        privilege: info.privilege,
        isSpectator: info.isSpectator,
        playerId: info.playerId,
        ip: info.ip,
        region: info.region,
        isUnited: info.isUnited
      }
      command.callback(messageInfo, ...parsedParams)
    })
  }

  static async loadLastSessionMessages(): Promise<void> {
    const result: ChatDBEntry[] = await this.repo.get(this.messagesArraySize)
    for (const m of result) {
      const message: TMMessage = {
        id: m.id,
        login: m.login,
        text: m.message,
        date: m.date
      }
      this.messages.push(message)
    }
  }

  static add(login: string, text: string): MessageInfo | Error {
    const message: TMMessage = {
      id: randomUUID(),
      login,
      text,
      date: new Date()
    }
    const player: TMPlayer | undefined = PlayerService.players.find(a => a.login === login)
    if (player === undefined) {
      const errStr = `Error while adding message. Cannot find player ${login} in the memory`
      Logger.error(errStr)
      return new Error(errStr)
    }
    const messageInfo: MessageInfo = {
      id: message.id,
      login,
      text,
      nickname: player.nickname,
      nation: player.nation,
      nationCode: player.nationCode,
      wins: player.wins,
      timePlayed: player.timePlayed,
      joinTimestamp: player.joinTimestamp,
      privilege: player.privilege,
      isSpectator: player.isSpectator,
      playerId: player.id,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited
    }
    if (text?.[0] !== '/') { // I dont trim here cuz if u put space in front of slash the message gets displayed
      this.messages.unshift(message)
      void this.repo.add(message)
      Logger.trace(`${player.login} sent message: ${text}`)
    }
    this.messages.length = Math.min(this.messagesArraySize, this.messages.length)
    return messageInfo
  }

  static async getByLogin(login: string, limit: number): Promise<ChatDBEntry[]> {
    return await this.repo.getByLogin(login, limit)
  }

  static get commandList(): TMCommand[] {
    return [...this._commandList]
  }

}
