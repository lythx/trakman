import { ClientRequest } from './ClientRequest.js'
import { ClientSocket } from './ClientSocket.js'

export abstract class Client {

  private static readonly socket: ClientSocket = new ClientSocket()
  private static requestId: number = 0x80000000
  private static readonly proxies: { methods: string[], callback: ((method: string, params: CallParams[], response: any[]) => void) }[] = []

  static async connect(host = 'localhost', port = 5000): Promise<true | Error> {
    if (port < 0 || port >= 65536 || isNaN(port)) {
      return new Error(`SERVER_PORT needs to be a number >= 0 and < 65536, received ${port}. Check your .env file`)
    }
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    return await this.socket.awaitHandshake()
  }

  static async call(method: string, params: CallParams[] = []): Promise<any[] | Error> {
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

  static callNoRes(method: string, params: CallParams[] = []): void {
    this.requestId++
    const request: ClientRequest = new ClientRequest(method, params)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    void this.getProxyResponse(method, params, this.requestId)
  }

  static addProxy(methods: string[], callback: ((method: string, params: CallParams[], response: any[]) => void)): void {
    this.proxies.push({ methods, callback })
  }

  private static callProxies(method: string, params: CallParams[], response: any[]): void {
    for (const e of this.proxies.filter(a => a.methods.some(b => b === method))) {
      e.callback(method, params, response)
    }
  }

  private static async getProxyResponse(method: string, params: CallParams[], requestId: number): Promise<void> {
    const response: any[] | Error = await this.socket.awaitResponse(requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
  }

}
