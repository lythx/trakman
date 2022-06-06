import xml2js from 'xml2js'

export class DedimaniaResponse {
  private _status: string = 'pending'
  private _data: string = ''
  private _xml: string = ''
  private _isError: boolean | null = null
  private _errorCode: number | null = null
  private _errorString: number | null = null
  private _json: any = null
  private _sessionId: string | null = null

  addData(data: string): void {
    this._data += data
    const split = this._data.split('\n')
    if (split[split.length - 1] === '</methodResponse>' && split[0] === 'HTTP/1.1 200 OK\r') {
      for (const row of split) {
        if (row.includes('Set-Cookie: PHPSESSID=')) { this._sessionId = row.substring(22).split(';')[0] }
      }
      this._status = 'completed'
      this._xml = this._data.split('\r\n\r\n')[1]
      this.generateJson()
    }
  }

  get data(): string {
    return this._data
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

  get errorString(): number | null {
    return this._errorString
  }

  get sessionId(): string | null {
    return this._sessionId
  }

  private generateJson(): void {
    let json: any
    // parse xml to json
    xml2js.parseString(this._xml.toString(), (err, result) => {
      if (err != null) {
        throw err
      }
      json = result
    })
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
    const arr = []
    const changeType: any = (value: any, type: string) => {
      const arr = []
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
            const key = el.name[0]
            const t = Object.keys(el.value[0])[0]
            const val = el.value[0][t][0]
            obj[key] = changeType(val, t)
          }
          return obj
        case 'array':
          for (const el of value.data) {
            if (el.value == null) { continue } // NADEO SOMETIMES SENDS AN ARRAY WITH NO VALUES BECAUSE WHY THE FUCK NOT
            if (el?.value?.[0] != null) { // dediman sends an array without telling you its an array
              for (const e of el.value) {
                const t = Object.keys(e)[0]
                const val = e[t][0]
                arr.push(changeType(val, t))
              }
            } else {
              const t = Object.keys(el.value[0])[0]
              const val = el.value[0][t][0]
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
        const value = p.value[0]
        if (Object.keys(value)[0] === 'array') {
          for (const el of value.array) {
            if (el.data[0]?.value == null) { // some methods dont return value here too
              continue
            }
            for (const val of el.data[0].value) {
              const type = Object.keys(val)[0]
              arr.push(changeType(val[type][0], type))
            }
          }
        } else if (Object.keys(value)[0] === 'struct') {
          const obj: any = {}
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
