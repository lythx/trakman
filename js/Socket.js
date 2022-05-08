"use strict"
const net = require('node:net');
const Response = require('./Response')
const logger = require('tracer').colorConsole();

class Socket extends net.Socket {

    hanshakeHeaderSize = null
    handshakeHeader = null
    handshakeStatus = null
    response = null
    receivingResponse = false
    responses = []

    constructor() {
        super()
    }

    setupListeners() {
        this.on('data', buffer => {
            if (this.hanshakeHeaderSize === null)
                this.#setHandshakeHeaderSize(buffer)
            else if (this.handshakeHeader === null)
                this.#handleHandshake(buffer)
            else if (!this.receivingResponse)
                this.#handleResponseStart(buffer)
            else if (this.receivingResponse)
                this.#handleResponseChunk(buffer)
        })
    }

    awaitHandshake() {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.handshakeStatus !== null) {
                    resolve(this.handshakeStatus)
                    clearInterval(interval)
                }
            }, 300);
        })
    }

    awaitResponse(id) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (this.responses.some(a => a.getId() === id && a.getStatus() === 'completed')) {
                    const response = this.responses.find(a => a.getId() === id && a.getStatus() === 'completed')
                    this.responses.splice(this.responses.indexOf(response), 1)
                    resolve(response.getJson())
                    clearInterval(interval)
                }
            }, 300);
        })
    }

    #setHandshakeHeaderSize(buffer) {
        this.hanshakeHeaderSize = buffer.readUIntLE(0, 4);
    }

    #handleHandshake(buffer) {
        this.handshakeHeader = buffer.toString()
        if (this.hanshakeHeaderSize !== this.handshakeHeader.length
            || this.handshakeHeader !== "GBXRemote 2") {
            this.destroy();
            this.handshakeStatus = 'wrong protocol';
            return
        }
        this.handshakeStatus = 'handshake success'
    }

    #handleResponseStart(buffer) {
        this.response = new Response(buffer.readUInt32LE(0), buffer.readUInt32LE(4))
        this.receivingResponse = true
    }

    #handleResponseChunk(buffer) {
        this.response.addData(buffer)
        if (this.response.getStatus() === 'overloaded') {
            const nextResponseBuffer = this.response.extractOverload()
            this.#handleResponseStart(nextResponseBuffer.subarray(0, 8))
            this.#handleResponseChunk(nextResponseBuffer.subarray(8))
            this.responses.push(this.response)
        }
        else if (this.response.getStatus() === 'completed') {
            this.receivingResponse = false
            this.responses.push(this.response)
        }
    }

}

module.exports = Socket