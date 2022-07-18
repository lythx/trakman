import net from 'node:net'
import { ClientResponse } from './ClientResponse.js'
import { Events } from '../Events.js'
import { Logger } from '../Logger.js'

export class ClientSocket extends net.Socket {

  private handshakeHeaderSize: number = 0
  private handshakeHeader: string = ''
  private handshakeStatus: null | true | Error = null
  private response: ClientResponse | null = null
  private receivingResponse: boolean = false
  private readonly responses: ClientResponse[] = []
  private incompleteHeader: Buffer | null = null

  /**
  * Setup socket listeners for client - server communication
  */
  setupListeners(): void {
    this.on('data', (buffer: Buffer): void => {
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
    this.on('error', (err: Error): void => void Logger.fatal('Client socket error:', err.message))
  }

  /**
  * Poll handshake status
  */
  async awaitHandshake(): Promise<true | Error> {
    const startTimestamp: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        if (this.handshakeStatus !== null) {
          resolve(this.handshakeStatus)
          return
        }
        if (Date.now() - startTimestamp > 5000) {
          resolve(new Error('No response from the server'))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  /**
  * Poll dedicated server response
  * @returns array of values returned by server or error
  */
  async awaitResponse(id: number, method: string): Promise<any[] | Error> {
    const startTimestamp: number = Date.now()
    return await new Promise((resolve): void => {
      const poll = (): void => {
        const response: ClientResponse | undefined = this.responses.find(a => a.id === id && a.status === 'completed')
        if (response !== undefined) {
          if (response.isError === true) {
            resolve(new Error(`${response.errorString} Code: ${response.errorCode}`))
            return
          }
          resolve(response.json)
          return
        } 
        if (Date.now() - startTimestamp > 15000) {
          resolve(new Error(`No server response for call ${method}`))
          return
        }
        setImmediate(poll)
      }
      setImmediate(poll)
    })
  }

  private setHandshakeHeaderSize(buffer: Buffer): void {
    if (buffer.length < 4) { this.handshakeStatus = new Error(`Failed to read handshake header. Received header: ${buffer.toString()}. Buffer length too small`) }
    this.handshakeHeaderSize = buffer.readUIntLE(0, 4)
  }

  private handleHandshake(buffer: Buffer): void {
    this.handshakeHeader = buffer.toString()
    if (this.handshakeHeaderSize !== this.handshakeHeader.length || // check if protocol and header length is right
      this.handshakeHeader !== 'GBXRemote 2') {
      this.destroy()
      this.handshakeStatus = new Error('Server uses wrong GBX protocol')
      return
    }
    this.handshakeStatus = true
  }

  /** 
   * Initiates a Response object with targetSize and id
   */
  private handleResponseStart(buffer: Buffer): void {
    this.responses.length = Math.min(this.responses.length, 20) // trim responses array so it doesn't grow inifinitely
    if (buffer.length < 8) { // rarely buffer header will get split between two data chunks
      this.response = null
      this.receivingResponse = false
      this.incompleteHeader = buffer
      return
    }
    if (this.incompleteHeader !== null) { // concating header if it got split
      buffer = Buffer.concat([this.incompleteHeader, buffer])
      this.incompleteHeader = null
    }
    this.response = new ClientResponse(buffer.readUInt32LE(0), buffer.readUInt32LE(4))
    this.receivingResponse = true
    this.handleResponseChunk(buffer.subarray(8))
  }

  /**
   * Adds data to response object and handles response end
   */
  private handleResponseChunk(buffer: Buffer): void {
    if (this.response === null) { return }
    this.response.addData(buffer)
    if (this.response.status === 'overloaded') {
      const nextResponseBuffer: Buffer = this.response.extractOverload()
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
