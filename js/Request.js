"use strict"
const logger = require('tracer').colorConsole();
class Request {

    #xml

    /**
    * Prepares XML string for a dedicated server request.
    * List of dedicated server methods: https://methods.xaseco.org/methodstmf.php
    * @param {String} method dedicated server method
    * @param {Object[]} params parameters, each param needs to be under key named after its type
    */
    constructor(method, params) {
        this.#xml = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`;
        for (const param of params)
            this.#xml += `<param><value>${this.#handleParamType(param)}</value></param>`
        this.#xml += `</params></methodCall>`
    }

    /**
    * Prepares and returns buffer from XML string
    * @returns {Buffer} buffer from XML string
    */
    getPreparedBuffer(requestId) {
        const bufferLength = Buffer.byteLength(this.#xml);
        const buffer = Buffer.alloc(8 + bufferLength);   //alloc 8 bonus bytes for target length and id
        buffer.writeUInt32LE(bufferLength, 0);           //write target length of request
        buffer.writeUInt32LE(requestId, 4);              //write id of request
        buffer.write(this.#xml, 8);                      //write buffer from XML
        return buffer
    }

    //wraps params with type tags depending on type specified in param object
    //calls itself recursively in case type is array or struct
    #handleParamType(param) {
        const type = Object.keys(param)[0]
        switch (Object.keys(param)[0]) {
            case 'boolean':
                return `<boolean>${param[type] ? '1' : '0'}</boolean>`
            case 'int':
                return `<int>${param[type]}</int>`
            case 'double':
                return `<double>${param[type]}</double>`
            case 'string':
                return `<string>${this.#escapeHtml(param[type])}</string>`
            case 'base64':
                return `<base64>${param[type]}</base64>`
            case 'array':
                let arr = '<array><data>'
                for (const el of param[type])
                    arr += `<value>${this.#handleParamType(el)}</value>`
                arr += '</data></array>'
                return arr
            case 'struct':
                let str = '<struct>'
                for (const key in param[type])
                    str += `<member><name>${key}</name><value>${this.#handleParamType(param[type][key])}</value></member>`
                str += '</struct>'
                return str
        }
    }

    //php's htmlspecialchars() js implementation
    //https://stackoverflow.com/questions/1787322/what-is-the-htmlspecialchars-equivalent-in-javascript
    #escapeHtml(str) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return str.replace(/[&<>"']/g, (m) => { return map[m]; });
    }
}

module.exports = Request