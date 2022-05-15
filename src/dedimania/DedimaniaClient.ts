'use strict'

import { DedimaniaRequest } from "./DedimaniaRequest.js"
import net from "node:net"

export abstract class DedimaniaClient {

    private static socket = new net.Socket()

    static connect(port: number, host: string) {
        this.socket.connect(port, host)
        this.socket.setKeepAlive(true)
        this.setupListeners()
        const request = new DedimaniaRequest('dedimania.Authenticate',
            [
                {
                    struct:
                    {
                        Game: { string: 'TMF' },
                        Login: { string: 'glost_serv_1' },
                        Password: { string: '211997' },
                        Tool: { string: 'Trakman' },
                        Version: { string: '0.0.1' },
                        Nation: { string: 'FRA' },
                        Packmask: { string: 'Stadium' },
                        PlayersGame: { string: '1' }
                    }
                }
            ])
        console.log(request.buffer.toString())
        this.socket.write(request.buffer)
    }

    static setupListeners(): void {
        this.socket.on('data', buffer => {
            console.log(buffer.toString())
        })
    }
}