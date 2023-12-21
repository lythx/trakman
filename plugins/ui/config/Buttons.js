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
 * - text1PositionOffset (num) - text1 position offset, makes the text go lower
 * - text2PositionOffset (num) - text2 position offset, makes the text go lower
 */
export default {
  /**
   * RaceUi icons
   */
  race: [
    {
      displayed: false,
      icon: icons.placeholder,
      posX: 44.9,
      posY: 24.2,
      width: 4,
      height: 6.45,
      zIndex: 1,
      text1: `$${p.purple}DISCORD`,
      text2: 'SERVER',
      iconWidth: 3,
      iconHeight: 3,
      topPadding: 0.3,
      equalTexts: false,
      // actionId: ,
      // link: '',
      // text1Scale: , 
      // text2Scale: ,
      text1PositionOffset: 1.75,
      text2PositionOffset: 1.75,
    }
  ],
  /**
   * ResultUi icons
   */
  result: [
    {
      displayed: false,
      icon: icons.placeholder,
      posX: 44.9,
      posY: 22.85,
      width: 4,
      height: 6.1,
      zIndex: 1,
      text1: `$${p.purple}DISCORD`,
      text2: 'SERVER',
      iconWidth: 3,
      iconHeight: 3,
      topPadding: 0.3,
      equalTexts: false,
      // actionId: ,
      background: resultUi.background,
      link: '',
      // text1Scale: , 
      // text2Scale: ,
      text1PositionOffset: 1.75,
      text2PositionOffset: 1.75,
    }
  ]
}
