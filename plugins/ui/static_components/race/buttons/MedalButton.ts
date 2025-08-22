import type { ButtonData } from "./ButtonData.js"
import { UiButton } from "./UiButton.js"
import config from "./ButtonsWidget.config.js"
import {horizontallyCenteredText} from '../../../UI.js'
import buttonConfig from '../../../../ui/utils/StaticButton.config.js'

const cfg = config.medalButton

export class MedalButton extends UiButton {

  buttonData: ButtonData

  constructor() {
    super()
    this.buttonData = {
      icon: "",
      text1: "",
      text2: "",
      iconWidth: 2.5,
      iconHeight: cfg.height,
      padding: cfg.padding,
      equalTexts: false,
      perPlayer: true
    }
    tm.addListener('LocalRecord', () => {
        this.emitUpdate()
      })

      tm.addListener('BeginMap', () => {
          this.emitUpdate()
      })
  }

  renderForPlayer(login:string, i: number, j: number, w: number, h: number): string {
      const record = tm.records.getLocal(login)?.time ?? 0

      const map = tm.maps.current
      const width = w - config.margin
      const height = h - config.margin
      const iconWidth = this.buttonData.iconWidth
      const topPadding = this.buttonData.padding


      type MedalInfo = { limit: number, text: string, icon: string }

      const thresholds: MedalInfo[] = [
          { limit: map.authorTime ?? Infinity, text: cfg.textAuthorMedal, icon: "MedalNadeo" },
          { limit: map.goldTime   ?? Infinity, text: cfg.textGoldMedal,   icon: "MedalGold"  },
          { limit: map.silverTime ?? Infinity, text: cfg.textSilverMedal, icon: "MedalSilver"},
          { limit: map.bronzeTime ?? Infinity, text: cfg.textBronzeMedal, icon: "MedalBronze"},
      ]

      let medalText = cfg.textNoMedal
      let iconSub = "MedalSlot"

      if (record > 0) {
          const hit = thresholds.find(t => record <= t.limit)
          if (hit) { medalText = hit.text; iconSub = hit.icon }
      }

      const t1: string = horizontallyCenteredText(medalText, width, height,
              { yOffset: 3.2, textScale: buttonConfig.textScale, padding: buttonConfig.padding })


      return `<quad posn="0 0 1" sizen="${width} ${height}" bgcolor="${buttonConfig.background}"/>
  <quad posn="${(width - (iconWidth)) / 2} ${-(topPadding)} 5" 
  sizen="${iconWidth} ${iconWidth}" style="MedalsBig" substyle="${iconSub}"/>
  ${t1}`

  }

}