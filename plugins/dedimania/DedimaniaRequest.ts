import zlib from 'node:zlib'

export class DedimaniaRequest {

  private sessionKey?: string
  private xmlBuffer: Buffer
  private _buffer: Buffer = Buffer.from(
    'POST /Dedimania HTTP/1.1\r\n' +
    'Host: dedimania.net\r\n' +
    'User-Agent: XMLaccess\r\n' +
    'Cache-Control: no-cache\r\n' +
    'Accept-Encoding: gzip\n' +
    'Content-Encoding: gzip\r\n' +
    'Content-type: text/xml; charset=UTF-8\r\n'
  )

  /**
  * Prepares XML string for a dedimania request.
  * @param method dedimania method
  * @param params parameters
  * @param sessionKey 
  */
  constructor(method: string, params: tm.CallParams[], sessionKey?: string) {
    let xml: string = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`
    for (const param of params) {
      const str: string | Error = this.handleParamType(param)
      if (str instanceof Error) { throw str }
      xml += `<param><value>${str}</value></param>`
    }
    xml += '</params></methodCall>'
    this.xmlBuffer = Buffer.from(xml)
    this.sessionKey = sessionKey
    const gzip = zlib.gzipSync(this.xmlBuffer)
    if (this.sessionKey === undefined) {
      this._buffer = Buffer.concat([
        this._buffer,
        Buffer.from(`Content-length: ${gzip.length}\r\nKeep-Alive: timeout=600, max=2000\r\nConnection: Keep-Alive\r\n\r\n`),
        gzip
      ])
    } else {
      this._buffer = Buffer.concat([
        this._buffer,
        Buffer.from(`Content-length: ${gzip.length}\r\nKeep-Alive: timeout=600, max=2000\r\nConnection: Keep-Alive\r\nCookie: PHPSESSID=${this.sessionKey}\r\n\r\n`),
        gzip
      ])
    }
  }

  private handleParamType(param: tm.CallParams): string | Error {
    type Keys = keyof typeof param
    const type: Keys = Object.keys(param)[0] as Keys
    const value = param[type]
    if (value === undefined) {
      return new Error(`Received undefined while creating dedimania XML request, expected ${type}.`)
    }
    switch (type) {
      case 'boolean':
        return `<boolean>${value === true ? '1' : '0'}</boolean>`
      case 'int':
        return `<int>${value}</int>`
      case 'double':
        return `<double>${value}</double>`
      case 'string':
        if (typeof value !== 'string') {
          return new Error(`Received ${typeof value} instead of string while creating XML request.`)
        }
        return `<string>${this.escapeHtml(value)}</string>`
      case 'base64':
        return `<base64>${value}</base64>`
      case 'array': {
        if (!Array.isArray(value)) {
          return new Error(`Received ${typeof value} instead of array while creating XML request.`)
        }
        let arr: string = '<array><data>'
        for (const el of value) {
          arr += `<value>${this.handleParamType(el)}</value>`
        }
        arr += '</data></array>'
        return arr
      }
      case 'struct': {
        if (typeof value !== 'object' || Array.isArray(value) || value === null) {
          return new Error(`Received ${typeof value} instead of object while creating XML request.`)
        }
        let str: string = '<struct>'
        for (const key in value as any) {
          str += `<member><name>${key}</name><value>${this.handleParamType(value[key])}</value></member>`
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
    return str.replace(/[&<>"']/g, (m): string => { return map[m as keyof typeof map] })
  }

  get buffer(): Buffer {
    return this._buffer
  }

}
