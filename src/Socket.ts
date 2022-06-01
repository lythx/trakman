'use strict'

import net from 'node:net'
import { Response } from './Response.js'
import { Events } from './Events.js'
import { ErrorHandler } from './ErrorHandler.js'

export class Socket extends net.Socket {
  private handshakeHeaderSize: number = 0
  private handshakeHeader: string = ''
  private handshakeStatus: string = ''
  private response: Response | null = null
  private receivingResponse = false
  private responses: Response[] = []
  private incompleteHeader: Buffer | null = null

  /**
  * Setup socket listeners for client - server communication
  */
  setupListeners(): void {
    this.on('data', buffer => {
      // handshake header has no id so it has to be treated differently from normal data
      if (this.handshakeHeaderSize === 0) {
        this.setHandshakeHeaderSize(buffer)
      } else if (this.handshakeHeader === '') {
        this.handleHandshake(buffer)
      } else if (!this.receivingResponse) { // all data except for the handshake
        this.handleResponseStart(buffer)
      } else if (this.receivingResponse) {
        this.handleResponseChunk(buffer)
      }
    })
    this.on('error', err => ErrorHandler.fatal('Socket error:', err.message))
  }

  /**
  * Poll handshake status
  * @returns {Promise<String>} handshake status
  */
  async awaitHandshake(): Promise<string> {
    const startTimestamp = Date.now()
    return await new Promise((resolve, reject) => {
      const poll = () => {
        if (this.handshakeStatus === 'Handshake success') {
          resolve(this.handshakeStatus)
          return
        } else if (this.handshakeStatus === 'Server uses wrong GBX protocol') {
          reject(new Error(this.handshakeStatus))
          return
        } else if (Date.now() - startTimestamp > 5000) {
          reject(new Error('No response from the server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  /**
  * Poll dedicated server response
  * @returns {Promise<any[]>} array of server return values
  */
  async awaitResponse(id: number, method: string): Promise<any[]> {
    const startTimestamp = Date.now()
    return await new Promise((resolve, reject) => {
      const poll = () => {
        if (this.responses.some(a => a.id === id && a.status === 'completed')) {
          const response = this.responses.find(a => a.id === id && a.status === 'completed')
          if (response === undefined) {
            reject(new Error('Response id: ' + id.toString() + ' not found in responses list.'))
            return
          }
          if (response.isError) {
            reject(new Error(`${response.errorString} Code: ${response.errorCode}`))
            return
          }
          resolve(response.json)
          return
        } else if (Date.now() - startTimestamp > 15000) {
          reject(new Error(`No server response for call ${method}`))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  private setHandshakeHeaderSize(buffer: Buffer): void {
    if (buffer.length < 4) { ErrorHandler.fatal('Failed to read handshake header', `Received header: ${buffer.toString()}`, 'Buffer length too small') }
    this.handshakeHeaderSize = buffer.readUIntLE(0, 4)
  }

  private handleHandshake(buffer: Buffer): void {
    this.handshakeHeader = buffer.toString()
    if (this.handshakeHeaderSize !== this.handshakeHeader.length || // check if protocol and header length is right
      this.handshakeHeader !== 'GBXRemote 2') {
      this.destroy()
      this.handshakeStatus = 'Server uses wrong GBX protocol'
      return
    }
    this.handshakeStatus = 'Handshake success'
  }

  // initiate a Response object with targetSize and Id
  private handleResponseStart(buffer: Buffer): void {
    this.responses.length = Math.min(this.responses.length, 20)
    if (buffer.length < 8) { // rarely buffer header will get split between two data chunks
      this.incompleteHeader = buffer
      return
    }
    if (this.incompleteHeader != null) { // concating header if it got split
      buffer = Buffer.concat([this.incompleteHeader, buffer])
      this.incompleteHeader = null
    }
    this.response = new Response(buffer.readUInt32LE(0), buffer.readUInt32LE(4))
    this.receivingResponse = true
    if (buffer.subarray(8) != null) { this.handleResponseChunk(buffer.subarray(8)) }
  }

  // add new buffer to response object
  private handleResponseChunk(buffer: Buffer): void {
    if (this.response === null) {
      ErrorHandler.error('Response non-existant while calling handleResponseChunk.', 'This method should not have been called.')
      return
    }
    this.response.addData(buffer)
    if (this.response.status === 'overloaded') {
      const nextResponseBuffer = this.response.extractOverload()
      if (nextResponseBuffer == null) {
        ErrorHandler.error('Next response buffer is null.', '')
        return
      }
      if (this.response.isEvent) {
        Events.emitEvent(this.response.eventName, this.response.json)
      } else {
        this.responses.unshift(this.response) // put completed response at the start of responses array
      }
      this.handleResponseStart(nextResponseBuffer) // start new response if buffer was overloaded
    } else if (this.response.status === 'completed') {
      if (this.response.isEvent) {
        Events.emitEvent(this.response.eventName, this.response.json)
      } else {
        this.responses.unshift(this.response) // put completed response at the start of responses array
      }
      this.receivingResponse = false
    }
  }
}
