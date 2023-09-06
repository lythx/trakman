/**
 * @author lythx
 * @since 0.4
 */

import { componentIds, StaticHeader, centeredText, StaticComponent, StaticHeaderOptions } from '../../UI.js'
import config from './CpCounter.config.js'
import { dedimania, DediRecord } from '../../../dedimania/Dedimania.js'

interface CheckpointData {
  index: number,
  best?: number,
  current?: number,
  isFinish: boolean,
}

export default class CpCounter extends StaticComponent {

  private readonly header: StaticHeader
  private prevTimes: { login: string, best?: number, current: number, isFinish: boolean }[] = []
  private prevLapTimes: { login: string, best?: number, current: number, isFinish: boolean }[] = []

  constructor() {
    super(componentIds.cpCounter)
    this.header = new StaticHeader('race', { rectangleWidth: config.rectangleWidth })
    this.renderOnEvent('PlayerCheckpoint', (info) => {
      const local: tm.LocalRecord | undefined = tm.records.getLocal(info.player.login)
      const dedi: DediRecord | undefined = dedimania.isUploadingLaps ? undefined : dedimania.getRecord(info.player.login)
      let pb: number | undefined = dedi?.checkpoints?.[info.index] ?? local?.checkpoints?.[info.index]
      if (dedi !== undefined && local !== undefined) {
        pb = Math.min(local?.checkpoints?.[info.index], dedi?.checkpoints?.[info.index])
      }
      let lap: undefined | CheckpointData & { cpIndex: number }
      if (tm.maps.current.isInLapsMode && tm.maps.current.lapsAmount !== 1) {
        let cpIndex = info.lapCheckpointIndex + 1
        const local: tm.LocalRecord | undefined = tm.records.getLap(info.player.login)
        const dedi: DediRecord | undefined = !dedimania.isUploadingLaps ? undefined : dedimania.getRecord(info.player.login)
        let pb: number | undefined
        if (info.isLapFinish) {
          pb = dedi?.time ?? local?.time
          if (dedi !== undefined && local !== undefined) {
            pb = Math.min(local?.time, dedi?.time)
            cpIndex = 0
          }
        } else {
          pb = dedi?.checkpoints?.[info.lapCheckpointIndex] ??
            local?.checkpoints?.[info.lapCheckpointIndex]
          if (dedi !== undefined && local !== undefined) {
            pb = Math.min(local?.checkpoints?.[info.lapCheckpointIndex],
              dedi?.checkpoints?.[info.lapCheckpointIndex])
          }
        }
        lap = {
          cpIndex, index: info.lap, best: pb,
          current: info.lapCheckpointTime,
          isFinish: info.isLapFinish
        }
      }
      return this.displayToPlayer(info.player.login, {
        index: info.index + 1,
        best: pb, current: info.time, isFinish: false, lap
      })
    })
    // Using TM event to reset the counter on backspace press
    tm.addListener('TrackMania.PlayerFinish', ([_, login, time]): void => {
      const player = tm.players.get(login)
      if (player === undefined) { return }
      let best: number | undefined
      let lap: undefined | CheckpointData & { cpIndex: number }
      if (time !== 0) {
        const local: tm.LocalRecord | undefined = tm.records.getLocal(login)
        const dedi: DediRecord | undefined = dedimania.isUploadingLaps ? undefined : dedimania.getRecord(login)
        best = dedi?.time ?? local?.time
        if (dedi !== undefined && local !== undefined) {
          best = Math.min(local?.time, dedi?.time)
        }
        if (tm.maps.current.isInLapsMode && tm.maps.current.lapsAmount !== 1) {
          const local: tm.LocalRecord | undefined = tm.records.getLap(login)
          const dedi: DediRecord | undefined = !dedimania.isUploadingLaps ?
            undefined : dedimania.getRecord(login)
          let pb: number | undefined = dedi?.time ?? local?.time
          if (dedi !== undefined && local !== undefined) {
            pb = Math.min(local?.time, dedi?.time)
          }
          const startIndex = tm.maps.current.checkpointsAmount - (tm.maps.current.checkpointsPerLap + 1)
          lap = {
            cpIndex: 0,
            index: 0, best: pb,
            current: time - (player.currentCheckpoints[startIndex]?.time ?? 0),
            isFinish: true
          }
        }
      }
      const obj = this.displayToPlayer(login, {
        index: 0, current: time === 0 ? undefined : time,
        best, isFinish: time !== 0, lap
      })
      if(obj !== undefined) {
        tm.sendManialink(obj.xml, obj.login)
      }
    }, true)
    this.renderOnEvent('BeginMap', () => {
      this.prevTimes.length = 0
      this.prevLapTimes.length = 0
      return this.display()
    })
  }

  getHeight(): number {
    return config.height
  }

  display() {
    if (!this.isDisplayed) { return }
    const arr = []
    for (const e of tm.players.list) {
      arr.push(this.displayToPlayer(e.login))
    }
    return arr
  }

