export type GridCellFunction = (i: number, j: number, w: number, h: number) => string

export interface GridCellObject {
  callback: GridCellFunction
  colspan?: number
  rowspan?: number
  background?: string
}

/**
 * Util to display tabular data in manialinks.
 */
export class Grid {

  /** Grid width */
  readonly width: number
  /** Grid height */
  readonly height: number
  /** Width of each grid column */
  readonly columnWidths: number[]
  /** Height of each grid row */
  readonly rowHeights: number[]
  /** Column count */
  readonly columns: number
  /** Row count */
  readonly rows: number
  /** Background colour */
  readonly background: string | undefined
  /** Margin between cells and around grid */
  readonly margin: number
  /** Header background colour */
  readonly headerBg: string | undefined

  /**
   * Util to display tabular data in manialinks.
   * @param width Grid width
   * @param height Grid height
   * @param columnProportions Grid column proportions (proportions are relative to eachother like in CSS flexbox)
   * @param rowProportions Grid row proportions
   * @param options Optional properties
   */
  constructor(width: number, height: number, columnProportions: number[], rowProportions: number[], options?: { background?: string, margin?: number, headerBackground?: string }) {
    this.width = width
    this.height = height
    this.margin = options?.margin ?? 0
    const columnSum: number = columnProportions.reduce((acc, cur): number => acc + cur, 0)
    const rowSum: number = rowProportions.reduce((acc, cur): number => acc += cur, 0)
    this.columnWidths = columnProportions.map(a => (a / columnSum) * (this.width - this.margin))
    this.rowHeights = rowProportions.map(a => (a / rowSum) * (this.height - this.margin))
    this.columns = columnProportions.length
    this.rows = rowProportions.length
    this.background = options?.background
    this.headerBg = options?.headerBackground
  }

  /**
   * Creates grid XML string from passed callback functions. Use GridCellObjects if you want to change.
   * some property for specific grid cell eg. rowspan
   * @param objectsOrFunctions Array of GridCellFunctions functions or GridCellObjects
   * @returns Grid XML string
   */
  constructXml(objectsOrFunctions: (GridCellFunction | GridCellObject)[]): string {
    let xml: string = ``
    let map: boolean[][] = Array.from(new Array(this.columns), () => new Array(this.rows).fill(false))
    let indexOffset: number = 0
    for (let i: number = 0; i < this.rows; i++) {
      for (let j: number = 0; j < this.columns; j++) {
        if (map[j][i] === true) {
          indexOffset++
          continue
        }
        const obj: GridCellFunction | GridCellObject = objectsOrFunctions[(i * this.columns) + j - indexOffset]
        if (obj === undefined) { break }
        let callback: (i: number, j: number, w: number, h: number) => string
        let rowspan: number = 1
        let colspan: number = 1
        let background: string | undefined
        if (this.checkConstructFunctionType(obj)) {
          callback = obj.callback
          rowspan = obj.rowspan ?? 1
          colspan = obj.colspan ?? 1
          background = obj.background
        } else {
          callback = obj
        }
        const posY: number = -this.rowHeights.filter((val, index): boolean => index < i).reduce((acc, cur): number => acc += cur, 0) - this.margin
        const posX: number = this.columnWidths.filter((val, index): boolean => index < j).reduce((acc, cur): number => acc += cur, 0) + this.margin
        let h: number = -this.margin
        for (let k: number = i; k < i + rowspan; k++) {
          h += this.rowHeights[k]
          map[j][k] = true
        }
        let w: number = -this.margin
        for (let k: number = j; k < j + colspan; k++) {
          w += this.columnWidths[k]
          map[k][i] = true
        }
        xml += `<frame posn="${posX} ${posY} 1">`
        if (background !== undefined) {
          xml += `<quad posn="0 0 2" sizen="${w} ${h}" bgcolor="${background}"/>`
        } else if (this.headerBg !== undefined && i === 0) {
          xml += `<quad posn="0 0 2" sizen="${w} ${h}" bgcolor="${this.headerBg}"/>`
        } else if ((this.background !== undefined && i !== 0) || (this.headerBg === undefined && this.background !== undefined)) {
          xml += `<quad posn="0 0 2" sizen="${w} ${h}" bgcolor="${this.background}"/>`
        }
        xml += callback(i, j, w, h)
        xml += `</frame>`
      }
    }
    return xml
  }

  private checkConstructFunctionType(obj: any): obj is GridCellObject {
    return obj?.callback !== undefined
  }

}
