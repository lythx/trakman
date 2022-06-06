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
        Client.callNoRes('ChatSendServerMessageToLogin', [{ string: `${TM.colours.yellow}»${TM.colours.red} You have no permission to use this command.` }, { string: info.login }])
        return
      }
      const text = input.split(' ').splice(1).join(' ')
      const messageInfo: MessageInfo = {
        id: info.id,
        login: info.login,
        text,
        nickName: info.nickName,
        nation: info.nation,
        nationCode: info.nationCode,
        wins: info.wins,
        timePlayed: info.timePlayed,
        joinTimestamp: info.joinTimestamp,
        privilege: info.privilege
      }
      command.callback(messageInfo)
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
      privilege: player.privilege
    }
    Events.emitEvent('Controller.PlayerChat', messageInfo)
    this.messages.length = Math.min(messagesArraySize, this.messages.length)
    await this.repo.add(message)
  }

  static async getByLogin(login: string, limit: number): Promise<any[] | Error> {
    return await this.repo.getByLogin(login, limit)
  }
}
