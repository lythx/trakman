import { closeButton, componentIds, Grid, centeredText, type GridCellFunction, Paginator, PopupWindow, addManialinkListener } from '../../ui/UI.js'
import pluginConfig from '../Config.js'
import type { Song } from '../Types.js'
import config from './SongList.config.js'

type SearchTarget = 'name' | 'author'

interface DisplayParams {
  page: number
  isSearch: boolean
  paginator?: Paginator,
  list?: (Song & { index: number })[]
  query?: string
  target?: SearchTarget
}

export default class SongList extends PopupWindow<DisplayParams> {

  private currentSong: Song | undefined
  private songs: (Song & { index: number })[] = []
  private previousSongs: Song[] = []
  private readonly queries: {
    paginator: Paginator, list: (Song & { index: number })[],
    login: string, query: string, target: SearchTarget
  }[] = []
  readonly grid: Grid
  readonly paginator: Paginator
  readonly paginatorIdOffset = 100
  nextPaginatorId = 0
  readonly paginatorIdLimit = 100
  readonly addActionIdOffset = 1000
  readonly songListSizeLimit = 8000
  onSongJuked: (song: Song, info: tm.ManialinkClickInfo) => void = () => undefined
  onSongUnjuked: (song: Song, info: tm.ManialinkClickInfo) => void = () => undefined

