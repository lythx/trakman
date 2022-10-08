import PopupWindow from '../PopupWindow.js'
import { Grid, IDS, GridCellFunction, centeredText, closeButton } from '../UiUtils.js'
import config from './Changelog.config.js'

export default class Changelog extends PopupWindow {

  constructor() {
    super(IDS.changelog, config.icon, config.title, config.navbar)
    tm.commands.add({
      aliases: ['changes', 'changelog'],
      help: 'Display list of controller changes',
      callback: (info) => {
        tm.openManialink(this.openId, info.login)
      },
      privilege: 0
    })
  }

  protected onOpen(info: ManialinkClickInfo): void {
    this.displayToPlayer(info.login, null, `1/1`)
  }

  protected constructContent(): string {
    const grid = new Grid(this.contentWidth, this.contentHeight, [1, 1, 1, 1], [1, 1], { margin: config.marginBig })
    const entries: GridCellFunction[] = [
      (i, j, w, h) => this.constructEntry('0.1', '27/07/2022', 'First public release on\nOldschool Loltards server', w, h, `https://cdn.discordapp.com/attachments/800663457779023872/999374713312776372/unknown.png`, 7),
      (i, j, w, h) => this.constructEntry('0.2', '28/07/2022',
        `- Added player votes to skip\n  and replay maps\n- Added freezone plugin\n- Implemented player rank\n  averages\n- Fixed a ton of bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.3', '31/07/2022',
        `- Added changelog\n- Added sector records\n- Added checkpoint records\n- Implemented player ranks\n- Implemented reconnect on\n  dedimania server restart\n- Fixed a ton of bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.4', '10/08/2022',
        `- Added map list utilites\n- Added autojuke\n- Added endscreen ui\n- Implemented donations table\n- Fixed a ton ton ton of bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.5', '04/09/2022',
        `- Added map info window\n- Fixed tmx and karma bugs\n- Fixed endscreen ui bugs\n- Fixed dedimania info bugs`, w, h),
      (i, j, w, h) => this.constructEntry('0.6', '29/09/2022',
        `- Added cp counter\n- Added player stats windows\n- Added admin panel and\n  windows\n- Improved karma system`, w, h)
    ]
    return grid.constructXml(entries)
  }

  private constructEntry(title: string, date: string, text: string, w: number, h: number, imageUrl?: string, imageHeight: number = 0) {
    const versioW = 6
    const headerH = 3
    const dateW = w - (versioW + this.margin)
    const image = imageUrl === undefined ? '' :
      `<quad posn="${config.marginBig} ${config.marginBig - imageHeight} 6" sizen="${w - config.marginBig * 2} ${h - (headerH + this.margin + imageHeight)}" image="${imageUrl}"/>`
    return `<format textsize="1"/>
      <quad posn="0 0 3" sizen="${versioW} ${headerH}" bgcolor="${this.headerBg}"/>
      ${centeredText(`$s$${tm.utils.palette.green}${title}`, versioW, headerH, { padding: this.margin, textScale: config.textScale })}
      <frame posn="${versioW + this.margin} 0 2">
        <quad posn="0 0 2" sizen="${dateW} ${headerH}" bgcolor="${this.headerBg}"/>
        ${centeredText(`$s${date}`, dateW, headerH, { padding: this.margin, textScale: config.textScale })}
      </frame>
      <frame posn="0 ${-headerH - this.margin} 2">
        <quad posn="0 0 2" sizen="${w} ${h - (headerH + this.margin)}" bgcolor="${config.tileBackground}"/>
        ${image}
        <label posn="${config.marginBig} ${-config.marginBig} 5" sizen="${w - config.marginBig * 2} ${h - (headerH + this.margin + config.marginBig * 2)}" scale="1.15" text="$s${text}"/>
      </frame>`
  }

  protected constructFooter(): string {
    return closeButton(this.closeId, this.windowWidth, this.footerHeight)
  }

}