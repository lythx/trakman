import { Logger } from '../Logger.js'
import xml2js from 'xml2js'

export class ClientResponse {

  private _status: 'pending' | 'overloaded' | 'completed' = 'pending'
  private readonly _targetLength: number
  private readonly _id: number
  private _data: Buffer = Buffer.from('')
  private _overload: Buffer | null = null
  private _json: any = null
  private _isEvent: boolean | null = null
  private _eventName: string = ''
  private _isError: boolean = false
  private _errorString: string = ''
  private _errorCode: number = 0

  /**
  * Initiates an object to store buffers received from dedicated server
  * @param targetLength first 4 bytes of response
  * @param id second 4 bytes of response
  */
  constructor(targetLength: number, id: number) {
    this._targetLength = targetLength
    this._id = id
  }

  /**
  * Concats new buffer with previous ones and sets status to completed if response reached its target length.
  * If response length is greater than target length (new data contains fragment of next response)
  * status is set to overloaded and next response buffer can be extracted using extractOverload() method
  * @param data buffer received from dedicated server
  */
  addData(data: Buffer): void {
    const newBuffer: Buffer = Buffer.concat([this._data, data])
    if (newBuffer.length > this._targetLength) {
      this._data = newBuffer.subarray(0, this._targetLength)
      this._overload = newBuffer.subarray(this._targetLength)
      this._status = 'overloaded'
      this.generateJson()
      return
    }
    if (newBuffer.length === this._targetLength) {
      this._data = newBuffer
      this._status = 'completed'
      this.generateJson()
      return
    }
    this._data = newBuffer
  }

  get id(): number {
    return this._id
  }

  get status(): "pending" | "overloaded" | "completed" {
    return this._status
  }

  get eventName(): string {
    return this._eventName
  }

  get isEvent(): boolean | null {
    return this._isEvent
  }

  get isError(): boolean {
    return this._isError
  }

  get errorString(): string {
    return this._errorString
  }

  get errorCode(): number {
    return this._errorCode
  }

  /**
   * @param method Optional method call
   * @returns Server response
   */
  json(method?: string): any {
    if (this._isEvent === true) {
      return this.fixNesting(this._json.methodCall)
    } else {
      return this.fixNesting(this._json.methodResponse, method === 'system.multicall')
    }
  }

  /**
  * Returns buffer fragment written after reaching target length (next response buffer)
  * and sets status to completed
  * @returns next response buffer
  */
  extractOverload(): Buffer {
    this._status = 'completed'
    if (this._overload === null) {
      Logger.error('Error in ClientResponse.extractOverload()', `Overload is null for response ${this._eventName}`)
      return Buffer.from('')
    }
    const overload: Buffer = this._overload
    this._overload = null
    return overload
  }

  private generateJson(): void {
    let json: any
    // parse xml to json
    xml2js.parseString(this._data.toString(), (err, result): void => {
      if (err !== null) {
        throw err
      }
      json = result
    })

    if (json?.methodCall !== undefined) {
      this._json = json
      this._eventName = json.methodCall.methodName[0]
      this._isEvent = true
    } else if (json.methodResponse !== undefined) {
      this._json = json
      this._isEvent = false
      // if server responded with error
      if (json.methodResponse.fault !== undefined) {
        this._isError = true
        this._errorCode = json.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int[0]
        this._errorString = json.methodResponse.fault[0].value[0].struct[0].member[1].value[0].string[0]
      }
    }
  }

  // i hate XML
  private fixNesting(obj: any, isMulticall?: boolean): any {
    const arr: any[] = []
    const parseType = (value: any, type: string): any => {
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
            obj[key] = parseType(val, t)
          }
          return obj
        case 'array':
          for (const el of value.data) {
            if (el.value === undefined) { continue } // NADEO SOMETIMES SENDS AN ARRAY WITH NO VALUES BECAUSE WHY THE FUCK NOT
            for (const e of el.value) {
              const t: string = Object.keys(e)[0]
              const val: any = e[t][0]
              arr.push(parseType(val, t))
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
    if (isMulticall === true) {
      const values = obj.params[0].param[0].value[0].array[0].data[0].value
      for (const value of values) {
        if (value.struct !== undefined) {
          arr.push(parseType(value.struct[0], 'struct'))
          continue
        }
        const element = value.array[0].data[0].value[0]
        const type = Object.keys(element)[0]
        arr.push(parseType(element[type][0], type))
      }
      return arr
    }
    for (const param of obj.params) {
      if (param.param.length === 1) {
        const element: any = param.param[0].value[0]
        const type = Object.keys(element)[0]
        return parseType(element[type][0], type)
      } else {
        for (const p of param.param) { // some callbacks return multiple values instead of an array. NICE!!!!
          const element: any = p.value[0]
          const type = Object.keys(element)[0]
          arr.push(parseType(element[type][0], type))
        }
      }
    }
    return arr
  }

}
