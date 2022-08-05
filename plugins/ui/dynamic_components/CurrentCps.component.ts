import { TRAKMAN as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, ICONS, IDS, stringToObjectProperty, Grid, centeredText, closeButton, Paginator } from '../UiUtils.js'

interface CurrentCheckpoint {
  nickname: string
  readonly login: string
  checkpoint: number
  pbCheckpoint: number | undefined
  pbTime: number | undefined
}

export default class CurrentCps extends PopupWindow {

  readonly entries = CONFIG.currentCps.entries
  readonly grid: Grid
  readonly gridMargin = CONFIG.grid.margin
  readonly currentCheckpoints: CurrentCheckpoint[] = []
  private readonly colours = {
    worse: "$F00",
    better: "$00F",
    equal: "$FF0"
  }
  readonly paginator: Paginator

  constructor() {
    // Translate icon name to url
    const iconUrl = stringToObjectProperty(CONFIG.currentCps.icon, ICONS)
    super(IDS.currentCps, iconUrl, CONFIG.currentCps.title, CONFIG.currentCps.navbar)
    // Create grid object to display the table
    this.grid = new Grid(this.contentWidth, this.contentHeight, CONFIG.currentCps.columnProportions, new Array(this.entries).fill(1),
      { background: CONFIG.grid.bg, margin: this.gridMargin, headerBg: CONFIG.grid.headerBg })
    TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
      const currentCp = this.currentCheckpoints.find(a => a.login === info.player.login)
      const pb = TM.records.getLocal(info.player.login)
      if (currentCp === undefined) { // Add a player to array if he wasn't there
        this.currentCheckpoints.push({
          nickname: info.player.nickname,
          login: info.player.login,
          checkpoint: info.time,
          pbCheckpoint: pb?.checkpoints?.[info.index] ?? undefined,
          pbTime: pb?.time ?? undefined
        })
      } else { // Update object in array if player was in it
        currentCp.nickname = info.player.nickname
        currentCp.checkpoint = info.time
        currentCp.pbCheckpoint = pb?.checkpoints?.[info.index] ?? undefined
        currentCp.pbTime = pb?.time ?? undefined
      }
    })
    this.paginator = new Paginator(this.openId, this.windowWidth, this.footerHeight, 1)
    this.paginator.onPageChange = (login: string, page: number) => {
      // Calculate and update page count
      let pageCount = Math.ceil(this.currentCheckpoints.length / this.entries)
      if (pageCount === 0) { // Fix 0 pages display if theres no entries
        pageCount = 1
      }
      this.paginator.setPageCount(pageCount)
      // Display using page received in params
      this.displayToPlayer(login, { page }, `${page}/${pageCount}`)
    }
    for (let i = 0; i < 100; i++) {
      this.currentCheckpoints.push({
        nickname: 'asd' + i,
        login: 'asdas' + i,
        pbTime: 3 + (i * 1000),
        checkpoint: 13000 + (i * 1000),
        pbCheckpoint: 12500 + (i * 900)
      })
    }
  }

  // Override onOpen method to add page count to params and display it
  protected onOpen(info: ManialinkClickInfo): void {
    // Calculate and update page count
    let pageCount = Math.ceil(this.currentCheckpoints.length / this.entries)
    if (pageCount === 0) { // Fix 0 pages display if theres no entries
      pageCount = 1
    }
    this.paginator.setPageCount(pageCount)
    this.displayToPlayer(info.login, { page: 1 }, `1/${pageCount}`)
  }

  protected constructContent(login: string, params: { page: number }): string {
    const headers = [
      (i: number, j: number, w: number, h: number) => centeredText(' Nickname ', w, h), // Space to prevent translation
      (i: number, j: number, w: number, h: number) => centeredText(' Login ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' Checkpoint ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' PB Checkpoint ', w, h),
      (i: number, j: number, w: number, h: number) => centeredText(' PB Time ', w, h),
    ]
    // Make entries relative to pages (subtract 1 from page because its 1-based)
    const index = (params.page - 1) * this.entries
    // Calculate how many entries will be displayed
    const entriesToDisplay = this.currentCheckpoints.length - index
    // Add n to index everywhere to make display relative to page
    const nickNameCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(TM.utils.safeString(TM.utils.strip(this.currentCheckpoints[i - 1 + index].nickname, false)), w, h)
    }
    const loginCell = (i: number, j: number, w: number, h: number): string => {
      return centeredText(this.currentCheckpoints[i - 1 + index].login, w, h)
    }
    const checkpointCell = (i: number, j: number, w: number, h: number): string => {
      const entry = this.currentCheckpoints[i - 1 + index]
      if (entry?.pbCheckpoint === undefined) { // If player has no pb then just displays the formatted time
        return centeredText(TM.utils.getTimeString(entry.checkpoint), w, h)
      }
      else { // Else calculates the difference and displays formatted difference and time
        const difference = entry.pbCheckpoint - entry.checkpoint
        let differenceString: string = ''
        if (difference !== undefined) {
          if (difference > 0) {
            differenceString = `(${this.colours.better}-${TM.utils.getTimeString(difference)}$FFF)`
          } else if (difference === 0) {
            differenceString = `(${this.colours.equal}${TM.utils.getTimeString(difference)}$FFF)`
          } else {
            differenceString = `(${this.colours.worse}+${TM.utils.getTimeString(Math.abs(difference))}$FFF)`
          }
        }
        const str = TM.utils.getTimeString(entry.checkpoint) + differenceString
        return centeredText(str, w, h)
      }
    }
    const pbCheckpointCell = (i: number, j: number, w: number, h: number): string => {
      const pbCheckpoint = this.currentCheckpoints[i - 1 + index]?.pbCheckpoint
      if (pbCheckpoint === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb checkpoint
        return centeredText(TM.utils.getTimeString(pbCheckpoint), w, h)
      }
    }
    const pbTimeCell = (i: number, j: number, w: number, h: number): string => {
      const pbTime = this.currentCheckpoints[i - 1 + index]?.pbTime
      if (pbTime === undefined) { // If player has no pb display -:--.--
        return centeredText('-:--.--', w, h)
      } else { // Else display the formatted pb time
        return centeredText(TM.utils.getTimeString(pbTime), w, h)
      }
    }
    const arr = headers
    // Add the cells to array depending on how many entries should be displayed
    for (let i = 0; i < entriesToDisplay; i++) {
      arr.push(nickNameCell, loginCell, checkpointCell, pbCheckpointCell, pbTimeCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params: { page: number }): string {
    // Return close button and paginator
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) + this.paginator.constructXml(params.page)
  }

}