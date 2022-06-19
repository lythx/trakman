export default class Table {

    readonly width: number
    readonly height: number
    readonly columnWidths: number[]
    readonly rowHeights: number[]
    readonly columns: number
    readonly rows: number
    readonly lineWidth = 0.1
    readonly outline: boolean

    constructor(height: number, width: number, rowProportions: number[], columnProportions: number[], outline?: true) {
        this.height = height
        this.width = width
        const rowSum = rowProportions.reduce((acc, cur) => acc += cur)
        const columnSum = columnProportions.reduce((acc, cur) => acc + cur)
        this.rowHeights = rowProportions.map(a => (a / rowSum) * this.height)
        this.columnWidths = columnProportions.map(a => (a / columnSum) * this.width)
        this.rows = rowProportions.length
        this.columns = columnProportions.length
        this.outline = outline === undefined ? false : true
    }

    constructXml(cellConstructFunctions: Function[], lineImageUrl?: string) {
        let xml = ``
        if (this.outline === true && lineImageUrl !== undefined) {
            xml += `<quad posn="0 0 3" sizen="${this.width} ${this.lineWidth}" image="${lineImageUrl}"/>
            <quad posn="0 0 3" sizen="${this.lineWidth} ${this.height}" image="${lineImageUrl}"/>
            <quad posn="0 -${this.height - this.lineWidth} 3" sizen="${this.width} ${this.lineWidth}" image="${lineImageUrl}"/>
            <quad posn="${this.width - this.lineWidth} 0 3" sizen="${this.lineWidth} ${this.height}" image="${lineImageUrl}"/>`
        }
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.columns; j++) {
                if (cellConstructFunctions[(i * this.columns) + j] === undefined) { break }
                const posY = -this.rowHeights.filter((val, index) => index < i).reduce((acc, cur) => acc += cur, 0)
                const posX = this.columnWidths.filter((val, index) => index < j).reduce((acc, cur) => acc += cur, 0)
                const h = this.rowHeights[i]
                const w = this.columnWidths[j]
                xml += `<frame posn="${posX} ${posY} 1">`
                if (lineImageUrl !== undefined) {
                    if (i !== 0) { xml += `<quad posn="0 0 3" sizen="${w} ${this.lineWidth}" image="${lineImageUrl}"/>` }
                    if (j !== 0) { xml += `<quad posn="0 0 3" sizen="${this.lineWidth} ${h}" image="${lineImageUrl}"/>` }
                    if (i !== this.rows - 1) { xml += `<quad posn="0 -${h} 3" sizen="${w} ${this.lineWidth}" image="${lineImageUrl}"/>` }
                    if (j !== this.columns - 1) { xml += `<quad posn="${w} 0 3" sizen="${this.lineWidth} ${h}" image="${lineImageUrl}"/>` }
                }
                xml += cellConstructFunctions[(i * this.columns) + j](i, j, h, w)
                xml += `</frame>`
            }
        }
        return xml
    }

}