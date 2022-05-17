'use strict'
import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'
import { PlayerService } from './PlayerService.js'
import { Client } from '../Client.js'

const messagesArraySize = 250

export abstract class ChatService {
  static readonly messages: Message[] = []
  private static repo: ChatRepository

  static async initialize (repo: ChatRepository = new ChatRepository()): Promise<void> {
    this.repo = repo
    await this.repo.initialize()
  }

  static async addCommand (command: Command): Promise<void> {
    let prefix = '/'
    if (command.privilege !== 0) {
      prefix += '/'
    }
    Events.addListener('Controller.PlayerChat', async (params: any[]) => {
      const input = params?.[0]?.text?.trim()?.toLowerCase()
      if (!command.aliases.some((alias: string) => input.split(' ').shift() === (prefix + alias))) {
        return
      }
      const player = PlayerService.players.find(a => a.login === params[0].login)
      if (!player)
        throw new Error(`Cannot find player ${params[0].login} in the memory`)
      if (player.privilege < command.privilege) {
        Client.call("ChatSendServerMessageToLogin",
          [{ string: '$f00You have no privileges to use this command' },
          { string: player.login }])
        return
      }
      const text = input.split(' ').splice(1).join(" ");
      const messageInfo: MessageInfo = {
        login: params[0].login,
        text,
        privilege: command.privilege,
        nickName: player.nickName,
        nation: player.nation,
        nationCode: player.nationCode,
        wins: player.wins,
        timePlayed: player.timePlayed,
        joinTimestamp: player.joinTimestamp
      }
      command.callback(messageInfo)
    })
  }

  static async loadLastSessionMessages (): Promise<void> {
    const result = await this.repo.get(messagesArraySize)
    if (result instanceof Error) { throw result }
    for (const m of result) {
      const message: Message = {
        id: m.id,
        login: m.login,
        text: m.message,
        date: new Date(m.date)
      }
      this.messages.push(message)
    }
  }

  static async add (login: string, text: string): Promise<void> {
    const message: Message = {
      id: randomUUID(),
      login,
      text,
      date: new Date()
    }
    Events.emitEvent('Controller.PlayerChat', [{ id: message.id, login: message.login, text: message.text, date: message.date }])
    this.messages.unshift(message)
    this.messages.length = Math.min(messagesArraySize, this.messages.length)
    const result = await this.repo.add(message)
    if (result instanceof Error) { throw result }
  }

  static async getByLogin (login: string, limit: number): Promise<any[] | Error> {
    return await this.repo.getByLogin(login, limit)
  }
}
