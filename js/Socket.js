'use strict'
import net from 'node:net'
import Response from './Response.js'
import Events from './Events.js'

class Socket extends net.Socket {
  #handshakeHeaderSize = null
  #handshakeHeader = null
  #handshakeStatus = null
  #response = null
  #receivingResponse = false
  #responses = []
  #incompleteHeader = null

  /**
  * Setup socket listeners for client - server communication
  */
  setupListeners () {
    this.on('data', buffer => {
      // handshake header has no id so it has to be treated differently from normal data
      if (this.#handshakeHeaderSize === null) {
        this.#setHandshakeHeaderSize(buffer)
      } else if (this.#handshakeHeader === null) {
        this.#handleHandshake(buffer)
      } else if (!this.#receivingResponse) { // all data except for the handshake
        this.#handleResponseStart(buffer)
      } else if (this.#receivingResponse) {
        this.#handleResponseChunk(buffer)
      }
    })
  }

  /**
  * Poll handshake status
  * @returns {Promise<String>} handshake status
  */
  awaitHandshake () {
    let i = 0
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        i++
        if (this.#handshakeStatus !== null) {
          resolve(this.#handshakeStatus)
          clearInterval(interval)
        } else if (i === 20) { // stop poll after 5 seconds
          resolve('No response from the server')
          clearInterval(interval)
        }
      }, 250)
    })
  }

  /**
  * Poll dedicated server response
  * @returns {Promise<any[]>} array of server return values
  */
  awaitResponse (id) {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.#responses.some(a => a.id === id && a.status === 'completed')) {
          const response = this.#responses.find(a => a.id === id && a.status === 'completed')
          resolve(response.getJson())
          clearInterval(interval)
        }
      }, 300)
    })
  }

  #setHandshakeHeaderSize (buffer) {
    this.#handshakeHeaderSize = buffer.readUIntLE(0, 4)
  }

  #handleHandshake (buffer) {
    this.#handshakeHeader = buffer.toString()
    if (this.#handshakeHeaderSize !== this.#handshakeHeader.length || // check if protocol and header length is right
      this.#handshakeHeader !== 'GBXRemote 2') {
      this.destroy()
      this.#handshakeStatus = 'Server uses wrong GBX protocol'
      return
    }
    this.#handshakeStatus = 'Handshake success'
  }

  // initiate a Response object with targetSize and Id
  #handleResponseStart (buffer) {
    this.#responses.length = Math.min(this.#responses.length, 20)
    if (buffer.length < 8) { // rarely buffer header will get split between two data chunks
      this.#incompleteHeader = buffer
      return
    }
    if (this.#incompleteHeader) { // concating header if it got split
      buffer = Buffer.concat([this.#incompleteHeader, buffer])
      this.#incompleteHeader = null
    }
    this.#response = new Response(buffer.readUInt32LE(0), buffer.readUInt32LE(4))
    this.#receivingResponse = true
    if (buffer.subarray(8)) { this.#handleResponseChunk(buffer.subarray(8)) }
  }

  // add new buffer to response object
  #handleResponseChunk (buffer) {
    this.#response.addData(buffer)
    if (this.#response.status === 'overloaded') {
      const nextResponseBuffer = this.#response.extractOverload()
      if (this.#response.isEvent) {
        Events.handleEvent(this.#response.eventName, this.#response.getJson())
      } else {
        this.#responses.unshift(this.#response)
      } // put completed response at the start of responses array
      this.#handleResponseStart(nextResponseBuffer) // start new response if buffer was overloaded
    } else if (this.#response.status === 'completed') {
      if (this.#response.isEvent) {
        Events.handleEvent(this.#response.eventName, this.#response.getJson())
      } else {
        this.#responses.unshift(this.#response)
      } // put completed response at the start of responses array
      this.#receivingResponse = false
    }
  }
}

export default Socket
