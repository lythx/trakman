'use strict'
import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'

const messagesArraySize = 250

export abstract class ChatService {

  static readonly messages: Message[] = []
  private static repo = new ChatRepository()

  static async initialize(): Promise<void | Error> {
    const result = await this.repo.initialize2()
    if (result instanceof Error)
      return result
  }

  static async loadLastSessionMessages(): Promise<void | Error> {
    const result = await this.repo.get(messagesArraySize)
    if (result instanceof Error)
      return result
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

  static async add(login: string, text: string): Promise<void | Error> {
    const message: Message = {
      id: randomUUID(),
      login: login,
      text: text,
      date: new Date()
    }
    Events.emitEvent('Controller.PlayerChat', [{ id: message.id, login: message.login, text: message.text, date: message.date }])
    this.messages.unshift(message)
    this.messages.length = Math.min(messagesArraySize, this.messages.length)
    const result = await this.repo.add(message)
    if (result instanceof Error)
      return result
  }

  static async getByLogin(login: string, limit: number): Promise<any[] | Error> {
    const result = await this.repo.getByLogin(login, limit)
    return result
  }
}


