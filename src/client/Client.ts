import { Events } from '../Events.js'
import { Logger } from '../Logger.js'
import { ClientRequest } from './ClientRequest.js'
import { ClientSocket } from './ClientSocket.js'

export abstract class Client {

  private static socket: ClientSocket = new ClientSocket()
  private static requestId: number = 0x80000000
  private static readonly proxies: { methods: readonly string[], callback: ((method: string, params: tm.CallParams[], response: any) => void) }[] = []
  private static host: string
  private static port: number

  static async connect(host = 'localhost', port = 5000): Promise<void> {
    if (port < 0 || port >= 65536 || isNaN(port)) {
      await Logger.fatal(`SERVER_PORT needs to be a number >= 0 and < 65536, received ${port}. Check your .env file`)
    }
    this.port = port
    this.host = host
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    this.socket.on('error', (error) => setTimeout(() => {
      Logger.error('Client socket error:', error.message)
      void this.handleError()
    }, 10000)) // 10 sec timeout before reconnect try
    const status = await this.socket.awaitHandshake()
    if (status instanceof Error) {
      await Logger.fatal('Connection to the dedicated server failed:', status.message)
    }
  }

  static async handleError() {
    this.socket.destroy()
    this.socket = new ClientSocket()
    this.socket.connect(this.port, this.host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    this.socket.on('error', (error) => setTimeout(() => {
      Logger.error('Client socket error:', error.message)
      void this.handleError()
    }, 10000))
    const status = await this.socket.awaitHandshake()
    if (status instanceof Error) {
      await Logger.fatal('Connection to the dedicated server failed:', status.message)
    }
    const mapInfo: tm.TrackmaniaMapInfo | Error = await this.call('GetCurrentChallengeInfo')
    if (mapInfo instanceof Error) {
      await Logger.fatal('Connection to the dedicated server failed:', mapInfo.message)
      return
    }
    Events.emit('TrackMania.BeginChallenge', [mapInfo, false, false])
  }

  /**
   * Calls a dedicated server method and awaits the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method, if method is system.multicall array of Call objects is expected instead
   * @returns Server response or error if the server returns one, if method is system.multicall array of responses is returned instead
   */
  static async call<T extends string>(method: T, params: T extends 'system.multicall' ? tm.Call[] : tm.CallParams[] = []):
    Promise<T extends 'system.multicall' ? ({ method: string, params: any } | Error)[] | Error : any | Error> {
    let callParams: tm.CallParams[] = params
    if (method === 'system.multicall') {
      const calls: tm.Call[] = params as any
      const arr: tm.CallParams[] = []
      for (const c of calls) {
        const params: tm.CallParams[] = c.params === undefined ? [] : c.params
        arr.push({
          struct: {
            methodName: { string: c.method },
            params: { array: params }
          }
        })
      }
      callParams = [{ array: arr }]
    }
    this.requestId++ // increment requestId so every request has an unique id
    const request: ClientRequest = new ClientRequest(method as string, callParams)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    const response: any | Error = await this.socket.awaitResponse(this.requestId, method as string).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method as string, callParams, response)
    }
    if (method !== 'system.multicall') { return response }
    if (response instanceof Error) { return response }
    const ret: ({ method: string, params: any } | Error)[] = []
    for (const [i, r] of response.entries()) {
      if (r.faultCode !== undefined) {
        ret.push(new Error(`Error in system.multicall in response for call ${(params[i] as tm.Call).method}: ${r?.faultString ?? ''} Code: ${r.faultCode}`))
      } else {
        ret.push({ method: (params[i] as tm.Call).method, params: r })
      }
    }
    return ret
  }

  /**
   * Calls a dedicated server method without caring for the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method
   */
  static callNoRes<T extends string>(method: T, params: T extends 'system.multicall' ? tm.Call[] : tm.CallParams[] = []): void {
    let callParams: tm.CallParams[] = params
    if (method === 'system.multicall') {
      const calls: tm.Call[] = params as any
      const arr: tm.CallParams[] = []
      for (const c of calls) {
        const params: tm.CallParams[] = c.params === undefined ? [] : c.params
        arr.push({
          struct: {
            methodName: { string: c.method },
            params: { array: params }
          }
        })
      }
      callParams = [{ array: arr }]
    }
    this.requestId++
    const request: ClientRequest = new ClientRequest(method, callParams)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    void this.getProxyResponse(method, callParams, this.requestId)
  }

  /**
 * Adds a callback listener which will be executed when one of the specified dedicated server methods gets called
 * @param methods Array of dedicated server methods
 * @param callback Callback to execute
 */
  static addProxy(methods: readonly string[], callback: ((method: string, params: tm.CallParams[], response: any) => void)): void {
    this.proxies.push({ methods, callback })
  }

  private static callProxies(method: string, params: tm.CallParams[], response: any): void {
    if (method === 'system.multicall') {
      const calls: ({ method: string, params: tm.CallParams[], response: any } | Error)[] = []
      for (const [i, r] of response.entries()) {
        if (r.faultCode === undefined) {
          calls.push({
            method: params[0]?.array?.[i]?.struct?.methodName?.string ?? '',
            params: params[0]?.array?.[i]?.struct?.params?.array ?? [], response: r
          })
        }
      }
      for (const call of calls) {
        if (!(call instanceof Error)) {
          for (const e of this.proxies.filter(a => a.methods.some(b => b === call.method))) {
            e.callback(call.method, call.params, call.response)
          }
        }
      }
      return
    }
    for (const e of this.proxies.filter(a => a.methods.some(b => b === method))) {
      e.callback(method, params, response)
    }
  }

  private static async getProxyResponse(method: string, params: tm.CallParams[], requestId: number): Promise<void> {
    const response: any | Error = await this.socket.awaitResponse(requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
  }

}
