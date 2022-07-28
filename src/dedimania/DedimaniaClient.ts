import { DedimaniaRequest } from './DedimaniaRequest.js'
import { DedimaniaResponse } from './DedimaniaResponse.js'
import { Socket } from 'node:net'
import 'dotenv/config'
import { JukeboxService } from '../services/JukeboxService.js'
import { Logger } from '../Logger.js'
import Config from '../../config.json' assert { type: 'json' }

export abstract class DedimaniaClient {

  private static readonly socket: Socket = new Socket()
  private static response: DedimaniaResponse
  private static receivingResponse: boolean
  private static sessionId: string
  static connected: boolean
  private static host: string
  private static port: number

  static async connect(host: string, port: number): Promise<true | Error> {
    this.host = host
    this.port = port
    this.receivingResponse = false
    this.connected = false
    this.response = new DedimaniaResponse()
    this.socket?.destroy()
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.setupListeners()
    const nextIds: any[] = []
    for (let i: number = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    if (process.env.SERVER_NATION === undefined) { await Logger.fatal('SERVER_NATION is undefined. Check your .env file') }
    if (process.env.SERVER_PACKMASK === undefined) { await Logger.fatal('SERVER_PACKMASK is undefined. Check your .env file') }
    const request: DedimaniaRequest = new DedimaniaRequest('dedimania.Authenticate', [{
      struct: {
        Game: { string: 'TMF' },
        Login: { string: process.env.SERVER_LOGIN },
        Password: { string: process.env.SERVER_PASSWORD },
        Tool: { string: 'Trakman' },
        Version: { string: Config.version },
        Nation: { string: process.env.SERVER_NATION },
        Packmask: { string: process.env.SERVER_PACKMASK }
      }
    }])
    this.receivingResponse = true
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    const startDate: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        if (this.response.status === 'completed') {
          this.receivingResponse = false
          if (this.response.isError !== null) {
            Logger.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else {
            if (this.response.sessionId === null) {
              Logger.error(`Dedimania server didn't send sessionId`, `Received: ${this.response.data}`)
              resolve(new Error(`Dedimania server didn't send sessionId`))
              return
            }
            this.sessionId = this.response.sessionId
            this.connected = true
            resolve(true)
          }
          return
        }
        if (Date.now() - 10000 > startDate) { // stop polling after 10 seconds
          this.receivingResponse = false
          Logger.error('No response from dedimania server')
          resolve(new Error('No response from dedimania server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  static setupListeners(): void {
    this.socket.on('data', buffer => {
      this.response.addData(buffer.toString())
    })
    this.socket.on('error', async err => {
      Logger.error('Dedimania socket error:', err.message)
      // if (this.connected === false) { return }
      this.connected = false
      // Client.call('ChatSendServerMessage', [{ string: `${TM.palette.server}»» ${TM.palette.error}Failed to connect to Dedimania. Retrying...` }])
      // let status: true | Error
      // do {
      //   await new Promise((resolve) => setTimeout(resolve, 10000))
      //   status = await this.connect(this.host, this.port)
      // } while (status !== true)
      // Logger.info(`Reconnected to dedimania after socket error`)
      // Client.call('ChatSendServerMessage', [{ string: `${TM.palette.server}»» ${TM.palette.admin}Successfully re-established connection with Dedimania.` }])
    })
  }

  static async call(method: string, params: CallParams[] = []): Promise<any[] | Error> {
    while (this.receivingResponse === true) { await new Promise((resolve) => setTimeout(resolve, 2000)) }
    if (!this.connected) { return new Error('Not connected to dedimania') }
    this.receivingResponse = true
    const request: DedimaniaRequest = new DedimaniaRequest(method, params, this.sessionId)
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    const startDate: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        if (this.response.status === 'completed') {
          if (this.response.isError === true) {
            Logger.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else {
            resolve(this.response.json)
          }
          this.receivingResponse = false
          return
        }
        if (Date.now() - 10000 > startDate) { // stop polling after 10 seconds
          Logger.error('No response from dedimania server')
          this.connected = false
          this.receivingResponse = false
          resolve(new Error('No response from dedimania server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }
}
