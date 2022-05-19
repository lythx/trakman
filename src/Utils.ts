'use strict'

export const Utils = {
  /**
   * Transforms a time in milliseconds into a (hh:m)m:ss:cc format
   * @param {number} time time in milliseconds
   * @returns {string} formatted time
   */
  getTimeString (time: number): string {
    const hours = time / 3600000
    const mins = (hours % 1) * 60
    const secs = (mins % 1) * 60
    const centisecs = (secs % 1) * 100
    let ret = ':' + this.timeFormat(secs) + '.' + this.timeFormat(centisecs, true, true)
    if (hours >= 1) {
      ret = this.timeFormat(hours, false) + ':' + this.timeFormat(mins) + ret
    } else {
      ret = this.timeFormat(mins, false) + ret
    }
    return ret
  },
  /**
   * Helper for the getTimeString method
   * @param n time in any unit
   * @param addZero add a zero before the number if it's smaller than 10? (eg. 5 -> '05')
   * @param last truncate the decimals, or round the number?
   */
  timeFormat (n: number, addZero: boolean = true, last: boolean = false): string {
    const res = (last ? Math.round(n) : Math.trunc(n)).toString()
    return (addZero && n < 10) ? '0' + res : res
  },
  /**
   * Add a positional suffix to a number.
   * @param pos
   */
  getPositionString (pos: number): string {
    // https://stackoverflow.com/questions/13627308/add-st-nd-rd-and-th-ordinal-suffix-to-a-number/39466341#39466341
    { return ['st', 'nd', 'rd'][((pos + 90) % 100 - 10) % 10 - 1] || 'th' }
  }
}
