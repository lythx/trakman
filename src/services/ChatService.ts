import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../Client.js'
import { TRAKMAN as TM } from '../Trakman.js'

const messagesArraySize = 250

export abstract class ChatService {
  static readonly messages: TMMessage[] = []
  private static repo: ChatRepository

  static async initialize(repo: ChatRepository = new ChatRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static addCommand(command: TMCommand): void {
    const prefix = command.privilege === 0 ? '/' : '//'
    Events.addListener('Controller.PlayerChat', async (info: MessageInfo) => {
      const input = info.text?.trim()
      if (!command.aliases.some((alias: string) => input.split(' ').shift()?.toLowerCase() === (prefix + alias))) {
        return
      }
      if (info.privilege < command.privilege) {
        Client.callNoRes('ChatSendServerMessageToLogin', [{ string: `${TM.palette.server}»${TM.palette.error} You have no permission to use this command.` }, { string: info.login }])
        return
      }
      const [val, ...params] = input.split(' ').filter(a => a !== '')
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
              const unit = params[i].substring(params[i].length - 1).toLowerCase()
              const time = Number(params[i].substring(0, params[i].length - 1))
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
              if (command.params.length === command.params.findIndex(a => a.name === param.name) + 1) {
                const split = input.split(' ')
                let n = 0
                while (true) {
                  const chunk = split.shift()
                  if (params[n] === chunk) {
                    n++
                    if (n === i) {
                      parsedParams.push(split.join(' ').substring(1))
                      break
                    }
                  }
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
        nickName: info.nickName,
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
    const result = await this.repo.get(messagesArraySize)
    for (const m of result) {
      const message: TMMessage = {
        id: m.id,
        login: m.login,
        text: m.message,
        date: new Date(m.date)
      }
      this.messages.push(message)
    }
  }

  static async add(login: string, text: string): Promise<void> {
    const message: TMMessage = {
      id: randomUUID(),
      login,
      text,
      date: new Date()
    }
    this.messages.unshift(message)
    const player = PlayerService.players.find(a => a.login === login)
    if (player == null) { throw new Error(`Cannot find player ${login} in the memory`) }
    const messageInfo: MessageInfo = {
      id: message.id,
      login,
      text,
      nickName: player.nickName,
      nation: player.nation,
      nationCode: player.nationCode,
      wins: player.wins,
      timePlayed: player.timePlayed,
      joinTimestamp: player.joinTimestamp,
      privilege: player.privilege,
      isSpectator: player.isSpectator,
      playerId: player.playerId,
      ip: player.ip,
      region: player.region,
      isUnited: player.isUnited
    }
    Events.emitEvent('Controller.PlayerChat', messageInfo)
    this.messages.length = Math.min(messagesArraySize, this.messages.length)
    await this.repo.add(message)
  }

  static async getByLogin(login: string, limit: number): Promise<any[] | Error> {
    return await this.repo.getByLogin(login, limit)
  }
}
