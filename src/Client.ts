import { Request } from './Request.js'
import { Socket } from './Socket.js'

export abstract class Client {

  private static readonly socket = new Socket()
  private static requestId = 0x80000000
  private static readonly proxies: { methods: string[], callback: Function }[] = []

  static async connect(host = 'localhost', port = 5000): Promise<string> {
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    return await this.socket.awaitHandshake().catch(async err => await Promise.reject(err))
  }

  static async call(method: string, params: object[] = []): Promise<any[] | Error> {
    this.requestId++ // increment requestId so every request has an unique id
    const request = new Request(method, params)
    const buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    const response = await this.socket.awaitResponse(this.requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
    return response
  }

  static callNoRes(method: string, params: object[] = []): void {
    this.requestId++
    const request = new Request(method, params)
    const buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    void this.getProxyResponse(method, params, this.requestId)
  }

  static addProxy(methods: string[], callback: Function) {
    this.proxies.push({ methods, callback })
  }

  private static callProxies(method: string, params: any[], response: any[]) {
    for (const e of this.proxies.filter(a => a.methods.some(b => b === method))) {
      e.callback(method, params, response)
    }
  }

  private static async getProxyResponse(method: string, params: any[], requestId: number) {
    const response = await this.socket.awaitResponse(requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
  }

}
