import { Client } from "./client/Client.js"
import dsc from 'dice-similarity-coeff'
import specialCharmap from './data/SpecialCharmap.js'
import countries from './data/Countries.js'
import { Events } from './Events.js'
import { PlayerService } from "./services/PlayerService.js"
import colours from './data/Colours.js'
import { palette } from '../config/PrefixesAndPalette.js'
import config from '../config/Config.js'

const bills: { id: number, callback: ((status: 'error' | 'refused' | 'accepted', errorString?: string) => void) }[] = []
Events.addListener('BillUpdated', (info: tm.BillUpdatedInfo): void => {
  const billIndex: number = bills.findIndex(a => a.id === info.id)
  if (billIndex !== -1) {
    switch (info.state) {
      case 4:
        bills[billIndex].callback('accepted')
        break
      case 5:
        bills[billIndex].callback('refused')
        break
      case 6:
        bills[billIndex].callback('error', info.stateName)
        break
      default:
        return
    }
    bills.splice(billIndex, 1)
  }
})

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
    if (Number.isInteger(pos) === false || pos === 0) {
      return pos.toString()
    }
    let prefix = ''
    if (pos < 0) {
      prefix = '-'
      pos = -pos
    }
    return prefix + pos.toString() + (['st', 'nd', 'rd'][((pos + 90) % 100 - 10) % 10 - 1] || 'th')
  },

  /**
   * Removes all Trackmania specific formatting (e.g. $w, $fff, etc.) from the supplied string
   * @param str String to strip formatting from
   * @param removeColours Whether to remove colours from the string, defaults to true
   * @returns String without formatting
   */
  strip(str: string, removeColours: boolean = true): string {
    let regex: RegExp
    if (removeColours) {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]|\$(?:[\da-f][^$][^$]|[\da-f][^$]|[^][hlp]|(?=[][])|$)|\${1}[^\💀]/gi
    } else {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]/gi
    }
    return str.replace('$$', '💀').replace(regex, '').replace('💀', '$$$$')
  },

  /**
   * Attempts to convert supplied string to latin text based on the special charmap
   * @param str String to convert
   * @returns Converted string
   */
  stripSpecialChars(str: string): string {
    const charmap = Object.fromEntries(Object.entries(specialCharmap).map((a: [string, string[]]): [string, string[]] =>
      [a[0], [a[0], ...a[1]]]
    ))
    let strippedStr: string = ''
    for (const letter of str) {
      let foundLetter: boolean = false
      for (const key in charmap) {
        if (charmap[key].includes(letter)) {
          strippedStr += key
          foundLetter = true
          break
        }
      }
      if (!foundLetter) {
        strippedStr += letter
      }
    }
    return strippedStr
  },

  /**
   * Gets country information from region in Nadeo format
   * @param region Region in Nadeo format, can start with World but doesn't have to
   * @returns Object containing parsed region, country and country code if matching one was found
   */
  getRegionInfo(region: string): { region: string, country: string, countryCode?: string } {
    let split = region.split('|')
    if (region.startsWith('World')) {
      split.shift()
    }
    const r: string = split.join('|')
    const country: string = split[0]
    const countryCode: string | undefined = this.countryToCode(country)
    return { region: r, country, countryCode }
  },

  matchString,

  /**
   * Gets the country code (non-ISO) for the specified country name
   * @param country Country name
   * @returns Country code
   */
  countryToCode(country: string): string | undefined {
    return countries.find(a => a.name === country)?.code
  },

  /**
 * Gets the appropriate verb and calculates record differences
 * @param prevPos Previous record index
 * @param currPos Current record index
 * @param prevTime Previous record time
 * @param currTime Current record time
 * @returns Object containing the string to use, whether calculation is needed, and the difference
 */
  getRankingString(prevPos: number, currPos: number, prevTime: number, currTime: number): { status: '' | 'acquired' | 'obtained' | 'equaled' | 'improved', difference?: string } {
    let calc: boolean = false
    const obj: any = {
      status: ``,
      difference: undefined
    }
    if (prevPos === -1) {
      obj.status = 'acquired'
      calc = false
    } else if (prevPos > currPos) {
      obj.status = 'obtained'
      calc = true
    } else if (prevPos === currPos && prevTime === currTime) {
      obj.status = 'equaled'
      calc = false
    } else if (prevPos === currPos) {
      obj.status = 'improved'
      calc = true
    }
    if (calc) {
      obj.difference = this.getTimeString(prevTime - currTime)
      let i: number = -1
      while (true) {
        i++
        if (obj.difference[i] === undefined || (!isNaN(Number(obj.difference[i])) && Number(obj.difference[i]) !== 0) || obj.difference.length === 4) {
          break
        }
        if (Number(obj.difference[i]) !== 0) {
          continue
        }
        obj.difference = obj.difference.substring(1)
        i--
        if (obj.difference[i + 1] === ':') {
          obj.difference = obj.difference.substring(1)
        }
      }
    }
    return obj
  },

  /**
   * Sends coppers with specified parameters
   * @param payerLogin Login of the payee
   * @param amount Coppers amount
   * @param message Message to attach in the in-game mail
   * @param targetLogin Login of the receiver
   * @returns Whether the payment went through or error
   */
  async sendCoppers(payerLogin: string, amount: number, message: string, targetLogin: string = ''): Promise<boolean | Error> {
    const billId: any | Error = await Client.call('SendBill', [{ string: payerLogin }, { int: amount }, { string: message }, { string: targetLogin }])
    if (billId instanceof Error) { return billId }
    return await new Promise((resolve): void => {
      const callback = (status: 'error' | 'refused' | 'accepted', errorString?: string): void => {
        switch (status) {
          case 'accepted':
            resolve(true)
            break
          case 'refused':
            resolve(false)
            break
          case 'error':
            resolve(new Error(errorString ?? 'error'))
        }
      }
      bills.push({ id: billId, callback })
    })
  },

  /**
   * Pays coppers from the server with specified parameters
   * @param targetLogin Login of the receiver
   * @param amount Coppers amount
   * @param message Message to attach in the in-game mail
   * @returns True on payment success or error
   */
  async payCoppers(targetLogin: string, amount: number, message: string): Promise<true | Error> {
    const billId: any | Error = await Client.call('Pay', [{ string: targetLogin }, { int: amount }, { string: message }])
    if (billId instanceof Error) { return billId }
    return await new Promise((resolve): void => {
      const callback = (status: 'error' | 'refused' | 'accepted', errorString?: string): void => {
        switch (status) {
          case 'accepted':
            resolve(true)
            break
          case 'refused':
            resolve(new Error(`Transaction refused`))
            break
          case 'error':
            resolve(new Error(errorString ?? 'error'))
        }
      }
      bills.push({ id: billId, callback })
    })
  },

  /**
   * Converts milliseconds to humanly readable time
   * @param ms Time to convert (in milliseconds)
   * @returns Humanly readable time string
   */
  msToTime(ms: number): string {
    const d: Date = new Date(ms)
    let str: string = ''
    const seconds: number = d.getUTCSeconds()
    const minutes: number = d.getUTCMinutes()
    const hours: number = d.getUTCHours()
    const days: number = d.getUTCDate() - 1
    const months: number = d.getUTCMonth()
    const years: number = d.getUTCFullYear() - 1970
    if (years > 0) { str += years === 1 ? `${years} year, ` : `${years} years, ` }
    if (months > 0) { str += months === 1 ? `${months} month, ` : `${months} months, ` }
    if (days > 0) { str += days === 1 ? `${days} day, ` : `${days} days, ` }
    if (hours > 0) { str += hours === 1 ? `${hours} hour, ` : `${hours} hours, ` }
    if (minutes > 0) { str += minutes === 1 ? `${minutes} minute, ` : `${minutes} minutes, ` }
    if (seconds > 0) { str += seconds === 1 ? `${seconds} second, ` : `${seconds} seconds, ` }
    str = str.substring(0, str.length - 2)
    const index: number = str.lastIndexOf(',')
    if (index !== -1) { str = str.substring(0, index) + ' and' + str.substring(index + 1) }
    if (str === '') { return '0 seconds' }
    return str
  },

  /**
 * Removes certain HTML tags that may harm XML manialinks
 * @param str Original string
 * @returns Escaped string
 */
  safeString(str: string): string {
    const map = {
      '&': '&amp;',
      '"': '&quot;',
    }
    return str.replace(/[&"]/g, (m): string => { return map[m as keyof typeof map] })
  },

  /**
 * Attempts to convert the player nickname to their login via charmap
 * @param nickname Player nickname
 * @param options Options to modify search similarity goals
 * @returns Possibly matching login or undefined if unsuccessful
 */
  nicknameToPlayer(nickname: string, options: {
    similarityGoal: number,
    minimumDifferenceBetweenMatches: number
  } = {
      similarityGoal: config.nicknameToLoginSimilarityGoal,
      minimumDifferenceBetweenMatches: config.nicknameToLoginMinimumDifferenceBetweenMatches
    }): tm.Player | undefined {
    const players = PlayerService.players
    const strippedNicknames: { strippedNickname: string, player: tm.Player }[] = []
    for (const e of players) {
      strippedNicknames.push({ strippedNickname: this.stripSpecialChars(Utils.strip(e.nickname).toLowerCase()), player: e })
    }
    const matches: { player: tm.Player, value: number }[] = []
    for (const e of strippedNicknames) {
      const value = dsc.twoStrings(e.strippedNickname, nickname.toLowerCase())
      if (value > options.similarityGoal) {
        matches.push({ player: e.player, value })
      }
    }
    if (matches.length === 0) {
      return undefined
    }
    const s = matches.sort((a, b): number => b.value - a.value)
    if (s[0].value - s?.[1]?.value ?? 0 < options.minimumDifferenceBetweenMatches) {
      return undefined
    }
    return s[0].player
  },

  /**
   * Formats date into calendar display
   * @param date Date to be formatted
   * @param displayDay Whether to display day
   * @returns Formatted date string
   */
  formatDate(date: Date, displayDay?: true): string {
    if (displayDay === true) {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  },

  strVar,

  get colours() {
    return colours
  },

  palette,

  get countries() {
    return countries
  }

}

/**
 * Checks similarity of given strings, returns best matches sorted based on similarity
 * @param searchString String to compare possible matches to
 * @param possibleMatches Array of strings to sort by similarity
 * @param stripSpecialChars If true special characters get in strings get replaced with latin if possible
 * @returns Array of objects containing string and its similarity value
 */
function matchString(searchString: string, possibleMatches: string[], stripSpecialChars?: true): { str: string, value: number }[]
/**
 * Checks similarity of given strings in an array of objects, returns best matches sorted based on similarity
 * @param searchString String to compare possible matches to
 * @param possibleMatches Array of objects to sort by similarity
 * @param key Key in objects containing the string to compare
 * @param stripSpecialChars If true special characters get in strings get replaced with latin if possible
 * @returns Array of objects containing object and its similarity value
 */
function matchString<T extends { [key: string]: any }>
  (searchString: string, possibleMatches: T[], key: keyof T, stripSpecialChars?: true): { obj: T, value: number }[]
function matchString<T extends { [key: string]: any }>
  (searchString: string, possibleMatches: string[] | T[], arg?: keyof T | true, stripSpecialChars?: true)
  : { str: string, value: number }[] | { obj: T, value: number }[] {
  if (possibleMatches.length === 0) { return [] }
  if (arg === undefined || typeof arg === 'boolean') {
    const stripSpecialChars = arg
    const arr: { str: string, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({
        str: e as any, value: dsc.twoStrings(searchString, stripSpecialChars === true ?
          Utils.stripSpecialChars(Utils.strip(e as string)) : e)
      })
    }
    return arr.sort((a, b): number => b.value - a.value)
  } else {
    const key = arg
    const arr: { obj: T, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({
        obj: e as any, value: dsc.twoStrings(searchString, stripSpecialChars === true ?
          Utils.stripSpecialChars(Utils.strip((e as any)[key])) : (e as any)[key])
      })
    }
    return arr.sort((a, b): number => b.value - a.value)
  }
}

/** 
 * Replaces #{variableName} in string with given variables
 * @param str String to replace #{variableName} in
 * @param variables Object containing values for variable names (key is variableName)
 * @returns String with replaced variables
 */
function strVar(str: string, variables: { [name: string]: any }): string
/** 
 * Replaces #{variableName} in string with given variables
 * @param str String to replace #{variableName} in
 * @param variables Array containing values for variables in order
 * @returns String with replaced variables
 */
function strVar(str: string, variables: any[]): string
function strVar(str: string, vars: { [name: string]: any }): string {
  if (Array.isArray(vars)) {
    for (const e of vars) {
      str = str.replace(/#{([^}]*)}/, e)
    }
    return str
  }
  for (const [k, v] of Object.entries(vars)) {
    str = str.replace(`#{${k}}`, v)
  }
  return str
}