import { Logger } from '../Logger.js'
import { ClientRequest } from './ClientRequest.js'
import { ClientSocket } from './ClientSocket.js'

export abstract class Client {

  private static readonly socket: ClientSocket = new ClientSocket()
  private static requestId: number = 0x80000000
  private static readonly proxies: { methods: string[], callback: ((method: string, params: TM.CallParams[], response: any[]) => void) }[] = []

  static async connect(host = 'localhost', port = 5000): Promise<void> {
    if (port < 0 || port >= 65536 || isNaN(port)) {
      await Logger.fatal(`SERVER_PORT needs to be a number >= 0 and < 65536, received ${port}. Check your .env file`)
    }
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    const status = await this.socket.awaitHandshake()
    if (status instanceof Error) {
      await Logger.fatal('Connection to the dedicated server failed:', status.message)
    }
  }

  /**
   * Calls a dedicated server method and awaits the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method
   * @returns Server response or error if the server returns one
   */
  static async call(method: string, params: TM.CallParams[] = []): Promise<any[] | Error> {
    this.requestId++ // increment requestId so every request has an unique id
    const request: ClientRequest = new ClientRequest(method, params)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    const response: any[] | Error = await this.socket.awaitResponse(this.requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
    return response
  }

  /**
   * Calls a dedicated server method without caring for the response
   * @param method Dedicated server method to be executed
   * @param params Optional params for the dedicated server method
   */
  static callNoRes(method: string, params: TM.CallParams[] = []): void {
    this.requestId++
    const request: ClientRequest = new ClientRequest(method, params)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    void this.getProxyResponse(method, params, this.requestId)
  }

  /**
 * Adds a callback listener which will be executed when one of the specified dedicated methods gets called
 * @param methods Array of dedicated server methods
 * @param callback Callback to execute
 */
  static addProxy(methods: string[], callback: ((method: string, params: TM.CallParams[], response: any[]) => void)): void {
    this.proxies.push({ methods, callback })
  }

  private static callProxies(method: string, params: TM.CallParams[], response: any[]): void {
    if (method === 'system.multicall') {
      const calls: ({ method: string, params: TM.CallParams[], response: any[] } | Error)[] = []
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

  private static async getProxyResponse(method: string, params: TM.CallParams[], requestId: number): Promise<void> {
    const response: any[] | Error = await this.socket.awaitResponse(requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
  }

}
