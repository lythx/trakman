export const Time = {
  getString(time: number): string {
    const hours = time/3600000
    const mins = (hours % 1) * 60
    const secs = (mins % 1) * 60
    const centisecs = (secs % 1) * 100
    let ret = ':' + this.format(secs, true) + '.' + this.format(centisecs, true, true)
    if(hours >= 1) {
      ret = this.format(hours, false) + ':' + this.format(mins) + ret
    } else {
      ret = this.format(mins, false) + ret
    }
    return ret
  },
  format(n: number, addZero: boolean = true, last: boolean = false): string {
    const res = (last ? Math.round(n) : Math.trunc(n)).toString()
    return (addZero && n < 10) ? '0' + res : res
  }
}