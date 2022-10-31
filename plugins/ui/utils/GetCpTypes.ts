/**
 * Finds best, equal and worst times for each checkpoint.
 * @param checkpoints 2D array containing checkpoint times
 * @returns 2D array containing checkpoint types
 */
export const getCpTypes = (checkpoints: number[][]): ('best' | 'worst' | 'equal' | undefined)[][] => {
    if (checkpoints.length === 0 || checkpoints?.[0]?.length === 0) {
      return []
    }
    const cpAmount: number = checkpoints[0].length
    const cps: number[][] = Array.from(new Array(cpAmount), (): never[] => [])
    for (let i: number = 0; i < checkpoints.length; i++) {
      const cpRow: number[] = checkpoints?.[i]
      if (cpRow === undefined) { break }
      for (let j: number = 0; j < cpAmount; j++) {
        cps[j][i] = cpRow[j]
      }
    }
    const cpTypes: ('best' | 'worst' | 'equal' | undefined)[][] = Array.from(Array(cps[0].length), (): any[] => new Array(cps.length).fill(undefined))
    for (const [i, e] of cps.entries()) {
      if (cps?.[0]?.length < 2) {
        break
      }
      const max: number = Math.max(...e.filter(a => !isNaN(a)))
      const worst: number[] = e.filter(a => a === max)
      const min: number = Math.min(...e.filter(a => !isNaN(a)))
      const best: number[] = e.filter(a => a === min)
      if (max === min) {
        continue
      }
      if (worst.length === 1) {
        cpTypes[e.indexOf(worst[0])][i] = 'worst'
      }
      if (best.length === 1) {
        cpTypes[e.indexOf(best[0])][i] = 'best'
      } else {
        const indexes: number[] = e.reduce((acc: number[], cur, i): number[] => cur === min ? [...acc, i] : acc, [])
        for (const index of indexes) {
          cpTypes[index][i] = 'equal'
        }
      }
    }
    return cpTypes
  }