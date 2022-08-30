import cfg from '../../config/ResultUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 12.92,
  width: cfg.width,
  title: "Most Votes",
  icon: icons.peopleKarma,
  margin: cfg.margin,
  background: cfg.background,
  entries: 5,
  columnProportions: [
    1,
    1.9,
    5.1
  ]
}
