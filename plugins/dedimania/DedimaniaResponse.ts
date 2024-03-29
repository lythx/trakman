import xml2js from 'xml2js'
import zlib from 'zlib'

export class DedimaniaResponse {

  private _status: string = 'pending'
  private _data: Buffer = Buffer.from('')
  private _xml: string = ''
  private _isError: boolean | null = null
  private _errorCode: number | null = null
  private _errorString: string | null = null
  private _json: any = null
  private _sessionId: string | null = null

  addData(data: Buffer): void {
    this._data = Buffer.concat([this._data, data])
    const str: string = this._data.toString()
    const split: string[] = str.split('\n')
    const resLength: number = Number(split.find(a => a.startsWith('Content-Length'))?.split(' ')[1])
    const index: number = this._data.indexOf('\r\n\r\n')
    const content: Buffer = this._data.slice(index + 4)
    if (content.length === resLength) {
      for (const row of split) {
        if (row.includes('Set-Cookie: PHPSESSID=')) { this._sessionId = row.substring(22).split(';')[0] }
      }
      this._xml = zlib.gunzipSync(content).toString()
      this.generateJson()
      this._status = 'completed'
    }
  }

  get data(): string {
    return this._data.toString()
  }

  get json(): any[] {
    return this.fixNesting(this._json.methodResponse)
  }

  get status(): string {
    return this._status
  }

  get isError(): boolean | null {
    return this._isError
  }

  get errorCode(): number | null {
    return this._errorCode
  }

  get errorString(): string | null {
    return this._errorString
  }

  get sessionId(): string | null {
    return this._sessionId
  }

  private generateJson(): void {
    let json: any
    let isError: boolean = false
    // parse xml to json
    xml2js.parseString(this._xml.toString(), (err, result): void => {
      if (err != null) {
        this._isError = true
        this._errorCode = 1
        this._errorString = 'Received invalid XML'
        isError = true
        tm.log.error('Received invalid XML from dedimania server', err.message, err.stack)
        return
      }
      json = result
    })
    if (isError !== false) { return }
    if (json?.methodResponse?.params?.[0]?.param?.[0]?.value?.[0]?.array?.[0]?.data?.[0]?.value) { // system.multicall errors
      for (const e of json?.methodResponse?.params?.[0]?.param?.[0]?.value?.[0]?.array[0]?.data?.[0]?.value) {
        if (e?.struct?.[0]?.member?.[0]?.name?.[0] === 'faultCode') {
          this._isError = true
          this._errorCode = e?.struct?.[0]?.member?.[0]?.value?.[0]?.int?.[0]
          this._errorString = e?.struct?.[0]?.member?.[1]?.value?.[0]?.string?.[0]
          return
        }
      }
    }
    if (json.methodResponse.fault != null) {
      this._isError = true
      this._errorCode = json.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int[0]
      this._errorString = json.methodResponse.fault[0].value[0].struct[0].member[1].value[0].string[0]
      return
    }
    this._json = json
  }

  // i hate XML
  private fixNesting(obj: any): any[] {
    const arr: any[] = []
    const changeType: any = (value: any, type: string): any => {
      const arr: any[] = []
      const obj: any = {}
      switch (type) {
        case 'boolean':
          return value === '1'
        case 'int': case 'i4':
          return parseInt(value)
        case 'double':
          return parseFloat(value)
        case 'base64':
          return Buffer.from(value, 'base64')
        case 'struct':
          for (const el of value.member) {
            const key: any = el.name[0]
            const t: string = Object.keys(el.value[0])[0]
            const val: any = el.value[0][t][0]
            obj[key] = changeType(val, t)
          }
          return obj
        case 'array':
          for (const el of value.data) {
            if (el.value == null) { continue } // NADEO SOMETIMES SENDS AN ARRAY WITH NO VALUES BECAUSE WHY THE FUCK NOT
            if (el?.value?.[0] != null) { // dediman sends an array without telling you its an array
              for (const e of el.value) {
                const t: string = Object.keys(e)[0]
                const val: any = e[t][0]
                arr.push(changeType(val, t))
              }
            } else {
              const t: string = Object.keys(el.value[0])[0]
              const val: any = el.value[0][t][0]
              arr.push(changeType(val, t))
            }
          }
          return arr
        default:
          return value
      }
    }
    // change overnested object received from parsing the xml to an array of server return values
    if (obj?.params?.[0]?.param === undefined) {
      return [] // some callbacks don't return params. NICE!!!!
    }
    for (const param of obj.params) {
      for (const p of param.param) { // some callbacks return multiple values instead of an array. NICE!!!!
        const value: any = p.value[0]
        if (Object.keys(value)[0] === 'array') {
          for (const el of value.array) {
            if (el.data[0]?.value == null) { // some methods dont return value here too
              continue
            }
            for (const val of el.data[0].value) {
              const type: string = Object.keys(val)[0]
              arr.push(changeType(val[type][0], type))
            }
          }
        } else if (Object.keys(value)[0] === 'struct') {
          const obj: any = {}
          for (const el of value.struct[0].member) {
            const key: any = el.name[0]
            const type: string = Object.keys(el.value[0])[0]
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
