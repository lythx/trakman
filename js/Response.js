'use strict'
const xml2js = require('xml2js');
const logger = require('tracer').colorConsole();

class Response {

    #status = 'pending'
    #targetLength = null
    #id = null
    #data = Buffer.from('')
    #overload = null

    constructor(targetLength, id) {
        this.#targetLength = targetLength
        this.#id = id
    }

    addData(data) {
        const newBuffer = Buffer.concat([this.#data, data])
        if (newBuffer.length > this.#targetLength) {
            this.#data = newBuffer.subarray(0, this.#targetLength)
            this.#overload = newBuffer.subarray(this.#targetLength)
            this.#status = 'overloaded'
            return
        }
        if (newBuffer.length === this.#targetLength) {
            this.#data = newBuffer.subarray(0, this.#targetLength)
            this.#status = 'completed'
            return
        }
        this.#data = newBuffer
    }

    getId() {
        return this.#id
    }

    getStatus() {
        return this.#status
    }

    extractOverload() {
        const overload = this.#overload
        this.#overload = null
        this.#status = 'complete'
        return overload
    }

    getJson() {
        const changeType = (value, type) => {
            switch (type) {
                case 'boolean':
                    return value === '1' ? true : false
                case 'int': case 'i4':
                    return parseInt(value)
                case 'double':
                    return parseFloat(value)
                default:
                    return value
            }
        }
        let json = []
        xml2js.parseString(this.#data.toString(), (err, result) => {
            if (err) {
                throw err;
            }
            json = result
        });
        let arr = []
        if (json.methodResponse.fault) {
            arr.push({
                faultCode: json.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int[0],
                faultString: json.methodResponse.fault[0].value[0].struct[0].member[1].value[0].string[0]
            })
            return arr
        }
        for (const param of json.methodResponse.params) {
            const value = param.param[0].value[0]
            if (Object.keys(value)[0] === 'array') {
                for (const el of value.array) {
                    for (const val of el.data[0].value) {
                        const type = Object.keys(val)[0]
                        arr.push(changeType(val[type][0], type))
                    }
                }
            }
            else if (Object.keys(value)[0] === 'struct') {
                let obj = {}
                for (const el of value.struct[0].member) {
                    const key = el.name[0]
                    const type = Object.keys(el.value[0])[0]
                    obj[key] = changeType(el.value[0][type][0], type)
                }

                arr.push(obj)
            }
            else if (Object.keys(value)[0] === 'boolean')
                arr.push(changeType(value.boolean[0], 'boolean'))
            else if (Object.keys(value)[0] === 'int' || Object.keys(value)[0] === 'i4')
                arr.push(changeType(value.int[0], 'int'))
            else if (Object.keys(value)[0] === 'double')
                arr.push(changeType(value.float[0], 'double'))
            else if (Object.keys(value)[0] === 'string')
                arr.push(changeType(value.string[0], 'string'))
        }
        return arr
    }
}

module.exports = Response