'use strict'
const xml2js = require('xml2js')
const logger = require('tracer').colorConsole()

class Response {
  #status = 'pending'
  #targetLength = null
  #id = null
  #data = Buffer.from('')
  #overload = null
  #json = null
  #isEvent = null
  #eventName = null

  /**
  * Initiates an object to store buffers received from dedicated server
  * @param {Number} targetLength first 4 bytes of response
  * @param {Number} id second 4 bytes of response
  */
  constructor (targetLength, id) {
    this.#targetLength = targetLength
    this.#id = id
  }

  /**
  * Concats new buffer with previous ones and sets status to completed if response reached its target length.
  * If response length is greater than target length (new data contains fragment of next response)
  * status is set to overloaded and next response buffer can be extracted using extractOverload() method
  * @param {Buffer} data buffer received from dedicated server
  */
  addData (data) {
    const newBuffer = Buffer.concat([this.#data, data])
    if (newBuffer.length > this.#targetLength) {
      this.#data = newBuffer.subarray(0, this.#targetLength)
      this.#overload = newBuffer.subarray(this.#targetLength)
      this.#status = 'overloaded'
      this.#generateJson()
      return
    }
    if (newBuffer.length === this.#targetLength) {
      this.#data = newBuffer.subarray(0, this.#targetLength)
      this.#status = 'completed'
      this.#generateJson()
      return
    }
    this.#data = newBuffer
  }

  /**
  * @returns {Number} response id
  */
  getId () {
    return this.#id
  }

  /**
  * @returns {String} response status
  */
  getStatus () {
    return this.#status
  }

  /**
  * Returns buffer fragment written after reaching target length (next response buffer)
  * and sets status to complete
  * @returns {Buffer} next response buffer
  */
  extractOverload () {
    const overload = this.#overload
    this.#overload = null
    this.#status = 'complete'
    return overload
  }

  /**
  * @returns {any[]} array created from server response
  */
  getJson () {
    if (this.#isEvent) {
      return this.#fixNesting(this.#json.methodCall)
    } else {
      return this.#fixNesting(this.#json.methodResponse)
    }
  }

  getEventName () {
    return this.#eventName
  }

  isEvent () {
    return this.#isEvent
  }

  #generateJson () {
    let json = []
    // parse xml to json
    xml2js.parseString(this.#data.toString(), (err, result) => {
      if (err) {
        throw err
      }
      json = result
    })

    if (json.methodCall) {
      this.#json = json
      this.#eventName = json.methodCall.methodName[0]
      this.#isEvent = true
    } else if (json.methodResponse) {
      this.#json = json
      this.#isEvent = false
    }
  }

  #fixNesting (obj) {
    const arr = []
    // if server responded with error
    if (obj.faultCode) {
      arr.push({
        faultCode: obj.fault[0].value[0].struct[0].member[0].value[0].int[0],
        faultString: obj.fault[0].value[0].struct[0].member[1].value[0].string[0]
      })
      return arr
    }
    const changeType = (value, type) => {
      switch (type) {
        case 'boolean':
          return value === '1'
        case 'int': case 'i4':
          return parseInt(value)
        case 'double':
          return parseFloat(value)
        case 'base64':
          return Buffer.from(value, 'base64')
        default:
          return value
      }
    }
    // change overnested object received from parsing the xml to an array of server return values
    if (!obj.params[0].param) {
      return [obj.params[0]] // some callbacks don't return params. NICE!!!!
    }
    for (const param of obj.params) {
      for (const p of param.param) { // some callbacks return multiple values instead of an array. NICE!!!!
        const value = p.value[0]
        if (Object.keys(value)[0] === 'array') {
          for (const el of value.array) {
            for (const val of el.data[0].value) {
              const type = Object.keys(val)[0]
              arr.push(changeType(val[type][0], type))
            }
          }
        } else if (Object.keys(value)[0] === 'struct') {
          const obj = {}
          for (const el of value.struct[0].member) {
            const key = el.name[0]
            const type = Object.keys(el.value[0])[0]
            obj[key] = changeType(el.value[0][type][0], type)
          }
          arr.push(obj)
        } else if (Object.keys(value)[0] === 'boolean') {
          arr.push(changeType(value.boolean[0], 'boolean'))
        } else if (Object.keys(value)[0] === 'int' || Object.keys(value)[0] === 'i4') {
          arr.push(changeType(value[Object.keys(value)[0]][0], Object.keys(value)[0]))
        } else if (Object.keys(value)[0] === 'double') {
          arr.push(changeType(value.float[0], 'double'))
        } else if (Object.keys(value)[0] === 'string') {
          arr.push(changeType(value.string[0], 'string'))
        } else if (Object.keys(value)[0] === 'base64') {
          arr.push(changeType(value.string[0], 'base64'))
        }
      }
    }
    return arr
  }
}

module.exports = Response
