import xml2js from 'xml2js'
import { ErrorHandler } from './ErrorHandler.js'

export class Response {
  private _status: string = 'pending'
  private readonly _targetLength: number
  private readonly _id: number
  private _data: Buffer = Buffer.from('')
  private _overload: Buffer | null = null
  private _json: any = null
  private _isEvent: boolean = false
  private _eventName: string = ''
  private _isError: boolean = false
  private _errorString: string = ''
  private _errorCode: number = 0

  /**
  * Initiates an object to store buffers received from dedicated server
  * @param {Number} targetLength first 4 bytes of response
  * @param {Number} id second 4 bytes of response
  */
  constructor(targetLength: number, id: number) {
    this._targetLength = targetLength
    this._id = id
  }

  /**
  * Concats new buffer with previous ones and sets status to completed if response reached its target length.
  * If response length is greater than target length (new data contains fragment of next response)
  * status is set to overloaded and next response buffer can be extracted using extractOverload() method
  * @param {Buffer} data buffer received from dedicated server
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
      this._data = newBuffer.subarray(0, this._targetLength)
      this._status = 'completed'
      this.generateJson()
      return
    }
    this._data = newBuffer
  }

  get id(): number {
    return this._id
  }

  get status(): string {
    return this._status
  }

  get eventName(): string {
    return this._eventName
  }

  get isEvent(): boolean {
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
  * Returns buffer fragment written after reaching target length (next response buffer)
  * and sets status to completed
  * @returns {Buffer} next response buffer
  */
  extractOverload(): Buffer {
    this._status = 'completed'
    if (this._overload == null) {
      ErrorHandler.error('Error in extractOverload()', 'Overload is null')
      return Buffer.from('')
    }
    const overload: Buffer = this._overload
    this._overload = null
    return overload
  }

  /**
  * @returns {any[]} array created from server response
  */
  get json(): any[] {
    if (this._isEvent) {
      return this.fixNesting(this._json.methodCall)
    } else {
      return this.fixNesting(this._json.methodResponse)
    }
  }

  private generateJson(): void {
    let json: any
    // parse xml to json
    xml2js.parseString(this._data.toString(), (err, result): void => {
      if (err != null) {
        throw err
      }
      json = result
    })

    if (json?.methodCall != null) {
      this._json = json
      this._eventName = json.methodCall.methodName[0]
      this._isEvent = true
    } else if (json.methodResponse != null) {
      this._json = json
      this._isEvent = false
      // if server responded with error
      if (json.methodResponse.fault != null) {
        this._isError = true
        this._errorCode = json.methodResponse.fault[0].value[0].struct[0].member[0].value[0].int[0]
        this._errorString = json.methodResponse.fault[0].value[0].struct[0].member[1].value[0].string[0]
      }
    }
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
            const t: string = Object.keys(el.value[0])[0]
            const val: any = el.value[0][t][0]
            arr.push(changeType(val, t))
          }
          return arr
        default:
          return value
      }
    }
    // change overnested object received from parsing the xml to an array of server return values
    if (obj?.params[0].param === undefined) {
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
