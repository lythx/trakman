import { DedimaniaRequest } from './DedimaniaRequest.js'
import { DedimaniaResponse } from './DedimaniaResponse.js'
import { Socket } from 'node:net'
import 'dotenv/config'
import { ErrorHandler } from '../ErrorHandler.js'
import { ServerConfig } from '../ServerConfig.js'
import { JukeboxService } from '../services/JukeboxService.js'
import { Client } from '../Client.js'
import { Logger } from '../Logger.js'
import { TRAKMAN as TM } from '../Trakman.js'

export abstract class DedimaniaClient {

  private static readonly socket: Socket = new Socket()
  private static response: DedimaniaResponse
  private static receivingResponse: boolean
  private static sessionId: string
  private static connected: boolean
  private static host: string
  private static port: number
  private static tryingToReconnect: boolean

  static async connect(host: string, port: number): Promise<void | Error> {
    this.host = host
    this.port = port
    this.receivingResponse = false
    this.connected = false
    this.socket?.destroy()
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.setupListeners()
    const cfg: ServerInfo = ServerConfig.config
    const nextIds: any[] = []
    for (let i: number = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const request: DedimaniaRequest = new DedimaniaRequest('dedimania.Authenticate', [{
      struct: {
        Game: { string: 'TMF' },
        Login: { string: process.env.SERVER_LOGIN },
        Password: { string: process.env.SERVER_PASSWORD },
        Tool: { string: 'Trakman' },
        Version: { string: '0.0.1' },
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
            ErrorHandler.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else {
            if (this.response.sessionId === null) {
              ErrorHandler.error(`Dedimania server didn't send sessionId`, `Received: ${this.response.data}`)
              resolve(new Error(`Dedimania server didn't send sessionId`))
              return
            }
            this.sessionId = this.response.sessionId
            this.connected = true
            resolve()
          }
          return
        }
        if (Date.now() - 15000 > startDate) { // stop polling after 15 seconds
          this.receivingResponse = false
          ErrorHandler.error('No response from dedimania server')
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
      ErrorHandler.error('Dedimania socket error:', err.message)
      if (this.tryingToReconnect === true) { return }
      this.tryingToReconnect = true
      this.connected = false
      Client.call('ChatSendServerMessage', [{ string: `${TM.palette.server}»» ${TM.palette.error}Failed to connect to Dedimania. Retrying...` }])
      let status
      do {
        await new Promise((resolve) => setTimeout(resolve, 10000))
        status = await this.connect(this.host, this.port)
      } while (status instanceof Error)
      this.tryingToReconnect = false
      Logger.info(`Reconnected to dedimania after socket error`)
      Client.call('ChatSendServerMessage', [{ string: `${TM.palette.server}»» ${TM.palette.admin}Successfully re-established connection with Dedimania.` }])
    })
  }

  static async call(method: string, params: CallParams[] = []): Promise<any[] | Error> {
    if (!this.connected) { return new Error('Not connected to dedimania') }
    // TODO: ensure that if theres 2 responses awaiting (basically never but ye) they get executed in good order
    while (this.receivingResponse === true) { await new Promise((resolve) => setTimeout(resolve, 2000)) } // cba just changed to 2 seconds so they dont overlap doesnt matter anyway
    this.receivingResponse = true
    const request: DedimaniaRequest = new DedimaniaRequest(method, params, this.sessionId)
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    const startDate: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        if (this.response.status === 'completed') {
          if (this.response.isError === true) {
            ErrorHandler.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else { resolve(this.response.json) }
          this.receivingResponse = false
          return
        }
        if (Date.now() - 15000 > startDate) { // stop polling after 15 seconds
          ErrorHandler.error('No response from dedimania server')
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
