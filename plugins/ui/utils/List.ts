import { Grid, GridCellFunction, GridCellObject } from './Grid.js'
import { centeredText, verticallyCenteredText } from './TextUtils.js'

const margin = 0.15 // TODO config file

export class List {

  readonly entries: number
  readonly height: number
  readonly width: number
  readonly columnProportions: [number, number, number]
  readonly background: string | undefined
  readonly headerBg: string | undefined

  constructor(entries: number, width: number, height: number, columnProportions: number[], options?: { background?: string, headerBg?: string }) {
    this.entries = entries
    this.height = height
    this.width = width
    if(columnProportions.length < 3) { throw new Error('Column proportions needs to have 3 elements')}
    this.columnProportions = columnProportions as any
    this.background = options?.background
    this.headerBg = options?.headerBg
  }

  constructXml(col1: string[], col2: string[]): string {

    const index: GridCellObject = {
      callback: (i, j, w, h) =>
        centeredText((col1[i] === undefined || col2[i] === undefined) ? '' : (i + 1).toString(), w, h, { textScale: 0.85 }),
      background: this.headerBg
    }

    const col1Function: GridCellFunction = (i, j, w, h) => centeredText(col1[i] ?? '', w, h, { textScale: 0.85 })

    const col2Function: GridCellFunction = (i, j, w, h) => verticallyCenteredText(col2[i] ?? '', w, h, { textScale: 0.85 })

    const arr: (GridCellFunction | GridCellObject)[] = []
    for (let i = 0; i < this.entries; i++) {
      arr.push(index, col1Function, col2Function)
    }

    const grid = new Grid(this.width + margin * 2, this.height + margin * 2, this.columnProportions, new Array(this.entries).fill(1), { background: this.background, margin: margin })
    return `<frame posn="${-margin} ${margin} 2">
      ${grid.constructXml(arr)}
    </frame>`
  }

}