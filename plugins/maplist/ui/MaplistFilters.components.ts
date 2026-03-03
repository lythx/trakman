import { PopupWindow, Grid, centeredText, closeButton, componentIds, addManialinkListener, icons } from '../../ui/UI.js'
import config from './Maplist.config.js'
import { openMapList, openMapListEnv } from './Maplist.component.js'

type Btn = { label: string, id: number, onClick: (login: string) => void }

export default class MapListFilters extends PopupWindow<{}> {
  private readonly showEnv: boolean
  private readonly sorting: Btn[]
  private readonly filters: Btn[]
  private readonly environments: Btn[]
  private readonly grid: Grid
  private readonly filterWindow = config.filterWindow

  private readonly gapX = this.filterWindow.gapX
  private readonly gapY = this.filterWindow.gapY
  private readonly pad = this.filterWindow.pad
  private readonly inset = this.filterWindow.inset
  private readonly headerH = this.filterWindow.headerHeight
  private readonly btnH = this.filterWindow.buttonHeight
  private readonly btnTextScale = Math.max(this.filterWindow.buttonTextScale.min,
    config.textScale * this.filterWindow.buttonTextScale.multiplier)
  private readonly headerTextScale = Math.max(this.filterWindow.headerTextScale.min,
    config.textScale * this.filterWindow.headerTextScale.multiplier)

  constructor() {
    super(componentIds.mapList + 200, config.icon, 'Map Filters', [{ name: 'Map List', actionId: componentIds.mapList }])

    this.showEnv = (process.env.SERVER_PACKMASK ?? '').toLowerCase() !== 'nations'

    let id = this.openId + 2_000_000
    const next = () => id++

    this.sorting = [
      { label: 'Best', id: next(), onClick: l => openMapList(l, 'best', 1) },
      { label: 'Worst', id: next(), onClick: l => openMapList(l, 'worst', 1) },
      { label: 'Newest', id: next(), onClick: l => openMapList(l, 'newest', 1) },
      { label: 'Oldest', id: next(), onClick: l => openMapList(l, 'oldest', 1) },
      { label: 'Name', id: next(), onClick: l => openMapList(l, 'name', 1) },
      { label: 'Karma', id: next(), onClick: l => openMapList(l, 'karma', 1) },
      { label: 'Short', id: next(), onClick: l => openMapList(l, 'short', 1) },
      { label: 'Long', id: next(), onClick: l => openMapList(l, 'long', 1) },
      { label: 'Worst Karma', id: next(), onClick: l => openMapList(l, 'worstkarma', 1) }
    ]

    this.filters = [
      { label: 'No Finish', id: next(), onClick: l => openMapList(l, 'nofinish', 1) },
      { label: 'No Rank', id: next(), onClick: l => openMapList(l, 'norank', 1) },
      { label: 'No Author', id: next(), onClick: l => openMapList(l, 'noauthor', 1) },
      { label: 'Jukebox', id: next(), onClick: l => openMapList(l, 'jukebox', 1) }
    ]

    const defaultEnvironments = ['Stadium', 'Desert', 'Snow', 'Island', 'Rally', 'Bay', 'Coast']
    const customEnvironments = (tm.config.controller.customEnvironments ?? [])
      .map((env: string) => env.trim())
      .filter((env: string) => env.length > 0)
    const allEnvironments = Array.from(new Set(defaultEnvironments.concat(customEnvironments)))
    this.environments = this.showEnv ? allEnvironments.map(env => ({
      label: env,
      id: next(),
      onClick: l => openMapListEnv(l, env, 1)
    })) : []

    for (const button of [...this.sorting, ...this.filters, ...this.environments]) {
      addManialinkListener(button.id, info => button.onClick(info.login))
    }

    this.grid = new Grid(this.contentWidth, this.contentHeight, [1, 1], [1, 1, 1], {
      background: config.grid.background,
      margin: Math.min(config.grid.margin, 0.1)
    })

    tm.commands.add({
      aliases: config.commands.filters.aliases,
      help: config.commands.filters.help,
      callback: info => tm.openManialink(this.openId, info.login),
      privilege: config.commands.filters.privilege
    })
  }

