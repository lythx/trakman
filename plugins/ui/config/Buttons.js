import icons from './Icons.js'
import raceUi from './RaceUi.js'
import resultUi from './ResultUi.js'
const p = tm.utils.palette

/**
 * In this config you can easily add static buttons to your UI layout.
 * REQUIRED PROPS:
 * - displayed (bool) - if false the button wont display
 * - icon (str) - the icon url
 * - posX (num) - position X (0 is the middle of the screen)
 * - posY (num) - position Y (0 is the middle of the screen, positive is up)
 * - width (num) - background width
 * - height (num) - background height
 * - zIndex (num) - the Z "position" (determines stacking order of elements)
 * - text1 (str) - upper text
 * - text2 (str) - lower text (leave as empty string if you need only one text line)
 * OPTIONAL PROPS: 
 * - iconWidth (num) - the icon width
 * - iconHeight (num) - the icon height
 * - topPadding (num) - gap between top border of the background and top border of the icon
 * - equalTexts (bool) - If true text1 and text2 will be equal size, otherwise text1 is bigger (textsize overwrites this)
 * - actionId (int) - manialink action ID to trigger on click
 * - link (str) - internet link to open on click (eg. discord server link)
 * - text1Scale (num) - text1 size, this overwrites equalTexts if set
 * - text2Scale (num) - text2 size, this overwrites equalTexts if set
 */
export default {
  /**
   * RaceUi icons
   */
  race: [
    {
      displayed: false,
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
      link: '',
      // text1Scale: , 
      // text2Scale: ,
    }
  ],
  /**
   * ResultUi icons
   */
  result: [
    {
      displayed: false,
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
      background: resultUi.background,
      link: ''
    }
  ]
}