import cfg from '../../config/RaceUi.js'
import icons from '../../config/Icons.js'

export default {
  height: 8.8,
  width: cfg.width,
  title: "Karma",
  icon: icons.karmaStats,
  margin: cfg.margin,
  hidePanel: true,
  icons: [
    icons.karmaLocal,
    icons.karmaGlobal,
    icons.karmaPulse,
    icons.peopleKarma
  ],
  colours: ['0F8A', '0D6A', '0B4A', 'BO4A', 'D06A', 'F08A'],
  mkColours: ['0F0A', '0D0A', '0B0A', 'BOOA', 'D00A', 'F00A'],
  options: ['+++', '++', '+', '-', '--', '---'],
  buttonWidth: 1.7,
  background: cfg.background,
  selfColour: `${tm.utils.palette.yellow}A`,
  defaultText: '-',
  textScale: 0.65,
  textPadding: 0.1,
  plus: {
    scale: 0.6,
    offset: 0
  },
  minus: {
    scale: 1,
    offset: -0.3
  }
}