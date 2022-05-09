'use strict'
const net = require('node:net')
const Response = require('./Response')
const logger = require('tracer').colorConsole()

class Socket extends net.Socket {
  handshakeHeaderSize = null
  handshakeHeader = null
  handshakeStatus = null
  response = null
  receivingResponse = false
  responses = []

  /*
    * Create a net socket object.
    *
  constructor () {
    super()
  }/*

  /**
    * Setup socket listeners for client - server communication
    */
  setupListeners () {
    this.on('data', buffer => {
      // handshake header has no id, so it has to be treated differently from normal data
      if (this.handshakeHeaderSize === null) {
        this.#setHandshakeHeaderSize(buffer)
      } else if (this.handshakeHeader === null) {
        this.#handleHandshake(buffer)
      } else if (!this.receivingResponse) { // all data except for the handshake
        this.#handleResponseStart(buffer)
      } else if (this.receivingResponse) {
        this.#handleResponseChunk(buffer)
      }
    })
  }

  /**
    * Poll handshake status
    * @returns {Promise<String>} handshake status
    */
  awaitHandshake () {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.handshakeStatus !== null) {
          resolve(this.handshakeStatus)
          clearInterval(interval)
        }
        resolve('no response')
      }, 300)
    })
  }

  /**
    * Poll dedicated server response
    * @returns {Promise<any[]>} array of server return values
    */
  awaitResponse (id) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.responses.some(a => a.getId() === id && a.getStatus() === 'completed')) {
          const response = this.responses.find(a => a.getId() === id && a.getStatus() === 'completed')
          this.responses.splice(this.responses.indexOf(response), 1)
          resolve(response.getJson())
          clearInterval(interval)
        }
      }, 300)
    })
  }

  #setHandshakeHeaderSize (buffer) {
    this.handshakeHeaderSize = buffer.readUIntLE(0, 4)
  }

  #handleHandshake (buffer) {
    this.handshakeHeader = buffer.toString()
    if (this.handshakeHeaderSize !== this.handshakeHeader.length || // check if protocol and header length is right
            this.handshakeHeader !== 'GBXRemote 2') {
      this.destroy()
      this.handshakeStatus = 'wrong protocol'
      return
    }
    this.handshakeStatus = 'handshake success'
  }

  // initiate a Response object with targetSize and Id
  #handleResponseStart (buffer) {
    this.response = new Response(buffer.readUInt32LE(0), buffer.readUInt32LE(4))
    this.receivingResponse = true
    if (buffer.subarray(8)) { this.#handleResponseChunk(buffer.subarray(8)) }
  }

  // add new buffer to response object
  #handleResponseChunk (buffer) {
    this.response.addData(buffer)
    if (this.response.getStatus() === 'overloaded') {
      const nextResponseBuffer = this.response.extractOverload()
      this.#handleResponseStart(nextResponseBuffer) // start new response if buffer was overloaded
      this.responses.push(this.response) // push completed response to responses array
    } else if (this.response.getStatus() === 'completed') {
      this.receivingResponse = false
      this.responses.push(this.response) // push completed response to responses array
    }
  }
}

module.exports = Socket
