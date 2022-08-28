import { DedimaniaRequest } from './DedimaniaRequest.js'
import { DedimaniaResponse } from './DedimaniaResponse.js'
import { Socket } from 'node:net'
import { trakman as tm } from '../../src/Trakman.js'
import DediConfig from './Config.js'
import Config from '../../config.json' assert { type: 'json' }

export class DedimaniaClient {

  private socket = new Socket()
  private response = new DedimaniaResponse()
  private receivingResponse = false
  private sessionId = ''
  private _connected = false

  async connect(host: string, port: number): Promise<true | Error> {
    this.receivingResponse = false
    this._connected = false
    this.response = new DedimaniaResponse()
    this.socket?.destroy()
    this.socket = new Socket()
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.setupListeners()
    // TODO do this call in serverconfig maybe?
    const packmask: [string] | Error = await tm.client.call('GetServerPackMask') as any
    if (packmask instanceof Error) {
      tm.log.error('Failed to fetch server packmask', packmask.message)
      return packmask
    }
    const request: DedimaniaRequest = new DedimaniaRequest('dedimania.Authenticate', [{
      struct: {
        Game: { string: 'TMF' },
        Login: { string: tm.state.serverConfig.login },
        Password: { string: DediConfig.serverPassword },
        Tool: { string: 'Trakman' },
        Version: { string: Config.version },
        Nation: { string: tm.utils.countryToCode(tm.state.serverConfig.zone.split('|')[0]) },
        Packmask: { string: packmask[0] }
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
            tm.log.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else {
            if (this.response.sessionId === null) {
              tm.log.error(`Dedimania server didn't send sessionId`, `Received: ${this.response.data}`)
              resolve(new Error(`Dedimania server didn't send sessionId`))
              return
            } else if (this.response.json[0] === false) {
              tm.log.error(`Dedimania authentication failed`)
              resolve(new Error(`Dedimania authentication failed`))
              return
            }
            this.sessionId = this.response.sessionId
            this._connected = true
            resolve(true)
          }
          return
        }
        if (Date.now() - 10000 > startDate) { // stop polling after 10 seconds
          this.receivingResponse = false
          tm.log.error('No response from dedimania server')
          resolve(new Error('No response from dedimania server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  setupListeners(): void {
    this.socket.on('data', async buffer => {
      this.response.addData(buffer.toString())
    })
    this.socket.on('error', async err => {
      tm.log.error('Dedimania socket error:', err.message)
      this._connected = false
    })
  }

  async call(method: string, params: CallParams[] = []): Promise<any[] | Error> {
    while (this.receivingResponse === true) { await new Promise((resolve) => setTimeout(resolve, 2000)) }
    if (!this._connected) { return new Error('Not connected to dedimania') }
    this.receivingResponse = true
    const request: DedimaniaRequest = new DedimaniaRequest(method, params, this.sessionId)
    this.socket.write(request.buffer)
    this.response = new DedimaniaResponse()
    const startDate: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        if (this.response.status === 'completed') {
          if (this.response.isError === true) {
            tm.log.error('Dedimania server responded with an error',
              `${this.response.errorString} Code: ${this.response.errorCode}`)
            resolve(new Error(this.response.errorString?.toString()))
          } else {
            resolve(this.response.json)
          }
          this.receivingResponse = false
          return
        }
        if (Date.now() - 10000 > startDate) { // stop polling after 10 seconds
          tm.log.error('No response from dedimania server')
          this._connected = false
          this.receivingResponse = false
          resolve(new Error('No response from dedimania server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  get connected() {
    return this._connected
  }

}
