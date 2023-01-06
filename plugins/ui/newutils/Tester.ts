import { StyleSheet } from './StyleSheet.js'
import { Text } from './Text.js'
import { View } from './View.js'

const styles = StyleSheet({
  text: {
    textSize: 1,
    textScale: 1,
    width: 5,
    height: 5
  },
  view: {
    background: 'CCCC',
    width: 5,
    height: 5
  }
})



// tm.addListener('Startup', () => {
//   const ml = `<manialink id="342234987">
// ${View(styles.view, Text('lolololololool', styles.text)).render()}
// </manialink>`
//   console.log(ml)
//   setTimeout(() => tm.sendManialink(ml), 2000)

// })