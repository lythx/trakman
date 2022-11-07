import { componentIds, StaticHeader, centeredText, StaticComponent, StaticHeaderOptions } from '../../UI.js'
import config from './CpCounter.config.js'
import { dedimania, DediRecord } from '../../../dedimania/Dedimania.js'

export default class CpCounter extends StaticComponent {

  private readonly header: StaticHeader
  private prevTimes: { login: string, best?: number, current: number, isFinish: boolean }[] = []

  constructor() {
    super(componentIds.cpCounter, 'race')
    this.header = new StaticHeader('race', { rectangleWidth: config.rectangleWidth })
    tm.addListener('PlayerCheckpoint', (info): void => {
      const local: tm.LocalRecord | undefined = tm.records.getLocal(info.player.login)
      const dedi: DediRecord | undefined = dedimania.getRecord(info.player.login)
      let pb: number | undefined = dedi?.checkpoints?.[info.index] ?? local?.checkpoints?.[info.index]
      if (dedi !== undefined && local !== undefined) {
        pb = Math.min(local?.checkpoints?.[info.index], dedi?.checkpoints?.[info.index])
      }
      this.displayToPlayer(info.player.login, { index: info.index + 1, best: pb, current: info.time, isFinish: false })
    })
    // Using TM event to reset the counter on backspace press
    tm.addListener('TrackMania.PlayerFinish', ([_, login, time]): void => {
      let best: number | undefined
      if (time !== 0) {
        const local: tm.LocalRecord | undefined = tm.records.getLocal(login)
        const dedi: DediRecord | undefined = dedimania.getRecord(login)
        best = dedi?.time ?? local?.time
        if (dedi !== undefined && local !== undefined) {
          best = Math.min(local?.time, dedi?.time)
        }
      }
      this.displayToPlayer(login, { index: 0, current: time === 0 ? undefined : time, best, isFinish: time !== 0 })
    }, true)
    tm.addListener('BeginMap', (): void => { this.prevTimes.length = 0 })
  }

  display(): void {
    if (this.isDisplayed === false) { return }
    for (const e of tm.players.list) {
      this.displayToPlayer(e.login)
    }
  }

  private constructTimeXml(login: string, isFinish?: boolean, currentTime?: number, bestTime?: number): string {
    const prev = this.prevTimes.find(a => a.login === login)
    if (currentTime === undefined) {
      if (prev === undefined) { return '' }
      currentTime = prev?.current
      bestTime = prev?.best
      isFinish = prev?.isFinish
    } else if (prev === undefined) {
      this.prevTimes.push({ login, best: bestTime, current: currentTime, isFinish: isFinish === true })
    } else {
      prev.best = bestTime
      prev.current = currentTime
      prev.isFinish = isFinish === true
    }
    let differenceString: string = config.defaultDifference
    if (bestTime !== undefined) {
      const difference: number = bestTime - currentTime
      if (difference > 0) {
        differenceString = `$${config.colours.better}-${tm.utils.getTimeString(difference)}`
      } else if (difference === 0) {
        differenceString = `$${config.colours.equal}${tm.utils.getTimeString(difference)}`
      } else {
        differenceString = `$${config.colours.worse}+${tm.utils.getTimeString(Math.abs(difference))}`
      }
    }
    const w: number = (config.width - config.margin) / 2
    const h: StaticHeaderOptions = this.header.options
    const timeColour: string = '$' + (isFinish === true ? config.colours.finish : config.colours.default)
    return `${this.header.constructXml(timeColour + tm.utils.getTimeString(currentTime),
      config.iconBottom, config.side, { rectangleWidth: w, centerText: true })}
    <frame posn="${w + config.margin * 2 + h.squareWidth} 0 3">
      <quad posn="0 0 3" sizen="${w} ${h.height}" bgcolor="${h.textBackground}"/>
      ${centeredText('$' + config.colours.default + differenceString, w, h.height, h)}
    </frame>`
  }

  displayToPlayer(login: string, params?: { index: number, best?: number, current?: number, isFinish: boolean }): void {
    if (this.isDisplayed === false) { return }
    const cpAmount: number = tm.maps.current.checkpointsAmount - 1
    let colour: string = config.colours.default
    if (cpAmount === params?.index) {
      colour = config.colours.cpsCollected
    }
    const h: StaticHeaderOptions = this.header.options
    const counterW: number = config.width - (config.rectangleWidth + config.margin)
    let text: string = config.text
    let rectangleWidth: number = config.rectangleWidth
    let counter: string = `$${colour}${params?.index ?? 0}/${cpAmount}`
    if (params?.isFinish === true) {
      counter = config.finishText
      setTimeout((): void => this.displayToPlayer(login), config.finishTextDuration)
    }
    let counterXml: string = `
    <frame posn="${h.squareWidth + h.margin * 2 + h.rectangleWidth} 0 3">
      <quad posn="0 0 3" sizen="${counterW} ${h.height}" bgcolor="${h.textBackground}"/>
      ${centeredText(counter, counterW, h.height, h)}
    </frame>`
    if (cpAmount === 0) {
      rectangleWidth = config.noCpsWidth
      text = config.noCpsText
      counterXml = ''
    }
    tm.sendManialink(`
        <manialink id="${this.id}">
            <frame posn="${config.posX} ${config.posY} 4">
              <format textsize="1"/>
              ${this.header.constructXml('$' + config.colours.default + text, config.icon, config.side, { rectangleWidth })}
              ${counterXml}
              <frame posn="0 ${-(config.height + config.margin)} 2">
                ${cpAmount === 0 ? '' : this.constructTimeXml(login, params?.isFinish, params?.current, params?.best)}
              </frame>
            </frame>
        </manialink>`, login)
  }
}
