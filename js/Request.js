"use strict"
class Request {

    xml

    constructor(method, params) {
        this.xml = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`;
        for (const param of params)
            this.xml += `<param><value>${this.#handleParamType(param)}</value></param>`
        this.xml += `</params></methodCall>`
    }

    getXml() {
        return this.xml
    }

    #handleParamType(arg) {
        if (arg.type === 'boolean')
            return `<boolean>${arg.value ? '1' : '0'}</boolean>`
        if (arg.type === 'int')
            return `<int>${parseInt(arg.value)}</int>`
        if (arg.type === 'double')
            return `<double>${parseFloat(arg.value)}</double>`
        if (arg.type === 'string')
            return `<string>${this.#escapeHtml(arg.value)}</string>`
        if (arg.type === 'array') {
            let str = '<array><data>'
            for (const el of arg.value)
                str += `<value>${this.#handleParamType(el)}</value>`
            str += '</data></array>'
            return str
        }
        if (arg.type === 'struct') {
            let str = '<struct>'
            for (const key of arg.value)
                str += `<member><name>${key}</name><value>${this.#handleParamType(arg.value[key])}</value></member>`
            str += '</struct>'
            return str
        }
    }

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