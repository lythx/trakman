/**
 * @author lythx
 * @since 1.3.2
 */

import { donations } from '../../../donations/Donations.js'
import { addManialinkListener, centeredText, componentIds, components, StaticComponent } from '../../UI.js'
import config from './BannerWidget.config.js'

export default class BannerWidget extends StaticComponent {

  private xml: string = ''

  constructor() {
    super(componentIds.bannerWidget)
    this.constructXml()
    addManialinkListener(this.id + 1, 6, (info, offset) => {
      const amount: number = config.donateAmounts[offset]
      void donations.donate(info.login, info.nickname, amount)
    })
  }

  constructXml(): void {
    const w = this.getWidth()
    const h = this.getHeight()
    const m = config.margin
    const bh = config.buttonHeight
    this.xml = `<manialink id="${this.id}">
    <frame posn="${this.getPosX()} ${config.topBorder} 1">
      <format textsize="1" textcolor="FFFF"/> 
      <quad posn="0 0 2" sizen="${w} ${h}" bgcolor="${config.background}"/>
      <quad posn="${m} ${-m} 3" sizen="${w - m * 2} ${h - (bh + m * 3)}" image="${config.image}" url="${tm.utils.fixProtocol(config.imageLink)}"/>
      <frame posn="0 ${-(h - (bh + m * 2))} 1">
        ${this.constructDonateButtons(w, m)}
      </frame>
    </frame>
    </manialink>`
  }

  getHeight(): number {
    return components.staticHeights.Result.left[0].getHeight()
  }

  getWidth(): number {
    const comps = components.staticHeights.Rounds
    return (config.rightBorder - config.leftBorder) -
      (comps.left[0].getHeight() * 5 + config.marginBig * 8)
  }

  getPosX(): number {
    const comps = components.staticHeights.Rounds
    return config.leftBorder + (comps.left[0].getHeight() * 3 + config.marginBig * 4)
  }

  display(): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(this.xml)
  }

  displayToPlayer(login: string): void {
    if (!this.isDisplayed) { return }
    tm.sendManialink(this.xml, login)
  }

  constructDonateButtons(width: number, margin: number) {
    let ret = ''
    let x = margin
    const lgt = config.donateAmounts.length + 1
    const w = ((width - margin) / lgt) - margin
    const arr = [config.donateText, ...config.donateAmounts.map(a => String(a) + 'C')]
    for (let i = 0; i < lgt; i++) {
      const action = i === 0 ? '' : `action="${this.id + i}"`
      const bg = i === 0 ? config.mainTextBackground : config.donateBackground
      ret += `<quad posn="${x} ${-margin} 3" sizen="${w} ${config.buttonHeight}" bgcolor="${bg}" ${action}/>
            ${centeredText(arr[i], w, config.buttonHeight,
        { xOffset: x, yOffset: margin, textScale: config.textScale })}`
      x += w + margin
    }
    return ret
  }

}
