'use strict'

export class DedimaniaRequest {
  readonly buffer = Buffer.from(
    'POST /Dedimania HTTP/1.1\r\n' +
    'Host: dedimania.net\r\n' +
    'User-Agent: XMLaccess\r\n' +
    'Cache-Control: no-cache\r\n' +
    'Accept-Encoding: text\r\n' +
    'Content-type: text/xml; charset=UTF-8\r\n'
  )

  /**
  * Prepares XML string for a dedimania request.
  * @param {String} method dedimania method
  * @param {Object[]} params parameters, each param needs to be under key named after its type
   * @param {string} sessionKey
  */
  constructor(method: string, params: object[], sessionKey?: string) {
    let xml = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`
    for (const param of params) {
      xml += `<param><value>${this.handleParamType(param)}</value></param>`
    }
    xml += '</params></methodCall>'
    const xmlBuffer = Buffer.from(xml)
    if (sessionKey === undefined) {
      this.buffer = Buffer.concat([
        this.buffer,
        Buffer.from(`Content-length: ${xmlBuffer.length}\r\nKeep-Alive: timeout=600, max=2000\r\nConnection: Keep-Alive\r\n\r\n`),
        xmlBuffer
      ])
    } else {
      this.buffer = Buffer.concat([
        this.buffer,
        Buffer.from(`Content-length: ${xmlBuffer.length}\r\nKeep-Alive: timeout=600, max=2000\r\nConnection: Keep-Alive\r\nCookie: PHPSESSID=${sessionKey}\r\n\r\n`),
        xmlBuffer
      ])
    }
  }

  private handleParamType(param: any): any {
    const type = Object.keys(param)[0]
    switch (Object.keys(param)[0]) {
      case 'boolean':
        return `<boolean>${param[type] === true ? '1' : '0'}</boolean>`
      case 'int':
        return `<int>${param[type]}</int>`
      case 'double':
        return `<double>${param[type]}</double>`
      case 'string':
        return `<string>${this.escapeHtml(param[type])}</string>`
      case 'base64':
        return `<base64>${param[type]}</base64>`
      case 'array': {
        let arr = '<array><data>'
        for (const el of param[type]) {
          arr += `<value>${this.handleParamType(el)}</value>`
        }
        arr += '</data></array>'
        return arr
      }
      case 'struct': {
        let str = '<struct>'
        for (const key in param[type]) {
          str += `<member><name>${key}</name><value>${this.handleParamType(param[type][key])}</value></member>`
        }
        str += '</struct>'
        return str
      }
    }
  }

  private escapeHtml(str: string): string {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }
    return str.replace(/[&<>"']/g, (m) => { return map[m as keyof typeof map] })
  }
}
