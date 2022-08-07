import { Client } from "./client/Client.js"
import dsc from 'dice-similarity-coeff';
import specialCharmap from './data/SpecialCharmap.json' assert { type: 'json' }
import countries from './data/Countries.json' assert { type: 'json' }
import { Events } from './Events.js'
import specialTitles from './data/SpecialTitles.json' assert { type: 'json' }
import { PlayerService } from "./services/PlayerService.js";
import colours from './data/Colours.json' assert { type: 'json' }

const titles = ['Player', 'Operator', 'Admin', 'Masteradmin', 'Server Owner']
const bills: { id: number, callback: ((status: 'error' | 'refused' | 'accepted', errorString?: string) => void) }[] = []
Events.addListener('Controller.BillUpdated', (info: BillUpdatedInfo): void => {
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

  strip(str: string, removeColours: boolean = true): string {
    let regex: RegExp
    if (removeColours) {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]|\$(?:[\da-f][^$][^$]|[\da-f][^$]|[^][hlp]|(?=[][])|$)|\${1}[^\💀]/gi
    } else {
      regex = /\${1}(L|H|P)\[.*?\](.*?)\$(L|H|P)|\${1}(L|H|P)\[.*?\](.*?)|\${1}(L|H|P)(.*?)|\${1}[SHWIPLONGTZ]/gi
    }
    return str.replace('$$', '💀').replace(regex, '').replace('💀', '$$$$')
  },

  stripSpecialChars(str: string): string {
    const charmap = Object.fromEntries(Object.entries(specialCharmap).map((a: [string, string[]]): [string, string[]] => {
      return [a[0], [a[0], ...a[1]]]
    }))
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

  matchString,

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
    // TODO: Limit this according to the RecordService.localsAmount
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

  async sendCoppers(payerLogin: string, amount: number, message: string, targetLogin: string = ''): Promise<boolean | Error> {
    const billId: any[] | Error = await Client.call('SendBill', [{ string: payerLogin }, { int: amount }, { string: message }, { string: targetLogin }])
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
      bills.push({ id: billId[0], callback })
    })
  },

  /**
 * Determines the player title on join/actions
 * @param player Object of the player to get the title for
 * @returns The title string
 */
  getTitle(player: { login: string, privilege: number, country: string }): string {
    // Apparently this is a thing
    const specialTitle: string | undefined = specialTitles[player?.login as keyof typeof specialTitles]
    if (specialTitle !== undefined) {
      return specialTitle
    }
    return titles[player.privilege]
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
 * @param nickName Player nickname
 * @returns Possibly matching login or undefined if unsuccessful
 */
  nicknameToLogin(nickName: string): string | undefined {
    const nicknames = PlayerService.players.map(a => ({ login: a.login, nickname: Utils.strip(a.nickname).toLowerCase() }))
    const strippedNicknames: { nickname: string, login: string }[] = []
    for (const e of nicknames) {
      strippedNicknames.push({ nickname: this.stripSpecialChars(e.nickname), login: e.login })
    }
    const matches: { login: string, value: number }[] = []
    for (const e of strippedNicknames) {
      const value = dsc.twoStrings(e.nickname, nickName.toLowerCase())
      if (value > 0.4) {
        matches.push({ login: e.login, value })
      }
    }
    if (matches.length === 0) {
      return undefined
    }
    const s = matches.sort((a, b): number => b.value - a.value)
    if (s[0].value - s?.[1]?.value ?? 0 < 0.15) {
      return undefined
    }
    return s[0].login
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

  get colours() {
    return colours
  },

  get palette() {
    return {
      // All admin commands
      admin: this.colours.erin,
      // Dedi record messages
      dedirecord: this.colours.darkpastelgreen,
      // Dedi misc messages
      dedimessage: this.colours.kellygreen,
      // Donation messages
      donation: this.colours.brilliantrose,
      // Error messages
      error: this.colours.red,
      // General highlighting colour
      highlight: this.colours.white,
      // Karma messages
      karma: this.colours.greenyellow,
      // Server messages
      servermsg: this.colours.erin,
      // Misc messages
      message: this.colours.lightseagreen,
      // Rank highlighting colour
      rank: this.colours.icterine,
      // Record messages
      record: this.colours.erin,
      // Server message prefix colour
      server: this.colours.yellow,
      // Voting messages
      vote: this.colours.chartreuse,
      // Green
      tmGreen: '$af4',
      // Red
      tmRed: '$e22',
      // Yellow
      tmYellow: '$fc1',
      // Purple
      tmPurple: '$73f'
    }
  },

  get countries() {
    return countries
  }

}

function matchString(searchString: string, possibleMatches: string[]): { str: string, value: number }[]

function matchString<T extends { [key: string]: any }>
  (searchString: string, possibleMatches: T[], key: keyof T, stripSpecialChars?: true): { obj: T, value: number }[]

function matchString<T extends { [key: string]: any }>
  (searchString: string, possibleMatches: string[] | T[], key?: keyof T, stripSpecialChars?: true)
  : { str: string, value: number }[] | { obj: T, value: number }[] {
  if (possibleMatches.length === 0) { return [] }
  if (key === undefined) {
    const arr: { str: string, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({ str: e as any, value: dsc.twoStrings(searchString, e) })
    }
    return arr.sort((a, b): number => b.value - a.value)
  } else {
    const arr: { obj: T, value: number }[] = []
    for (const e of possibleMatches) {
      arr.push({ obj: e as any, value: dsc.twoStrings(searchString, stripSpecialChars === true ? Utils.stripSpecialChars(Utils.strip((e as any)[key])) : (e as any)[key]) })
    }
    return arr.sort((a, b): number => b.value - a.value)
  }
}


