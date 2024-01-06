import icons from './Icons.js'
import raceUi from './RaceUi.js'
import resultUi from './ResultUi.js'
const p = tm.utils.palette

/**
 * In this config you can easily add static buttons to your UI layout.
 * 
 * REQUIRED PROPS:
 * 
 * - displayed (bool) - Whether to display the button
 * - icon (str) - Icon URL
 * - posX (num) - X position of the button (0 is the middle of the screen)
 * - posY (num) - Y position of the button (0 is the middle of the screen, positive is up)
 * - width (num) - Background width
 * - height (num) - Background height
 * - zIndex (num) - Z "position" of the button (determines stacking order of elements)
 * - text1 (str) - Upper text
 * - text2 (str) - Lower text (leave as empty string if you need only one text line)
 * OPTIONAL PROPS: 
 * 
 * - iconWidth (num) - Icon width
 * - iconHeight (num) - Icon height
 * - topPadding (num) - Gap between the top border of the background and the top border of the icon
 * - equalTexts (bool) - Whether text1 and text2 should be equal size, otherwise text1 is bigger
 * - actionId (int) - Manialink action ID to trigger on click
 * - background (str) - Background of the button (RGBA format)
 * - link (str) - URL to open on click (eg. discord server link)
 * - text1Scale (num) - Size of text1, this overwrites equalTexts if set
 * - text2Scale (num) - Size of text2, this overwrites equalTexts if set
 * - text1PositionOffset (num) - Position offset of text1, makes the text go lower
 * - text2PositionOffset (num) - Position offset of text2, makes the text go lower
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
      background: raceUi.background,
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
