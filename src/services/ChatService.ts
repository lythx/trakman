'use strict'
import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Events } from '../Events.js'

const messagesArraySize = 250

export abstract class ChatService {
  static readonly messages: Message[] = []
  private static readonly repo = new ChatRepository()

  static async initialize (): Promise<void> {
    await this.repo.initialize()
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
