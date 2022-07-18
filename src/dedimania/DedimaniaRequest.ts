export class DedimaniaRequest {
  readonly buffer: Buffer = Buffer.from(
    'POST /Dedimania HTTP/1.1\r\n' +
    'Host: dedimania.net\r\n' +
    'User-Agent: XMLaccess\r\n' +
    'Cache-Control: no-cache\r\n' +
    'Accept-Encoding: text\r\n' +
    'Content-type: text/xml; charset=UTF-8\r\n'
  )

  /**
  * Prepares XML string for a dedimania request.
  * @param method dedimania method
  * @param params parameters
  * @param sessionKey 
  */
  constructor(method: string, params: CallParams[], sessionKey?: string) {
    let xml: string = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`
    for (const param of params) {
      const str = this.handleParamType(param)
      if (str instanceof Error) { throw str }
      xml += `<param><value>${str}</value></param>`
    }
    xml += '</params></methodCall>'
    const xmlBuffer: Buffer = Buffer.from(xml)
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

  private handleParamType(param: CallParams): string | Error {
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
          return new Error(`Received ${type} instead of string while creating XML request.`)
        }
        return `<string>${this.escapeHtml(value)}</string>`
      case 'base64':
        return `<base64>${value}</base64>`
      case 'array': {
        if (!Array.isArray(value)) {
          return new Error(`Received ${type} instead of array while creating XML request.`)
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
          return new Error(`Received ${type} instead of object while creating XML request.`)
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
}
