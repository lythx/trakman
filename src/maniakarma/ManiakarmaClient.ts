

import { ManiakarmaRequest } from './ManiakarmaRequest.js'
import net from 'node:net'
import 'dotenv/config'

export abstract class ManiakarmaClient {
    private static readonly socket = new net.Socket()
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
       // const request = new ManiakarmaRequest()
    }
}