  private header(w: number, title: string): string {
    return `<frame>
      <quad posn="0 0 1" sizen="${w} ${this.headerH}" bgcolor="${config.iconBackground}"/>
      ${centeredText(title, w, this.headerH, { textScale: this.headerTextScale, padding: config.padding })}
    </frame>`
  }

  private button(button: Btn, w: number, h: number): string {
    const bw = w - this.inset * 2
    const bh = h - this.inset * 2
    return `<frame>
      <quad posn="${this.inset} ${-this.inset} 1" sizen="${bw} ${bh}" bgcolor="${config.contentBackground}"/>
      <quad posn="${this.inset} ${-this.inset} 2" sizen="${bw} ${bh}" image="${config.blankImage}" imagefocus="${icons.bgGreyOpaque50}" action="${button.id}"/>
      ${centeredText(button.label, bw, bh, { textScale: this.btnTextScale, padding: config.padding })}
    </frame>`
  }

  private sectionTwoCols(w: number, title: string, buttons: Btn[], perRow: number): string {
    const head = this.header(w, title)
    const btnW = (w - this.pad * 2 - this.gapX * (perRow - 1)) / perRow
    const rows = Math.ceil(buttons.length / perRow)
    const bodyH = rows * this.btnH + Math.max(0, rows - 1) * this.gapY + this.pad * 2
    const content = buttons.map((button, i) => {
      const col = i % perRow
      const row = Math.floor(i / perRow)
      const x = this.pad + col * (btnW + this.gapX)
      const y = -(this.pad + row * (this.btnH + this.gapY))
      return `<frame posn="${x} ${y} 3">${this.button(button, btnW, this.btnH)}</frame>`
    }).join('')
    return `<frame>
      ${head}
      <frame posn="0 ${-this.headerH} 1">
        <quad posn="0 0 1" sizen="${w} ${bodyH}" bgcolor="${config.contentBackground}"/>
        ${content}
      </frame>
    </frame>`
  }

  private sectionFull(title: string, buttons: Btn[], perRow: number): string {
    const w = this.contentWidth - this.margin * 2
    const head = this.header(w, title)
    const btnW = (w - this.pad * 2 - this.gapX * (perRow - 1)) / perRow
    const rows = Math.ceil(buttons.length / perRow)
    const bodyH = rows * this.btnH + Math.max(0, rows - 1) * this.gapY + this.pad * 2
    const content = buttons.map((button, i) => {
      const col = i % perRow
      const row = Math.floor(i / perRow)
      const x = this.pad + col * (btnW + this.gapX)
      const y = -(this.pad + row * (this.btnH + this.gapY))
      return `<frame posn="${x} ${y} 3">${this.button(button, btnW, this.btnH)}</frame>`
    }).join('')
    return `<frame>
      ${head}
      <frame posn="0 ${-this.headerH} 1">
        <quad posn="0 0 1" sizen="${w} ${bodyH}" bgcolor="${config.contentBackground}"/>
        ${content}
      </frame>
    </frame>`
  }

  protected constructContent(_login: string): string {
    const colW = (this.contentWidth - this.margin * 3) / 2
    const left = this.sectionTwoCols(colW, 'Sorting', this.sorting, 2)
    const right = this.sectionTwoCols(colW, 'Filters', this.filters, 2)
    const sortRows = Math.ceil(this.sorting.length / 2)
    const secH = this.headerH + (sortRows * (this.btnH + this.gapY) + this.pad * 2)
    const env = this.showEnv ? this.sectionFull('Environments', this.environments, 4) : ''
    const envFrame = this.showEnv ? `<frame posn="0 ${-secH - this.margin} 0">${env}</frame>` : ''
    return `<frame posn="${this.margin} ${-this.margin} 1">
      <frame>${left}</frame>
      <frame posn="${colW + this.margin} 0 0">${right}</frame>
      ${envFrame}
    </frame>`
  }

  protected constructFooter(_login: string): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }
}

tm.addListener('Startup', (): void => {
  new MapListFilters()
})
