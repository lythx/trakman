import { CONFIG } from "../UiUtils.js"

export default class Grid {

  readonly width: number
  readonly height: number
  readonly columnWidths: number[]
  readonly rowHeights: number[]
  readonly columns: number
  readonly rows: number
  //TODO THIS IN CONFIG FILE
  readonly background: string | undefined
  readonly margin: number
  readonly headerBg: string | undefined

  constructor(width: number, height: number, columnProportions: number[], rowProportions: number[], options?: { background?: string, margin?: number, headerBg?: string }) {
    this.width = width
    this.height = height
    this.margin = options?.margin ?? CONFIG.grid.margin
    const columnSum: number = columnProportions.reduce((acc, cur): number => acc + cur)
    const rowSum: number = rowProportions.reduce((acc, cur): number => acc += cur)
    this.columnWidths = columnProportions.map(a => (a / columnSum) * (this.width - this.margin))
    this.rowHeights = rowProportions.map(a => (a / rowSum) * (this.height - this.margin))
    this.columns = columnProportions.length
    this.rows = rowProportions.length
    this.background = options?.background
    this.headerBg = options?.headerBg
  }

  constructXml(cellConstructFunctions: ((i: number, j: number, w: number, h: number) => string)[]): string {
    let xml: string = ``
    for (let i: number = 0; i < this.rows; i++) {
      for (let j: number = 0; j < this.columns; j++) {
        if (cellConstructFunctions[(i * this.columns) + j] === undefined) { break }
        const posY: number = -this.rowHeights.filter((val, index): boolean => index < i).reduce((acc, cur): number => acc += cur, 0)
        const posX: number = this.columnWidths.filter((val, index): boolean => index < j).reduce((acc, cur): number => acc += cur, 0)
        const h: number = this.rowHeights[i]
        const w: number = this.columnWidths[j]
        xml += `<frame posn="${posX} ${posY} 1">`
        if (this.headerBg !== undefined && i === 0) {
          xml += `<quad posn="${this.margin} ${-this.margin} 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${this.headerBg}"/>`
        } else if ((this.background !== undefined && i !== 0) || (this.headerBg === undefined && this.background !== undefined)) {
          xml += `<quad posn="${this.margin} ${-this.margin} 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${this.background}"/>`
        }
        xml += cellConstructFunctions[(i * this.columns) + j](i, j, w, h)
        xml += `</frame>`
      }
    }
    return xml
  }

}