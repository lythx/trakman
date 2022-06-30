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
  }
}
