

import { closeButton, componentIds, Grid, centeredText, GridCellFunction, Paginator, PopupWindow, addManialinkListener } from '../../ui/UI.js'
import { Song } from '../Types.js'
import config from './SongList.config.js'

type SearchTarget = 'name' | 'author'

interface DisplayParams {
  page: number
  search?: {
    query: string,
    target: SearchTarget
  }
}

export default class SongList extends PopupWindow<DisplayParams> {

  private songs: (Song & { index: number })[] = []
  readonly grid: Grid
  readonly paginator: Paginator
  readonly addActionIdOffset = 100
  readonly songListSizeLimit = 9000
  onSongJuked: (song: Song, info: tm.ManialinkClickInfo) => void = () => undefined
  onSongUnjuked: (song: Song, info: tm.ManialinkClickInfo) => void = () => undefined

  constructor() {
    super(componentIds.songList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, 1)
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, { page },
        `${page}/${this.paginator.pageCount}`, info.privilege)
    }
    addManialinkListener(this.openId + this.addActionIdOffset, this.songListSizeLimit, (info, offset) => {
      const song = this.songs[offset]
      if (song.isJuked) {
        this.onSongUnjuked(song, info)
      } else {
        this.onSongJuked(song, info)
      }
    })
  }

  open = this.onOpen.bind(this)

  updateSongs(songs: Song[]) {
    this.songs = [...songs].map((a, i) => ({ ...a, index: i })).sort((a, b) => a.name > b.name ? 1 : -1)
    this.paginator.setPageCount(Math.ceil(songs.length / (config.entries - 1)))
    this.reRender()
  }

  openWithQuery(player: tm.Player, query: string, searchTarget: SearchTarget = 'name') {
    this.displayToPlayer(player.login, {
      page: 1, search: {
        target: searchTarget, query
      }
    }, `1/1`, player.privilege)
  }

  protected onOpen(info: { login: string, privilege: number }): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page },
      `${page}/${this.paginator.pageCount}`, info.privilege)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const page = this.paginator.getPageByLogin(player.login)
      this.displayToPlayer(player.login, player.params,
        `${page}/${this.paginator.pageCount}`, tm.players.get(player.login)?.privilege ?? 0)
    }
  }

  private getSearchResult(query: string, target: SearchTarget): (Song & { index: number })[] {
    return (tm.utils.matchString(query, this.songs, target, true)).filter(a => a.value > 0.1).map(a => a.obj) // TODO val in config and in maplist too
  }

  protected async constructContent(login: string, params?: DisplayParams, privilege: number = 0): Promise<string> {
    let page = 1
    let search: DisplayParams['search'] //
    if (params !== undefined) {
      ({ page, search } = params)
    }
    let list = this.songs
    let index = (page - 1) * (config.entries - 1) - 1
    if (search !== undefined) {
      index = -1
      list = this.getSearchResult(search.query, search.target)
    }
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Name ', w, h),
      (i, j, w, h) => centeredText(' Author ', w, h),
      (i, j, w, h) => centeredText('Queue position', w, h),
      (i, j, w, h) => centeredText(' Queued by ', w, h),
      (i, j, w, h) => centeredText(' Queue ', w, h),
    ]
    const indexCell: GridCellFunction = (i, j, w, h) =>
      centeredText((i + index + 1).toString(), w, h)
    const nameCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].name, w, h)
    const authorCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].author, w, h)
    const queueIndex: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].index.toString(), w, h)
    const queuedByCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].caller?.nickname ?? config.defaultText, w, h)
    const addToQueueCell: GridCellFunction = (i, j, w, h) => {
      const song = list[index + i]
      let actionId = this.openId + this.addActionIdOffset + index + i
      if (params?.search !== undefined) {
        const songIndex = this.songs.findIndex(a => a.name === song.name)
        actionId = this.openId + this.addActionIdOffset + songIndex
      }
      let icon = config.addIcon
      let iconHover = config.addIconHover
      if (song.isJuked) {
        icon = config.removeIcon
        iconHover = config.removeIconHover
      }
      return `<quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${iconHover}" halign="center" valign="center" action="${actionId}" /> `
    }
    const rows = Math.min(config.entries - 1, list.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nameCell, authorCell, queueIndex, queuedByCell, addToQueueCell)
    }
    return this.grid.constructXml(arr)
  }

  protected constructFooter(login: string, params?: DisplayParams): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) +
      (params?.search === undefined ? this.paginator.constructXml(login) : '')
  }

}
