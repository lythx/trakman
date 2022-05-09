"use strict"
const Request = require("./Request")
const Socket = require("./Socket")
const utils = require("./Utils")

class Client {

    socket = new Socket()
    requestId = 0x80000000;
    response = ''
    awaitingResponse

    async connect(host, port) {
        return new Promise(async (resolve, reject) => {
            this.socket.connect(port || 5000, host || 'localhost')
            this.socket.setKeepAlive(true)
            this.socket.setupListeners()
            let handshakeStatus = await this.socket.awaitHandshake()
            if (handshakeStatus === 'no response')
                reject(handshakeStatus)
            else if (handshakeStatus === 'wrong protocol')
                reject(handshakeStatus)
            else if (handshakeStatus === 'handshake success')
                resolve(handshakeStatus)
        })
    }

    async call(method, params = [], expectsResponse = true) {
        const request = new Request(method, params)
        const xml = request.getXml()
        this.requestId++
        const bufferLength = Buffer.byteLength(xml);
        const buffer = Buffer.alloc(8 + bufferLength);
        buffer.writeUInt32LE(bufferLength, 0);
        buffer.writeUInt32LE(this.requestId, 4);
        buffer.write(xml, 8);
        this.socket.write(buffer);
        if (!expectsResponse)
            return
        const response = await this.socket.awaitResponse(this.requestId);
        return response
    }
}

module.exports = Client