import userConfig from './Config.js'
import LiveCpsRanking from './ui/LiveCpsRanking.component.js'

const config = tm.utils.withDefaults(userConfig, {
  isEnabled: false,
})

let widgetUi: LiveCpsRanking

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    widgetUi = new LiveCpsRanking()
  })
}
