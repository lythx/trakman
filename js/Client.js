"use strict"
const Request = require("./Request")
const Socket = require("./Socket")
const utils = require("./Utils")

class Client {

    socket = new Socket()
    requestId = 0x80000000;
    response = ''
    awaitingResponse

    /**
    * Connects to dedicated server and waits for handshake.
    * Rejects promise if connection is failed or server doesnt use "GBXRemote 2" protocol
    * @param {String} host ip of dedicated server (default localhost)
    * @param {Number} port port at which dedicated server is listning for XmlRpc (default 5000)
    * @returns {Promise<String>} handshake status
    */
    async connect(host = 'localhost', port = 5000) {
        return new Promise(async (resolve, reject) => {
            this.socket.connect(port, host)
            this.socket.setKeepAlive(true)
            this.socket.setupListeners()
            const handshakeStatus = await this.socket.awaitHandshake()
            if (handshakeStatus === 'wrong protocol')
                reject(handshakeStatus)
            else if (handshakeStatus === 'handshake success')
                resolve(handshakeStatus)
        })
    }

    /**
    * Calls a dedicated server method.
    * @param {String} method dedicated server method name
    * @param {Object[]} params parameters, each one of objects has to contain type and value parameters
    * @param {boolean} expectsResponse if set to false doesnt poll the response and returns null.
    * @returns {Promise<any[]>} array of server response values
    */
    async call(method, params = [], expectsResponse = true) {
        this.requestId++                                    //increment requestId so every request has an unique id
        const request = new Request(method, params)
        const buffer = request.getPreparedBuffer(this.requestId)
        this.socket.write(buffer);
        if (!expectsResponse)
            return null
        const response = await this.socket.awaitResponse(this.requestId);
        return response
    }
}

module.exports = Client