'use strict'
class Request {
  #xml

  /**
    * Prepares XML string for a dedicated server request.
    * Each object in params array needs to contain type and value parameters.
    * List of dedicated server methods: https://methods.xaseco.org/methodstmf.php
    * @param {String} method
    * @param {Object[]} params
    */
  constructor (method, params) {
    this.#xml = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`
    for (const param of params) { this.#xml += `<param><value>${this.#handleParamType(param)}</value></param>` }
    this.#xml += '</params></methodCall>'
  }

  /**
    * Prepares and returns buffer from XML string
    * @returns {Buffer} buffer from XML string
    */
  getPreparedBuffer (requestId) {
    const bufferLength = Buffer.byteLength(this.#xml)
    const buffer = Buffer.alloc(8 + bufferLength) // alloc 8 bonus bytes for target length and id
    buffer.writeUInt32LE(bufferLength, 0) // write target length of request
    buffer.writeUInt32LE(requestId, 4) // write id of request
    buffer.write(this.#xml, 8) // write buffer from XML
    return buffer
  }

  // wraps params with type tags depending on type specified in param object
  // calls itself recursively in case type is array or struct
  #handleParamType (arg) {
    switch (arg.type) {
      case 'boolean':
        return `<boolean>${arg.value ? '1' : '0'}</boolean>`
      case 'int':
        return `<int>${arg.value}</int>`
      case 'double':
        return `<double>${arg.value}</double>`
      case 'string':
        return `<string>${this.#escapeHtml(arg.value)}</string>`
      case 'base64':
        return `<base64>${arg.value}</base64>`
      case 'array': {
        let arr = '<array><data>'
        for (const el of arg.value) {
          arr += `<value>${this.#handleParamType(el)}</value>`
        }
        arr += '</data></array>'
        return arr
      }
      case 'struct': {
        let str = '<struct>'
        for (const key of arg.value) {
          str += `<member><name>${key}</name><value>${this.#handleParamType(arg.value[key])}</value></member>`
        }
        str += '</struct>'
        return str
      }
    }
  }

  // php's htmlspecialchars() js implementation
  // https://stackoverflow.com/questions/1787322/what-is-the-htmlspecialchars-equivalent-in-javascript
  #escapeHtml (str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return str.replace(/[&<>"']/g, (m) => { return map[m] })
  }
}

module.exports = Request
