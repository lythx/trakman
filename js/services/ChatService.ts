'use strict'
import { ChatRepository } from '../database/ChatRepository.js'
import { randomUUID } from 'crypto'
import { Logger } from '../Logger.js'

class ChatService {

  static readonly messages = []
  private static repo = new ChatRepository()

  static async initialize() {
    await this.repo.initialize()
  }

  static async loadLastSessionMessages() {
    const messageList = await this.repo.get(250) //or more/less
    if (messageList?.rows)
      for (const m of messageList) {
        const message = new Message(m.login, m.text)
        message.id = m.id
        message.timestamp = m.timestamp
        this.messages.push(message)
      }
  }

  /**
   * add the message to runtime memory and database 
   * @returns {Promise<void>}
   */
  async add(login, text) {
    const message = new Message(login, text)
    this.#messages.unshift(message)
    this.#messages.length = Math.min(500, this.#messages.length)
    await this.#repo.add(message)
  }

  get messages() {
    return this.#messages
  }
}

export class Message {

  id
  #login
  #text
  timestamp

  constructor(login, text) {
    this.#id = randomUUID()
    this.#login = login
    this.#text = text
    this.#timestamp = Date.now()
  }

  get login() {
    return this.#login
  }

  get text() {
    return this.#text
  }
}

export default ChatService
