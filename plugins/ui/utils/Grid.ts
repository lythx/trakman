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
    const columnSum = columnProportions.reduce((acc, cur) => acc + cur)
    const rowSum = rowProportions.reduce((acc, cur) => acc += cur)
    this.columnWidths = columnProportions.map(a => (a / columnSum) * this.width)
    this.rowHeights = rowProportions.map(a => (a / rowSum) * this.height)
    this.columns = columnProportions.length
    this.rows = rowProportions.length
    this.background = options?.background
    this.headerBg = options?.headerBg
    this.margin = options?.margin ?? CONFIG.grid.margin
  }

  constructXml(cellConstructFunctions: ((i: number, j: number, w: number, h: number) => string)[]) {
    let xml = ``
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (cellConstructFunctions[(i * this.columns) + j] === undefined) { break }
        const posY = -this.rowHeights.filter((val, index) => index < i).reduce((acc, cur) => acc += cur, 0)
        const posX = this.columnWidths.filter((val, index) => index < j).reduce((acc, cur) => acc += cur, 0)
        const h = this.rowHeights[i]
        const w = this.columnWidths[j]
        xml += `<frame posn="${posX} ${posY} 1">`
        if (this.headerBg !== undefined  && i === 0) {
          xml += `<quad posn="${this.margin} 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${this.headerBg}"/>`
        } else if (this.background !== undefined && i !== 0) {
          xml += `<quad posn="${this.margin} 0 2" sizen="${w - this.margin} ${h - this.margin}" bgcolor="${this.background}"/>`
        }
        xml += cellConstructFunctions[(i * this.columns) + j](i, j, w, h)
        xml += `</frame>`
      }
    }
    return xml
  }

}