'use strict'
import Request from './Request.js'
import Socket from './Socket.js'

class Client {
  static socket = new Socket()
  static requestId = 0x80000000
  static response = ''
  static awaitingResponse

  /**
  * Connects to dedicated server and waits for handshake.
  * Rejects promise if connection is failed or server doesn't use "GBXRemote 2" protocol
  * @param {String} host ip of dedicated server (default localhost)
  * @param {Number} port port at which dedicated server is listening for XmlRpc (default 5000)
  * @returns {Promise<String>} handshake status
  */
  static async connect(host = 'localhost', port = 5000) {
    this.socket.connect(port, host)
    this.socket.setKeepAlive(true)
    this.socket.setupListeners()
    const handshakeStatus = await this.socket.awaitHandshake()
    return new Promise((resolve, reject) => {
      if (handshakeStatus === 'No response from the server' || handshakeStatus === 'Server uses wrong GBX protocol') {
        reject(handshakeStatus)
      } else if (handshakeStatus === 'Handshake success') {
        resolve(handshakeStatus)
      }
    })
  }

  /**
  * Calls a dedicated server method. Check if returnvalue[0].faultCode exists to handle errors.
  * Error string is returnvalue[0].faultString.
  * @param {String} method dedicated server method name
  * @param {Object[]} params parameters, each param needs to be under key named after its type
  * @param {boolean} expectsResponse if set to false doesnt poll the response and returns null.
  * @returns {Promise<any[]>} array of server response values
  */
  static async call(method, params = [], expectsResponse = true) {
    this.requestId++ // increment requestId so every request has an unique id
    const request = new Request(method, params)
    const buffer = request.getPreparedBuffer(this.requestId)
    this.socket.write(buffer)
    if (!expectsResponse) { return null }
    return await this.socket.awaitResponse(this.requestId)
  }
}

export default Client
