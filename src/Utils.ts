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
   * Formats time for prettier display.
   * @param time Time to format
   * @returns Formatted time string (eg. 25:12.63, 0:56.92)
   */
  getTimeString(time: number): string {
    const d = new Date(time)
    const h = d.getUTCHours().toString()
    const m = d.getUTCMinutes().toString()
    const s = d.getUTCSeconds().toString().padStart(2, '0')
    const ms = d.getUTCMilliseconds().toString().padStart(3, '0').slice(0, -1)
    return h !== '0' ? (`${h}:${m.padStart(2, '0')}:${s}.${ms}`) : (`${m}:${s}.${ms}`)
  },

  /**
   * Adds an ordinal suffix to numbers.
   * @param pos Number to add the suffix to
   * @returns Number with the suffix (eg. 1st, 9th)
   */
  getOrdinalSuffix(pos: number): string {
    if (!Number.isInteger(pos) || pos === 0) {
      return pos.toString()
    }
    let prefix: string = ''
    if (pos < 0) {
      prefix = '-'
      pos = -pos
    }
    return prefix + pos.toString() + (['st', 'nd', 'rd'][((pos + 90) % 100 - 10) % 10 - 1] || 'th')
  },

  /**
   * Removes all Trackmania specific formatting (e.g. $w, $fff, etc.) from the supplied string.
   * @param str String to strip formatting from
   * @param removeColours Whether to remove colours from the string, defaults to true
   * @returns String without formatting
   */
  strip(str: string, removeColours: boolean = true): string {
    if (str === undefined) { return '' }
    let regex: RegExp
    if (removeColours) {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]|\$(?:[\da-f][^$][^$]|[\da-f][^$]|[^][hlp]|(?=[][])|$)|\${1}[^\💀]/gi
    } else {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]/gi
    }
    return str.replace('$$', '💀').replace(regex, '').replace('💀', '$$$$')
  },

  /**
   * Generates a colour gradient for the specified string with the passed colours
   * @param text Text to apply the generated colours to
   * @param startColour Start gradient colour (in hex)
   * @param endColour End gradient colour (in hex)
   * @returns String with gradient applied to it (colours are 3-digit hex)
   */
  makeGradient(text: string, startColour: string, endColour: string): string {
    const length: number = text.length
    if (length === 0) { // Why
      return ''
    }
    const textSplit: string[] = text.split('')
    let gradient: string = ''
    let [startRGB, endRGB] = [this.getRGB(startColour), this.getRGB(endColour)]
    let colours: string[] = []
    // https://stackoverflow.com/a/32257791
    let alpha: number = 0.0
    for (let i = 0; i !== length; i++) {
      let cc: Array<number> = []
      alpha += (1.0 / length)
      cc = [
        startRGB[0] * alpha + (1 - alpha) * endRGB[0],
        startRGB[1] * alpha + (1 - alpha) * endRGB[1],
        startRGB[2] * alpha + (1 - alpha) * endRGB[2]
      ]
      colours.push(this.getHex(cc, false))
    }
    for (let i = 0; i !== length; i++) {
      gradient += `$${colours[i] + textSplit[i]}`
    }
    return gradient
  },

  /**
   * Gives RGB representation of the supplied hex colour
   * @param hex Hex colour to get RGB values for
   * @returns Array of RGB values
   */
  getRGB(hex: string): Array<number> {
    if (hex.length === 3) {
      hex = hex.split('').map((a): string => { return a + a }).join('')
    }
    // https://stackoverflow.com/a/5624139
    const sh: RegExpExecArray | null = (/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i).exec(hex)
    return sh ? [parseInt(sh[1], 16), parseInt(sh[2], 16), parseInt(sh[3], 16)] : []
  },

  /**
   * Gives hex representation of the supplied RGB colour array
   * @param rgb Array of RGB values
   * @param getFull Whether to obtain full hex (6 chars)
   * @returns Hex colour string
   */
  getHex(rgb: Array<number>, getFull: boolean = true): string {
    let hex: string = (1 << 24 | rgb[0] << 16 | rgb[1] << 8 | rgb[2]).toString(16).slice(1)
    return getFull ? hex : hex[0] + hex[2] + hex[4] // idk maybe this can be done better
  },

  /**
   * Attempts to convert supplied string to latin text based on the special charmap.
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
   * Gets country information from region in Nadeo format (eg. World|Poland|Pomorskie)
   * @param region Region in Nadeo format, can start with World but doesn't have to
   * @returns Object containing parsed region (eg. Poland|Pomorskie), country and 
   * country code (eg. POL) if matching one was found 
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

  /**
   * Converts Trakman environment type to Nadeo environment type
   * @param environment Environment of type tm.Environment
   * @returns Whatever on earth Nadeo wanted to call their environment
   */
  environmentToNadeoEnvironment(environment: tm.Environment): Omit<tm.Environment, 'Desert' | 'Snow'> | 'Speed' | 'Alpine' {
    const environmentMap: { [environment in tm.Environment]: string } = {
      Stadium: 'Stadium',
      Island: 'Island',
      Desert: 'Speed',
      Rally: 'Rally',
      Bay: 'Bay',
      Coast: 'Coast',
      Snow: 'Alpine'
    }
    return environmentMap[environment]
  },

  matchString,

  /**
   * Gets the country code (non-ISO) for the specified country name
   * @param country Country name (eg. Poland)
   * @returns Country code (eg. POL)
   */
  countryToCode(country: string): string | undefined {
    return countries.find(a => a.name === country)?.code
  },

  /**
   * Gets the appropriate verb and calculates record differences.
   * @param current Object containing current record time and position
   * @param previous Optional object containing previous record time and position
   * @returns Object containing the verb to use (eg. 'acquired', 'improved') and 
   * the time difference string if previous record was specified
   */
  getRankingString(current: { time: number, position: number }, previous?: { time: number, position: number }): {
    status: '' | 'acquired' | 'obtained' | 'equaled' | 'improved',
    difference?: string
  } {
    let calc: boolean = false
    const obj: any = {
      status: ``,
      difference: undefined
    }
    if (previous === undefined) {
      obj.status = 'acquired'
      calc = false
    } else if (previous.position > current.position) {
      obj.status = 'obtained'
      calc = true
    } else if (previous.position === current.position && previous.time === current.time) {
      obj.status = 'equaled'
      calc = false
    } else if (previous.position === current.position) {
      obj.status = 'improved'
      calc = true
    }
    if (calc && previous !== undefined) {
      obj.difference = this.getTimeString(previous.time - current.time)
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
   * Sends coppers with specified parameters.
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
   * Pays coppers from the server with specified parameters.
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
   * Converts milliseconds to humanly readable time.
   * @param ms Time to convert (in milliseconds)
   * @returns Humanly readable time string (eg. 2 hours, 12 minutes and 30 seconds)
   */
  getVerboseTime(ms: number): string {
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
   * Removes certain HTML tags that may harm XML manialinks.
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
   * In Trackmania, https links won't work
   * @param url Original URL
   * @returns URL that will likely function properly
   */
  fixProtocol(url: string): string {
    return `http://${url.replace(/^https?:\/\//, '')}`
  },

  /**
   * Attempts to convert the player nickname to their login via charmap.
   * @param nickname Player nickname
   * @param options Options to modify search similarity goals
   * @returns Possibly matching login or undefined if unsuccessful
   */
  nicknameToPlayer(nickname: string, options: {
    similarityGoal: number,
    minDifferenceBetweenMatches: number
  } = {
      similarityGoal: config.nicknameToLoginSimilarityGoal,
      minDifferenceBetweenMatches: config.nicknameToLoginMinimumDifferenceBetweenMatches
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
    if (s[0].value - s?.[1]?.value ?? 0 < options.minDifferenceBetweenMatches) {
      return undefined
    }
    return s[0].player
  },

  /**
   * Converts date string to time in miliseconds. 
   * This method is used to parse time in chat commands.
   * @param dateStr Date string, number followed by optional modifier 
   * [s - seconds, m - minutes, h - hours, d - days]). 
   * If no modifier is specified the number will be treated as minutes.
   * @returns Time in miliseconds, RangeError if time is bigger than max js Date,
   * TypeError if the dateStr is not a valid date string
   */
  parseTimeString(dateStr: string): number | RangeError | TypeError {
    if (!isNaN(Number(dateStr)) && Number(dateStr) > 0) {
      if (isNaN(new Date(Number(dateStr) * 1000 * 60).getTime())) {
        return new RangeError(`Time amount too big`)
      }
      return Number(dateStr) * 1000 * 60
    } // If there's no modifier then time is treated as minutes
    const unit: string = dateStr.substring(dateStr.length - 1).toLowerCase()
    const time: number = Number(dateStr.substring(0, dateStr.length - 1))
    if (isNaN(time) || time < 0) {
      return new TypeError(`Invalid time string`)
    }
    let parsedTime: number
    switch (unit) {
      case 's':
        parsedTime = time * 1000
        break
      case 'm':
        parsedTime = time * 1000 * 60
        break
      case 'h':
        parsedTime = time * 1000 * 60 * 60
        break
      case 'd':
        parsedTime = time * 1000 * 60 * 60 * 24
        break
      default:
        return new TypeError(`Invalid time string`)
    }
    if (isNaN(new Date(parsedTime).getTime())) {
      return new RangeError(`Time amount too big`)
    }
    return parsedTime
  },

  /**
   * Formats date into calendar display.
   * @param date Date to be formatted
   * @param displayDay Whether to display day
   * @returns Formatted date string (dd/mm/yyyy)
   */
  formatDate(date: Date, displayDay?: true): string {
    if (displayDay === true) {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
    }
    return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  },

  /**
   * Creates string representation of chat command parameters.
   * @param commandParams Chat command paramaters
   * @returns Stringified parameters (eg. login <string>, duration<time>[, count<int>, reason<multiword>])
   */
  stringifyCommandParams(commandParams: tm.Command['params']): string {
    let text: string = ''
    let hasOptionals: boolean = false
    if (commandParams !== undefined) {
      for (const [i, e] of commandParams.entries()) {
        if (e.optional === true && !hasOptionals) {
          text += `[`
          hasOptionals = true
        }
        if (i === 0) { text += `${e.name} <${e.type ?? 'string'}>` }
        else { text += `, ${e.name} <${e.type ?? 'string'}>` }
      }
    }
    if (hasOptionals) {
      text += ']'
    }
    return text
  },

  /**
   * Calculates nadeo tax for given coppers amount and subtracts it from the amount.
   * Nadeo tax formula: https://docs.google.com/spreadsheets/d/1B_WUKayLJAMCklKaGrrjQZve1JJyFQ7h6SrbO0qdqkQ/pubhtml
   * @param coppers Coppers amount
   * @returns Coppers amount after subtracting tax
   */
  getCoppersAfterTax(coppers: number): number {
    return Math.round(coppers * 1.05) + 2 - coppers
  },

  strVar,

  /**
   * List of colours in Trackmania format (prefixed with $ and in 3 digit hex).
   */
  get colours() {
    return colours
  },

  /**
   * Server palette of colours defined in config.
   */
  palette,

  /**
   * List of Trackmania countries and country codes.
   */
  get countries() {
    return countries
  }

}

/**
 * Checks similarity of given strings, returns best matches sorted based on similarity.
 * @param searchString String to compare possible matches to
 * @param possibleMatches Array of strings to sort by similarity
 * @param stripSpecialChars If true special characters get in strings get replaced with latin if possible
 * @returns Array of objects containing string and its similarity value
 */
function matchString(searchString: string, possibleMatches: string[], stripSpecialChars?: true): { str: string, value: number }[]
/**
 * Checks similarity of given strings in an array of objects, returns best matches sorted based on similarity.
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
 * Replaces #{variableName} in string with given variables.
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
      if (typeof e === 'string') {
        let arr: string[] = e.split('')
        arr = arr.map(a => a === '$' ? '$$' : a)
        str = str.replace(/#{([^}]*)}/, arr.join(''))
      } else {
        str = str.replace(/#{([^}]*)}/, e)
      }
    }
    return str
  }
  for (const [k, v] of Object.entries(vars)) {
    if (typeof v === 'string') {
      let arr: string[] = v.split('')
      arr = arr.map(a => a === '$' ? '$$' : a)
      str = str.replace(`#{${k}}`, arr.join(''))
    } else {
      str = str.replace(`#{${k}}`, v)
    }
  }
  return str
}
