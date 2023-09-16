import { componentIds, StaticHeader, StaticComponent, leftAlignedText } from '../../ui/UI.js'
import { Song } from '../Types.js'
import config from './MusicWidget.config.js'

export default class MusicWidget extends StaticComponent {

  private song: Song | undefined
  private readonly header: StaticHeader
  private xml: string = ''

  constructor() {
    super(componentIds.musicWidget)
    this.header = new StaticHeader('race')
  }

  getHeight(): number {
    return config.height
  }

  setCurrentSong(song: Song | undefined) {
    this.song = song
    const xml = this.display()
    if(xml !== undefined) {
      tm.sendManialink(xml)
    }
  }

  display() {
    if (!this.isDisplayed) { return }
    this.updateXML()
    return this.xml
  }

  displayToPlayer(login: string) {
    if (!this.isDisplayed) { return }
    return { xml: this.xml, login }
  }

  private updateXML(): void {
    const h = (config.height - (this.header.options.height + config.margin * 2)) / 2
    const w = config.width
    const m = config.margin
    const iw = config.iconWidth
    this.xml = `<manialink id="${this.id}">
      <frame posn="${this.positionX} ${this.positionY} 1">
        <quad posn="0 0 8" sizen="${config.width} ${config.height}" action="${componentIds.songList}"/>
        <format textsize="1" textcolor="FFFF"/>
        ${this.header.constructXml(config.title, config.icon, config.side)}
        <frame posn="0 ${-(this.header.options.height + m)} 1">
          ${this.icon(config.icons.name, iw, h)}
          ${this.text(this.song?.name ?? config.noDataText, w - (iw + m), h, iw + m)}
          <frame posn="0 ${-(h + m)} 1">
            ${this.icon(config.icons.author, iw, h)}
            ${this.text(this.song?.author ?? config.noDataText, w - (iw + m), h, iw + m)}
          </frame>
        </frame>
      </frame>
    </manialink>`
  }

  private icon(url: string, w: number, h: number, xOffset: number = 0): string {
    return `<quad posn="${xOffset} 0 3" sizen="${w} ${h}" bgcolor="${config.iconBackground}"/>
    <quad posn="${config.margin + xOffset} ${-config.margin} 4" sizen="${w - config.margin * 2} ${h - config.margin * 2}" 
     image="${url}"/>`
  }

  private text(text: string, w: number, h: number, xOffset: number = 0, background?: string): string {
    xOffset = xOffset ?? 0
    return `<quad posn="${xOffset} 0 2" sizen="${w} ${h}" bgcolor="${background ?? config.textBackground}"/>
    ${leftAlignedText(text, w, h,
      { textScale: config.textScale, padding: config.textPadding, xOffset, })}`
  }

}
