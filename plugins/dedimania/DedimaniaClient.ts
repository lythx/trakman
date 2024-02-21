import { DedimaniaRequest } from './DedimaniaRequest.js'
import { DedimaniaResponse } from './DedimaniaResponse.js'
import { Socket } from 'node:net'
import 'dotenv/config'

export class DedimaniaClient {

  private socket = new Socket()
  private response: DedimaniaResponse = new DedimaniaResponse()
  private receivingResponse: boolean = false
  private sessionId: string = ''
  private _connected: boolean = false
  private password: string | undefined

  async connect(host: string, port: number): Promise<true | { error: Error, isAuthenticationError: boolean }> {
    if (process.env.DEDIMANIA_PASSWORD === undefined) {
      return {
        isAuthenticationError: true,
        error: new Error(`DEDIMANIA_PASSWORD is undefined. Check your .env file to use the plugin.`)
      }
    }
    this.password = process.env.DEDIMANIA_PASSWORD
    this.disconnect()
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.setupListeners()
    const packmask: string | Error = await tm.client.call('GetServerPackMask') as any
    if (packmask instanceof Error) {
      tm.log.error('Failed to fetch server packmask', packmask.message)
      return { error: packmask, isAuthenticationError: false }
    }
    const request: DedimaniaRequest = new DedimaniaRequest('dedimania.Authenticate', [{
      struct: {
        Game: { string: 'TMF' },
        Login: { string: tm.config.server.login },
        Password: { string: this.password },
        Tool: { string: 'Trakman' },
        Version: { string: tm.config.controller.version },
        Nation: { string: tm.utils.countryToCode(tm.config.server.zone.split('|')[0]) },
        Packmask: { string: packmask }
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
            resolve({
              error: new Error(`Dedimania server responded with an error ${this.response.errorString} Code: ${this.response.errorCode}`),
              isAuthenticationError: false
            })
          } else {
            if (this.response.sessionId === null) {
              resolve({
                error: new Error(`Dedimania server didn't send sessionId. Received: ${this.response.data}`),
                isAuthenticationError: false
              })
              return
            } else if (this.response.json[0] === false) {
              resolve({
                error: new Error(`Dedimania authentication failed`),
                isAuthenticationError: true
              })
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
          resolve({
            error: new Error('No response from dedimania server'),
            isAuthenticationError: false
          })
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  setupListeners(): void {
    this.socket.on('data', async buffer => {
      this.response.addData(buffer)
    })
    this.socket.on('error', async err => {
      tm.log.error('Dedimania socket error:', err.message)
      this._connected = false
    })
  }

  async call(method: string, params: tm.CallParams[] = []): Promise<any[] | Error> {
    while (this.receivingResponse) { await new Promise((resolve) => setTimeout(resolve, 2000)) }
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
            resolve(new Error(`Dedimania server responded with an error ${this.response.errorString} Code: ${this.response.errorCode}`))
          } else {
            resolve(this.response.json)
          }
          this.receivingResponse = false
          return
        }
        if (Date.now() - 10000 > startDate) { // stop polling after 10 seconds
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

  async disconnect() {
    this.receivingResponse = false
    this._connected = false
    this.response = new DedimaniaResponse()
    this.socket?.destroy()
    this.socket = new Socket()
  }

  get connected(): boolean {
    return this._connected
  }

}
