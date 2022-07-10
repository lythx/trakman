import { Request } from './Request.js'
import { Socket } from './Socket.js'

interface CallParams {
  string?: string
  int?: number,
  double?: number,
  boolean?: boolean,
  struct?: any,
  base64?: string,
  array?: CallParams[]
}

export abstract class Client {

  private static readonly socket: Socket = new Socket()
  private static requestId: number = 0x80000000
  private static readonly proxies: { methods: string[], callback: Function }[] = []

  static async connect(host = 'localhost', port = 5000): Promise<string> {
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    return await this.socket.awaitHandshake().catch(async err => await Promise.reject(err))
  }

  static async call(method: string, params: CallParams[] = []): Promise<any[] | Error> {
    this.requestId++ // increment requestId so every request has an unique id
    const request: Request = new Request(method, params)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    const response: any[] | Error = await this.socket.awaitResponse(this.requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
    return response
  }

  static callNoRes(method: string, params: object[] = []): void {
    this.requestId++
    const request: Request = new Request(method, params)
    const buffer: Buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    void this.getProxyResponse(method, params, this.requestId)
  }

  static addProxy(methods: string[], callback: Function): void {
    this.proxies.push({ methods, callback })
  }

  private static callProxies(method: string, params: any[], response: any[]): void {
    for (const e of this.proxies.filter(a => a.methods.some(b => b === method))) {
      e.callback(method, params, response)
    }
  }

  private static async getProxyResponse(method: string, params: any[], requestId: number): Promise<void> {
    const response: any[] | Error = await this.socket.awaitResponse(requestId, method).catch((err: Error) => err)
    if (!(response instanceof Error)) {
      this.callProxies(method, params, response)
    }
  }

}