  private constructTimeXml(login: string, isLap: boolean, icon: string,
    isFinish?: boolean, currentTime?: number, bestTime?: number): string {
    const arr = isLap ? this.prevLapTimes : this.prevTimes
    const prev = arr.find(a => a.login === login)
    if (currentTime === undefined) {
      if (prev === undefined) { return '' }
      currentTime = prev?.current
      bestTime = prev?.best
      isFinish = prev?.isFinish
    } else if (prev === undefined) {
      arr.push({ login, best: bestTime, current: currentTime, isFinish: isFinish === true })
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
    const h: StaticHeaderOptions = this.header.options
    const w: number = ((config.width - h.squareWidth) - config.margin) / 2
    const timeColour: string = '$' + (isFinish === true ? config.colours.finish : config.colours.default)
    return `${this.header.constructXml(timeColour + tm.utils.getTimeString(currentTime),
      icon, config.side, { rectangleWidth: w, centerText: true })}
    <frame posn="${w + config.margin * 2 + h.squareWidth} 0 3">
      <quad posn="0 0 3" sizen="${w} ${h.height}" bgcolor="${h.textBackground}"/>
      ${centeredText('$' + config.colours.default + differenceString, w, h.height, h)}
    </frame>`
  }

  displayToPlayer(login: string, params?: CheckpointData & { lap?: CheckpointData & { cpIndex: number } }) {
    if (!this.isDisplayed) { return }
    const cpAmount: number = tm.maps.current.checkpointsAmount - 1
    let colour: string = config.colours.default
    if (cpAmount === params?.index) {
      colour = config.colours.cpsCollected
    }
    const h: StaticHeaderOptions = this.header.options
    const counterW: number = config.width - (config.rectangleWidth + h.squareWidth + config.margin)
    let text: string = config.text
    let rectangleWidth: number = config.rectangleWidth
    let counter: string = `$${colour}${params?.index ?? 0}/${cpAmount}`
    if (params?.isFinish === true) {
      counter = config.finishText
      setTimeout((): void => {
        const obj = this.displayToPlayer(login)
        if (obj !== undefined) {
          tm.sendManialink(obj.xml, obj.login)
        }
      }, config.finishTextDuration)
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
    return {
      xml: `
        <manialink id="${this.id}">
            <frame posn="${config.posX} ${config.posY} 4">
              ${this.getLapsXml(login, params?.lap)}
              <format textsize="1"/>
              ${this.header.constructXml('$' + config.colours.default + text, config.icon, config.side, { rectangleWidth })}
              ${counterXml}
              <frame posn="0 ${-(config.height + config.margin)} 2">
                ${cpAmount === 0 ? '' : this.constructTimeXml(login, false, config.iconBottom,
        params?.isFinish, params?.current, params?.best)}
              </frame>
            </frame>
        </manialink>`, login
    }
  }

  private getLapsXml(login: string, data?: CheckpointData & { cpIndex: number }) {
    if (!tm.maps.current.isInLapsMode || tm.maps.current.lapsAmount === 1) { return '' }
    const h: StaticHeaderOptions = this.header.options
    const lapCounterW: number = config.lap.lapCounterWidth
    const lapsAmount = tm.maps.current.lapsAmount
    let lapColour: string = config.colours.default
    if (lapsAmount === data?.index) {
      lapColour = config.colours.cpsCollected
    }
    let lapTextW: number = config.lap.lapTextWidth
    let lapCounter: string = `$${lapColour}${data?.index ?? 0}/${lapsAmount}`
    let lapCounterXml: string = `
    <frame posn="${h.squareWidth + h.margin * 2 + lapTextW} 0 3">
      <quad posn="0 0 3" sizen="${lapCounterW} ${h.height}" bgcolor="${h.textBackground}"/>
      ${centeredText(lapCounter, lapCounterW, h.height, h)}
    </frame>`
    const cpAmount: number = tm.maps.current.checkpointsPerLap - 1
    let cpColour: string = config.colours.default
    if (cpAmount === data?.cpIndex) {
      cpColour = config.colours.cpsCollected
    }
    const cpX = h.squareWidth + h.margin * 2 + lapTextW + lapCounterW + config.margin
    let cpTextW: number = config.lap.checkpointTextWidth
    const cpCounterW: number = config.width - (cpX + cpTextW)
    let cpCounter: string = `$${cpColour}${data?.cpIndex ?? 0}/${cpAmount}`
    let cpCounterXml: string = `
    <frame posn="${config.margin + cpTextW} 0 3">
      <quad posn="0 0 3" sizen="${cpCounterW} ${h.height}" bgcolor="${h.textBackground}"/>
      ${centeredText(cpCounter, cpCounterW, h.height, h)}
    </frame>`
    return `<frame posn="0 ${this.header.options.height * 2 + config.margin * 2} 4">
    <format textsize="1"/>
    ${cpAmount === 0 ? '' : this.constructTimeXml(login, true, config.lap.iconTop,
      data?.isFinish, data?.current, data?.best)}
    <frame posn="0 ${-(config.height + config.margin)} 2">
      ${this.header.constructXml('$' + config.colours.default + config.lap.lapText, config.lap.iconBottom,
        config.side, { rectangleWidth: lapTextW })}
      ${lapCounterXml}
      <frame posn="${cpX} 0 3">
        <quad posn="0 0 3" sizen="${cpTextW} ${h.height}" bgcolor="${h.textBackground}"/>
        ${centeredText('$' + config.colours.default + config.lap.checkpointText, cpTextW, h.height, h)}
        ${cpCounterXml}
      </frame>
    </frame>
  </frame>`
  }

}
