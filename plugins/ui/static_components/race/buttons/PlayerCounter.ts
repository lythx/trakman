import type { ButtonData } from './ButtonData.js'
import { UiButton } from './UiButton.js'
import userConfig from './ButtonsWidget.config.js'

const config = tm.utils.withDefaults(userConfig, {
  playerCounter: {
    texts: {
      0: '#{count} $AF4SPEC#{plural}',
      1: '#{count} $AF4PLAYER#{plural}',
      equal: true,
    },
    width: 2,
    height: 2,
    padding: 0.3,
  },
})

const cfg = config.playerCounter

export class PlayerCounter extends UiButton {
  buttonData: ButtonData

  constructor() {
    super()
    const all: tm.Player[] = tm.players.list
    const players: number = all.filter((a) => !a.isSpectator).length
    this.buttonData = {
      icon: cfg.icon,
      text1: tm.utils.strVar(cfg.texts[0], {
        count: all.length - players,
        plural: all.length - players === 1 ? '' : 'S',
      }),
      text2: tm.utils.strVar(cfg.texts[1], {
        count: players,
        plural: players === 1 ? '' : 'S',
      }),
      iconWidth: cfg.width,
      iconHeight: cfg.height,
      padding: cfg.padding,
      equalTexts: cfg.texts.equal,
    }
    tm.addListener(['PlayerJoin', 'PlayerLeave', 'PlayerInfoChanged'], (): void => {
      const all: tm.Player[] = tm.players.list
      const players: number = all.filter((a) => !a.isSpectator).length
      this.buttonData.text1 = tm.utils.strVar(cfg.texts[0], {
        count: all.length - players,
        plural: all.length - players === 1 ? '' : 'S',
      })
      this.buttonData.text2 = tm.utils.strVar(cfg.texts[1], {
        count: players,
        plural: players === 1 ? '' : 'S',
      })
      this.emitUpdate()
    })
  }
}
