import { Grid, type GridCellFunction, type GridCellObject } from './Grid.js'
import { centeredText, leftAlignedText } from './TextUtils.js'
import config from './List.config.js'

/**
 * Util to display list data in manialinks. Displays 3 columns of data from which one is index
 */
export class List {

  /** Displayed entries count */
  readonly entries: number
  /** List height */
  readonly height: number
  /** List width */
  readonly width: number
  /** List column proportions (proportions are relative to eachother like in CSS flexbox) */
  readonly columnProportions: [number, number, number]
  /** Background colour */
  readonly background: string | undefined
  /** Header background colour */
  readonly headerBg: string | undefined

  /**
   * Util to display list data in manialinks. Displays 3 columns of data from which one is index
   * @param entries Number of entries to display
   * @param width List width
   * @param height List height
   * @param columnProportions List column proportions (proportions are relative to eachother like in CSS flexbox)
   * @param options Optional properties
   */
  constructor(entries: number, width: number, height: number, columnProportions: number[], options?: { background?: string, headerBg?: string }) {
    this.entries = entries
    this.height = height
    this.width = width
    if (columnProportions.length < 3) { throw new Error('Column proportions needs to have 3 elements') }
    this.columnProportions = columnProportions as any
    this.background = options?.background
    this.headerBg = options?.headerBg
  }

  /**
   * Constructs list XML from passed string arrays
   * @param col1 Array of strings to display in column 1
   * @param col2 Array of strings to display in column 2
   * @returns List XML string
   */
  constructXml(col1: string[], col2: string[]): string {

    const index: GridCellObject = {
      callback: (i, j, w, h): string =>
        centeredText((col1[i] === undefined || col2[i] === undefined) ? '' : (i + 1).toString(), w, h, { textScale: config.textScale }),
      background: this.headerBg
    }

    const col1Function: GridCellFunction = (i, j, w, h): string => centeredText(col1[i] ?? '', w, h, { textScale: config.textScale })

    const col2Function: GridCellFunction = (i, j, w, h): string => leftAlignedText(col2[i] ?? '', w, h, { textScale: config.textScale })

    const arr: (GridCellFunction | GridCellObject)[] = []
    for (let i: number = 0; i < this.entries; i++) {
      arr.push(index, col1Function, col2Function)
    }

    const grid = new Grid(this.width + config.margin * 2, this.height + config.margin * 2, this.columnProportions,
      new Array(this.entries).fill(1), { background: this.background, margin: config.margin })
    return `<frame posn="${-config.margin} ${config.margin} 2">
      ${grid.constructXml(arr)}
    </frame>`
  }

}
