import { Client } from "./client/Client.js"
import dsc from 'dice-similarity-coeff';

function matchString(searchString: string, possibleMatches: string[]): string[]

function matchString<T extends { [key: string]: any }>(searchString: string, possibleMatches: T[], key: keyof T): T[]

function matchString<T extends { [key: string]: any }>(searchString: string, possibleMatches: string[] | T[], key?: keyof T): string[] | T[] {
  if (possibleMatches.length === 0) { return [] }
  if (key === undefined) {
    const arr: { str: string, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({ str: e as any, value: dsc.twoStrings(searchString, e) })
    }
    return arr.sort((a, b) => b.value - a.value).map(a => a.str)
  } else {
    const arr: { obj: T, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({ obj: e as any, value: dsc.twoStrings(searchString, (e as any)[key]) })
    }
    return arr.sort((a, b) => b.value - a.value).map(a => a.obj)
  }
}

export const Utils = {

  /**
   * Formats time for prettier display
   * @param time Time to format
   * @returns Formatted time string
   */
  getTimeString(time: number): string {
    const timeLength: number = time.toString().length
    const m: string = Math.floor(time / (1000 * 60)).toString()
    const s: string = Math.floor((time - Number(m) * 60 * 1000) / 1000).toString()
    const hs: string = time.toString().substring(timeLength - 3, timeLength - 1)
    return `${m.padStart(1, '0')}:${s.padStart(2, '0')}.${hs.padStart(2, '0')}`
  },

  /**
   * Adds an ordinal suffix to numbers
   * @param pos Number to add the suffix to
   * @returns Number with the suffix
   */
  getPositionString(pos: number): string {
    if (pos < 1 || pos % 1 !== 0) {
      throw RangeError('The position must be a natural number.')
    }
    return pos.toString() + (['st', 'nd', 'rd'][((pos + 90) % 100 - 10) % 10 - 1] || 'th')
  },

  /**
   * Calls multiple dedicated server methods simultaneously and awaits the response
   * @param calls Array of dedicated server calls
   * @returns Server response or error if the server returns one
   */
  async multiCall(...calls: TMCall[]): Promise<({ method: string, params: any[] } | Error)[] | Error> {
    const arr: any[] = []
    for (const c of calls) {
      const params: any[] = c.params === undefined ? [] : c.params
      arr.push({
        struct: {
          methodName: { string: c.method },
          params: { array: params }
        }
      })
    }
    const res: any[] | Error = await Client.call('system.multicall', [{ array: arr }])
    if (res instanceof Error) {
      return res
    }
    const ret: ({ method: string, params: any[] } | Error)[] = []
    for (const [i, r] of res.entries()) {
      if (r.faultCode !== undefined) {
        ret.push(new Error(`Error in system.multicall in response for call ${calls[i].method}: ${r?.faultString ?? ''} Code: ${r.faultCode}`))
      } else {
        ret.push({ method: calls[i].method, params: r })
      }
    }
    return ret
  },

  matchString,

}
