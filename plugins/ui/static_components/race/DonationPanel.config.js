import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  title: "Donations",
  height: 8,
  width: cfg.width,
  icon: icons.cash,
  margin: cfg.margin,
  background: cfg.background,
  amounts: [
    50,
    100,
    200,
    500,
    1000,
    5000
  ]
}