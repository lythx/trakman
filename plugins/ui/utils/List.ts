import { Grid, GridCellFunction } from './Grid.js'
import { centeredText, verticallyCenteredText } from './TextUtils.js'
import CONFIG from '../config/UIConfig.json' assert { type: 'json' }

export class List {

  readonly entries: number
  readonly height: number
  readonly width: number
  readonly columnProportions: [number, number, number]
  readonly margin = CONFIG.list.margin
  readonly background: string | undefined

  constructor(entries: number, width: number, height: number, columnProportions: [number, number, number], options?: { background?: string }) {
    this.entries = entries
    this.height = height
    this.width = width
    this.columnProportions = columnProportions
    this.background = options?.background
  }

  constructXml(col1: string[], col2: string[]): string {

    const index: GridCellFunction = (i, j, w, h) => centeredText((col1[i] === undefined || col2[i] === undefined) ? '' : (i + 1).toString(), w, h, { textScale: 0.85 })

    const col1Function: GridCellFunction = (i, j, w, h) => centeredText(col1[i] ?? '', w, h, { textScale: 0.85 })

    const col2Function: GridCellFunction = (i, j, w, h) => verticallyCenteredText(col2[i] ?? '', w, h, { textScale: 0.85 })

    const arr: GridCellFunction[] = []
    for (let i = 0; i < this.entries; i++) {
      arr.push(index, col1Function, col2Function)
    }

    const grid = new Grid(this.width + this.margin * 2, this.height + this.margin * 2, this.columnProportions, new Array(this.entries).fill(1), { background: this.background, margin: CONFIG.grid.margin })
    return `<frame posn="${-this.margin} ${this.margin} 2">
      ${grid.constructXml(arr)}
    </frame>`
  }

}