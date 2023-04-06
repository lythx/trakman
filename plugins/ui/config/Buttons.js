import icons from './Icons.js'
import raceUi from './RaceUi.js'
import resultUi from './ResultUi.js'
const p = tm.utils.palette

export default {
  race: [
    {
      icon: icons.placeholder,
      posX: 43,
      posY: 25,
      width: 4,
      height: 5,
      zIndex: 1,
      text1: `$${p.purple}DISCORD`,
      text2: 'SERVER',
      iconWidth: 2,
      iconHeight: 2,
      topPadding: 0.3,
      equalTexts: false,
      // actionId: ,
      link: ''
    }
  ],
  result: [
    {
      icon: icons.placeholder,
      posX: -43,
      posY: -25,
      width: 4,
      height: 5,
      zIndex: 1,
      text1: `$${p.purple}DISCORD`,
      text2: 'SERVER',
      iconWidth: 2,
      iconHeight: 2,
      topPadding: 0.3,
      equalTexts: false,
      // actionId: ,
      background: resultUi.background,
      link: ''
    }
  ]
}