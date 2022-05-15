'use strict'

import { DedimaniaRequest } from "./DedimaniaRequest.js"
import { DedimaniaResponse } from "./DedimaniaResponse.js"
import net from "node:net"
import 'dotenv/config'
import { ErrorHandler } from "../ErrorHandler.js"

export abstract class DedimaniaClient {

    private static socket = new net.Socket()
    private static response: DedimaniaResponse
    private static receivingResponse: boolean = false

    static async connect(port: number, host: string): Promise<boolean> {
        this.socket.connect(port, host)
        this.socket.setKeepAlive(true)
        this.setupListeners()
        const request = new DedimaniaRequest('dedimania.Authenticate',
            [
                {
                    struct:
                    {
                        Game: { string: process.env.SERVER_GAME },
                        Login: { string: process.env.SERVER_LOGIN },
                        Password: { string: process.env.SERVER_PASSWORD },
                        Tool: { string: 'Trakman' },
                        Version: { string: '0.0.1' },
                        Nation: { string: process.env.SERVER_NATION },
                        Packmask: { string: process.env.SERVER_PACKMASK },
                        //  PlayersGame: { string: '1' } this was in xaseco request but the thing works without it so idk
                    }
                }
            ])
        this.receivingResponse = true
        this.socket.write(request.buffer)
        this.response = new DedimaniaResponse()
        return await new Promise((resolve, reject) => {
            let i = 0
            const interval = setInterval(() => {
                if (this.response.status === 'completed') {
                    if (this.response.isError) {
                        ErrorHandler.error(`Dedimania server responded with an error`,
                            `${this.response.errorString} Code: ${this.response.errorCode}`)
                        reject(new Error(this.response.errorString?.toString()))
                    }
                    else
                        resolve(true)
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
        while (this.receivingResponse)
            await new Promise((r) => setTimeout(r, 300))
        this.receivingResponse = true
        const request = new DedimaniaRequest(method, params)
        this.socket.write(request.buffer)
        this.response = new DedimaniaResponse()
        return new Promise((resolve, reject) => {
            let i = 0
            const interval = setInterval(() => {
                if (this.response.status === 'completed') {
                    if (this.response.isError) {
                        ErrorHandler.error(`Dedimania server responded with an error`,
                            `${this.response.errorString} Code: ${this.response.errorCode}`)
                        reject(new Error(this.response.errorString?.toString()))
                    }
                    else
                        resolve(this.response.json)
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