  constructor() {
    super(componentIds.songList, config.icon, config.title, config.navbar)
    this.grid = new Grid(this.contentWidth, this.contentHeight, config.columnProportions,
      new Array(config.entries).fill(1), config.grid)
    this.paginator = new Paginator(this.openId, this.contentWidth, this.footerHeight, 1)
    this.paginator.onPageChange = (login, page, info) => {
      this.displayToPlayer(login, { page, isSearch: false },
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

  updateSongs(currentSong: Song | undefined, queue: Song[]) {
    this.currentSong = currentSong
    queue = currentSong === undefined ? [...queue] : [...queue, currentSong]
    this.songs = queue.map((a, i) => ({ ...a, index: i + 1 })).sort((a, b) => a.name > b.name ? 1 : -1)
    this.paginator.setPageCount(Math.ceil(queue.length / (config.entries - 1)))
    this.reRender()
  }

  updatePreviousSongs(previousSongs: Song[]) {
    this.previousSongs = [...previousSongs]
    this.reRender()
  }

  openWithQuery(player: tm.Player, query: string, searchTarget: SearchTarget = 'name') {
    const list = this.getSearchResult(query, searchTarget)
    const paginator = this.getPaginator(player.login, list, player.privilege, query, searchTarget)
    this.displayToPlayer(player.login, { page: 1, isSearch: true, paginator, list, query, target: searchTarget },
      `1/${paginator.pageCount}`, player.privilege)
  }

  private getPaginator(login: string, list: (Song & { index: number })[],
    privilege: number, query: string, target: SearchTarget): Paginator {
    const pageCount: number = Math.ceil(list.length / (config.entries - 1))
    const playerQuery = this.queries.find(a => a.login === login)
    let paginator: Paginator //
    if (playerQuery !== undefined) {
      playerQuery.list = list
      paginator = playerQuery.paginator
      paginator.setPageForLogin(login, 1)
      paginator.setPageCount(pageCount)
    } else {
      paginator = new Paginator(this.openId + this.paginatorIdOffset + this.nextPaginatorId,
        this.windowWidth, this.footerHeight, pageCount)
      this.nextPaginatorId += 10
      this.nextPaginatorId = (this.nextPaginatorId % this.paginatorIdLimit) + this.paginatorIdOffset
      this.queries.push({ paginator, login, list, query, target })
    }
    paginator.onPageChange = (login: string, page: number): Promise<void> => this.displayToPlayer(login,
      { page, isSearch: true, paginator, list }, `${page}/${pageCount}`, privilege)
    return paginator
  }

  protected onOpen(info: { login: string, privilege: number }): void {
    const page = this.paginator.getPageByLogin(info.login)
    this.displayToPlayer(info.login, { page, isSearch: false },
      `${page}/${this.paginator.pageCount}`, info.privilege)
  }

  private reRender(): void {
    const players = this.getPlayersWithWindowOpen(true)
    for (const player of players) {
      const paginator = player.params.paginator ?? this.paginator
      const page = paginator.getPageByLogin(player.login)
      if (player.params.query !== undefined) {
        player.params.list = this.getSearchResult(player.params.query, player.params.target ?? 'name')
      }
      this.displayToPlayer(player.login, player.params,
        `${page}/${paginator.pageCount}`, tm.players.get(player.login)?.privilege ?? 0)
    }
  }

  private getSearchResult(query: string, target: SearchTarget) {
    let indices: number[] = tm.utils.matchString(query, this.songs.map(a => a[target]))
    return indices.map(a => this.songs[a])
  }

  protected async constructContent(login: string, params?: DisplayParams, privilege = 0): Promise<string> {
    const page = params?.page ?? 1
    const list = params?.list ?? this.songs
    const index = (page - 1) * (config.entries - 1) - 1
    const headers: GridCellFunction[] = [
      (i, j, w, h) => centeredText(' Index ', w, h),
      (i, j, w, h) => centeredText(' Name ', w, h),
      (i, j, w, h) => centeredText(' Author ', w, h),
      (i, j, w, h) => centeredText('Queue position', w, h),
      (i, j, w, h) => centeredText(' Queued by ', w, h),
      (i, j, w, h) => centeredText(' Queue ', w, h),
    ]
    const indexCell: GridCellFunction = (i, j, w, h) => {
      const cover = ''
      return centeredText((i + index + 1).toString(), w, h) + cover
    }

    const nameCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].name, w, h)
    const authorCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].author, w, h)
    const queueIndex: GridCellFunction = (i, j, w, h) => {
      const song = list[index + i]
      if (this.currentSong?.name === song.name) {
        return centeredText(config.currentSongText, w, h)
      }
      return centeredText(song.index.toString(), w, h)
    }
    const queuedByCell: GridCellFunction = (i, j, w, h) =>
      centeredText(list[index + i].caller?.nickname ?? config.defaultText, w, h)
    const addToQueueCell: GridCellFunction = (i, j, w, h) => {
      const song = list[index + i]
      let actionId = this.openId + this.addActionIdOffset + index + i
      if (params?.isSearch === true) {
        const songIndex = this.songs.findIndex(a => a.name === song.name)
        actionId = this.openId + this.addActionIdOffset + songIndex
      }
      let icon = config.addIcon
      let iconHover = config.addIconHover
      if (song.isJuked && this.currentSong?.name !== song.name) {
        icon = config.removeIcon
        iconHover = config.removeIconHover
      }
      let action = `action="${actionId}"`
      let cover = ''
      if (!this.checkQueuePrivilege(login, privilege, song)) {
        iconHover = ''
        action = ''
        cover = `<quad posn="${w / 2} ${-h / 2} 7" sizen="${w} ${h}" 
        bgcolor="${config.overlayColour}" halign="center" valign="center" />`
      }
      return `${cover}
      <quad posn="${w / 2} ${-h / 2} 1" sizen="${config.iconWidth} ${config.iconHeight}" image="${icon}"
      imagefocus="${iconHover}" halign="center" valign="center" ${action} /> `
    }
    const rows = Math.min(config.entries - 1, list.length - (index + 1))
    const arr = headers
    for (let i = 0; i < rows; i++) {
      arr.push(indexCell, nameCell, authorCell, queueIndex, queuedByCell, addToQueueCell)
    }
    return this.grid.constructXml(arr)
  }

  private checkQueuePrivilege(login: string, privilege: number, song: Song): boolean {
    if (this.currentSong?.name === song.name) { return false }
    if (song.caller?.login === login) { return true }
    return !((privilege < pluginConfig.forceQueuePrivilege &&
      (this.previousSongs.some(a => a.name === song.name) ||
        this.songs.some(a => a.caller?.login === login))) ||
      (song.isJuked && privilege < pluginConfig.forceQueuePrivilege))
  }

  protected constructFooter(login: string, params?: DisplayParams): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight) +
      (params?.paginator ?? this.paginator).constructXml(login)
  }

}
