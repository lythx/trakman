import { Request } from './Request.js'
import { Socket } from './Socket.js'

export abstract class Client {
  private static readonly socket = new Socket()
  private static requestId = 0x80000000

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
    return await this.socket.awaitResponse(this.requestId, method).catch((err: Error) => err)
  }

  static callNoRes(method: string, params: object[] = []): void {
    this.requestId++
    const request = new Request(method, params)
    console.log(method)
    const buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
  }

}
