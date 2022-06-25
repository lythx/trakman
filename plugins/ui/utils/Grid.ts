export default class Grid {

  readonly width: number
  readonly height: number
  readonly columnWidths: number[]
  readonly rowHeights: number[]
  readonly columns: number
  readonly rows: number
  //TODO THIS IN CONFIG FILE
  readonly lineWidth = 0.1
  readonly outlineColor: string | undefined

  constructor(width: number, height: number, columnProportions: number[], rowProportions: number[], outlineColor?: string) {
    this.width = width
    this.height = height
    const columnSum = columnProportions.reduce((acc, cur) => acc + cur)
    const rowSum = rowProportions.reduce((acc, cur) => acc += cur)
    this.columnWidths = columnProportions.map(a => (a / columnSum) * this.width)
    this.rowHeights = rowProportions.map(a => (a / rowSum) * this.height)
    this.columns = columnProportions.length
    this.rows = rowProportions.length
    this.outlineColor = outlineColor
  }

  constructXml(cellConstructFunctions: ((i: number, j: number, w: number, h: number) => string)[]) {
    let xml = ``
    if (this.outlineColor !== undefined) {
      xml += `<quad posn="0 0 3" sizen="${this.width} ${this.lineWidth}" bgcolor="${this.outlineColor}"/>
            <quad posn="0 0 3" sizen="${this.lineWidth} ${this.height}" bgcolor="${this.outlineColor}"/>
            <quad posn="0 -${this.height - this.lineWidth} 3" sizen="${this.width} ${this.lineWidth}" bgcolor="${this.outlineColor}"/>
            <quad posn="${this.width - this.lineWidth} 0 3" sizen="${this.lineWidth} ${this.height}" bgcolor="${this.outlineColor}"/>`
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        if (cellConstructFunctions[(i * this.columns) + j] === undefined) { break }
        const posY = -this.rowHeights.filter((val, index) => index < i).reduce((acc, cur) => acc += cur, 0)
        const posX = this.columnWidths.filter((val, index) => index < j).reduce((acc, cur) => acc += cur, 0)
        const h = this.rowHeights[i]
        const w = this.columnWidths[j]
        xml += `<frame posn="${posX} ${posY} 1">`
        if (this.outlineColor !== undefined) {
          if (i !== 0) { xml += `<quad posn="0 0 3" sizen="${w} ${this.lineWidth}" bgcolor="${this.outlineColor}"/>` }
          if (j !== 0) { xml += `<quad posn="0 0 3" sizen="${this.lineWidth} ${h}" bgcolor="${this.outlineColor}"/>` }
          if (i !== this.rows - 1) { xml += `<quad posn="0 -${h} 3" sizen="${w} ${this.lineWidth}" bgcolor="${this.outlineColor}"/>` }
          if (j !== this.columns - 1) { xml += `<quad posn="${w} 0 3" sizen="${this.lineWidth} ${h}" bgcolor="${this.outlineColor}"/>` }
        }
        xml += cellConstructFunctions[(i * this.columns) + j](i, j, w, h)
        xml += `</frame>`
      }
    }
    return xml
  }

}