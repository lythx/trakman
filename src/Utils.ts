'use strict'

export const Utils = {
  /**
   * Transforms a time in milliseconds into a (hh:m)m:ss:cc format
   * @param {number} time time in milliseconds
   * @returns {string} formatted time
   */
  getTimeString(time: number): string {
    const m = Math.floor(time / (1000 * 60)).toString()
    const s = Math.floor((time - Number(m) * 60 * 1000) / 1000).toString()
    const hs = time.toString().substring(time.toString().length - 3, 2)
    return `${m.padStart(2, '0')}:${s.padStart(2, '0')}.${hs.padStart(2, '0')}`
  },
  /**
   * Add a positional suffix to a number.
   * @param pos
   */
  getPositionString(pos: number): string {
    if (pos < 1 || pos % 1 !== 0) {
      throw RangeError('The position must be a natural number.')
    }
    return pos.toString() + (['st', 'nd', 'rd'][((pos + 90) % 100 - 10) % 10 - 1] || 'th')
  }
}
