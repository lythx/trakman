import { trakman as TM } from '../../../src/Trakman.js'
import PopupWindow from '../PopupWindow.js'
import { CONFIG, Grid, ICONS, IDS, GridCellFunction, stringToObjectProperty, centeredText, closeButton } from '../UiUtils.js'

export default class Changelog extends PopupWindow {

  readonly marginBig = 1
  readonly gridBg = CONFIG.grid.bg
  readonly headerBg = CONFIG.grid.headerBg

  constructor() {
    super(IDS.changelog, stringToObjectProperty(CONFIG.changelog.icon, ICONS), CONFIG.changelog.title, CONFIG.changelog.navbar)
    TM.commands.add({
      aliases: ['changes', 'changelog'],
      help: 'Display list of controller changes',
      callback: (info) => {
        TM.openManialink(this.openId, info.login)
      },
      privilege: 0
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login, null, `1/1`)
  }

  protected constructContent(): string {
    const grid = new Grid(this.contentWidth, this.contentHeight, [1, 1, 1, 1], [1, 1], { margin: this.marginBig })
    const entries: GridCellFunction[] = [
      (i, j, w, h) => this.constructEntry('0.1', '27/07/2022', 'First public release on\nOldschool Loltards server', w, h, `https://cdn.discordapp.com/attachments/800663457779023872/999374713312776372/unknown.png`, 7),
      (i, j, w, h) => this.constructEntry('0.2', '28/07/2022',
        `- Added player votes to skip\n  and replay maps\n- Added freezone plugin\n- Implemented player rank\n  averages\n- Fixed a ton of bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.3', '31/07/2022',
        `- Added changelog\n- Added sector records\n- Added checkpoint records\n- Implemented player ranks\n- Implemented reconnect on\n  dedimania server restart\n- Fixed a ton of bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.4', '10/08/2022',
        `- Added map list utilites\n- Added autojuke\n- Added endscreen ui\n- Fixed a ton ton ton of bugs`, w, h)
    ]
    return grid.constructXml(entries)
  }

  private constructEntry(title: string, date: string, text: string, w: number, h: number, imageUrl?: string, imageHeight: number = 0) {
    const versioW = 6
    const headerH = 3
    const dateW = w - (versioW + this.margin)
    const image = imageUrl === undefined ? '' :
      `<quad posn="${this.marginBig} ${this.marginBig - imageHeight} 6" sizen="${w - this.marginBig * 2} ${h - (headerH + this.margin + imageHeight)}" image="${imageUrl}"/>`
    return `<format textsize="1"/>
      <quad posn="0 0 3" sizen="${versioW} ${headerH}" bgcolor="${this.headerBg}"/>
      ${centeredText(`$s${TM.utils.palette.tmGreen}${title}`, versioW, headerH, { padding: this.margin, textScale: 1.4 })}
      <frame posn="${versioW + this.margin} 0 2">
        <quad posn="0 0 2" sizen="${dateW} ${headerH}" bgcolor="${this.headerBg}"/>
        ${centeredText(`$s${date}`, dateW, headerH, { padding: this.margin, textScale: 1.4 })}
      </frame>
      <frame posn="0 ${-headerH - this.margin} 2">
        <quad posn="0 0 2" sizen="${w} ${h - (headerH + this.margin)}" bgcolor="${this.gridBg}"/>
        ${image}
        <label posn="${this.marginBig} ${-this.marginBig} 5" sizen="${w - this.marginBig * 2} ${h - (headerH + this.margin + this.marginBig * 2)}" scale="1.15" text="$s${text}"/>
      </frame>`
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}