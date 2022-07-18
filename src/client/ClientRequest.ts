export class ClientRequest {

  private readonly xml: string

  /**
  * Prepares XML string for a dedicated server request.
  * List of dedicated server methods: https://methods.xaseco.org/methodstmf.php
  */
  constructor(method: string, params: CallParams[]) {
    this.xml = `<?xml version="1.0" encoding="utf-8" ?><methodCall><methodName>${method}</methodName><params>`
    for (const param of params) {
      const str = this.handleParamType(param)
      if (str instanceof Error) { throw str }
      this.xml += `<param><value>${str}</value></param>`
    }
    this.xml += '</params></methodCall>'
  }

  /**
  * Prepares and returns buffer from XML string
  */
  getPreparedBuffer(requestId: number): Buffer {
    const bufferLength: number = Buffer.byteLength(this.xml)
    const buffer: Buffer = Buffer.alloc(8 + bufferLength) // alloc 8 bonus bytes for target length and id
    buffer.writeUInt32LE(bufferLength, 0) // write target length of request
    buffer.writeUInt32LE(requestId, 4) // write id of request
    buffer.write(this.xml, 8) // write buffer from XML
    return buffer
  }

  /**
   * Wraps params with type tags depending on type specified in param object,
   * calls itself recursively in case type is array or struct
   */
  private handleParamType(param: CallParams): string | Error {
    type Keys = keyof typeof param
    const type: Keys = Object.keys(param)[0] as Keys
    const value = param[type]
    if (value === undefined) {
      return new Error(`Received undefined while creating dedicated server XML request, expected ${type}.`)
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

  // php's htmlspecialchars() js implementation
  // https://stackoverflow.com/questions/1787322/what-is-the-htmlspecialchars-equivalent-in-javascript
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
