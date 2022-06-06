import { DedimaniaRequest } from './DedimaniaRequest.js'
import { DedimaniaResponse } from './DedimaniaResponse.js'
import net from 'node:net'
import 'dotenv/config'
import { ErrorHandler } from '../ErrorHandler.js'
import { PlayerService } from '../services/PlayerService.js'
import { ServerConfig } from '../ServerConfig.js'
import { JukeboxService } from '../services/JukeboxService.js'

export abstract class DedimaniaClient {
  private static readonly socket = new net.Socket()
  private static response: DedimaniaResponse
  private static receivingResponse: boolean = false
  private static sessionId: string

  static async connect(host: string, port: number): Promise<void> {
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.setupListeners()
    const cfg = ServerConfig.config
    const nextIds = []
    for (let i = 0; i < 5; i++) { nextIds.push(JukeboxService.queue[i].id) }
    const request = new DedimaniaRequest('system.multicall',
      [{
        array: [{
          struct: {
            methodName: { string: 'dedimania.Authenticate' },
            params: {
              array: [{
                struct: {
                  Game: { string: 'TMF' },
                  Login: { string: process.env.SERVER_LOGIN },
                  Password: { string: process.env.SERVER_PASSWORD },
                  Tool: { string: 'Trakman' },
                  Version: { string: '0.0.1' },
                  Nation: { string: process.env.SERVER_NATION },
                  Packmask: { string: process.env.SERVER_PACKMASK }
                }
              }]
            }
          }
        },
        {
          struct: {
            methodName: { string: 'dedimania.UpdateServerPlayers' },
            params: {
              array: [
                { string: 'TMF' },
                { int: PlayerService.players.length },
                {
                  struct: {
                    SrvName: { string: cfg.name },
                    Comment: { string: cfg.comment },
                    Private: { boolean: cfg.password === '' },
                    SrvIP: { string: 'lol' },
                    SrvPort: { string: 'lol2' },
                    XmlRpcPort: { string: 'lol3' },
                    NumPlayers: { int: PlayerService.players.filter(a => a.isSpectator).length },
                    MaxPlayers: { int: cfg.currentMaxPlayers },
                    NumSpecs: { int: PlayerService.players.filter(a => !a.isSpectator).length },
                    MaxSpecs: { int: cfg.currentMaxPlayers },
                    LadderMode: { int: cfg.currentLadderMode },
                    NextFiveUID: { string: nextIds.join('/') }
                  }
                },
                { array: [] }
              ]
            }
          }
        },
        {
          struct: {
            methodName: { string: 'dedimania.WarningsAndTTR' },
            params: { array: [] }
          }
        }]
      }])
    this.receivingResponse = true
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    return await new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(() => {
        if (this.response.status === 'completed') {
          if (this.response.isError != null) {
            ErrorHandler.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            reject(new Error(this.response.errorString?.toString()))
          } else {
            if (this.response.sessionId == null) {
              ErrorHandler.error('Dedimania server didn\'t send sessionId', `Received: ${this.response.data}`)
              reject(new Error('Dedimania server didn\'t send sessionId'))
              return
            }
            this.sessionId = this.response.sessionId
            resolve()
          }
          this.receivingResponse = false
          clearInterval(interval)
        }
        if (i === 20) {
          reject(new Error('No response from dedimania server'))
          clearInterval(interval)
        }
        i++
      }, 250)
    })
  }

  static setupListeners(): void {
    this.socket.on('data', buffer => {
      this.response.addData(buffer.toString())
    })
  }

  static async call(method: string, params: object[] = []): Promise<any[]> {
    while (this.receivingResponse) { await new Promise((resolve) => setTimeout(resolve, 300)) }
    this.receivingResponse = true
    const request = new DedimaniaRequest(method, params, this.sessionId)
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    return await new Promise((resolve, reject) => {
      let i = 0
      const interval = setInterval(() => {
        if (this.response.status === 'completed') {
          if (this.response.isError === true) {
            ErrorHandler.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            reject(new Error(this.response.errorString?.toString()))
          } else { resolve(this.response.json) }
          this.receivingResponse = false
          clearInterval(interval)
        }
        if (i === 60) {
          reject(new Error('No response from dedimania server'))
          clearInterval(interval)
        }
        i++
      }, 250)
    })
  }
}
