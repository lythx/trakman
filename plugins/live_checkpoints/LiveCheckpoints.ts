import config from './Config.js'
import LiveCpsRanking from './ui/LiveCpsRanking.component.js'

let widgetUi: LiveCpsRanking

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    widgetUi = new LiveCpsRanking()
  })
}