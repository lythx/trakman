import { utilIds, staticButton } from './UI.js'
import config from './config/Buttons.js'

export default class Buttons {

  private raceXml: string = ''
  private resultXml: string = ''

  constructor() {
    this.constructXml()
    this.display()
    tm.addListener(['BeginMap', 'EndMap', 'PlayerJoin'], () => {
      this.display()
    })
  }

  display(): void {
    tm.sendManialink(tm.getState() === 'result' ? this.resultXml : this.raceXml)
  }

  private constructXml(): void {
    let raceButtonsXml = ''
    for (const e of config.race) {
      if (!e.displayed) { continue }
      raceButtonsXml += `<frame posn="${e.posX} ${e.posY} ${e.zIndex}">
      ${staticButton(e.icon, e.text1, e.text2, e.width, e.height, e)}
      </frame>`
    }
    let resultButtonsXml = ''
    for (const e of config.result) {
      if (!e.displayed) { continue }
      resultButtonsXml += `<frame posn="${e.posX} ${e.posY} ${e.zIndex}">
      ${staticButton(e.icon, e.text1, e.text2, e.width, e.height, e)}
      </frame>`
    }
    this.raceXml = `<manialink id="${utilIds.buttons}">
      ${raceButtonsXml}
    </manialink>`
    this.resultXml = `<manialink id="${utilIds.buttons}">
      ${resultButtonsXml}
    </manialink>`
  }

}
