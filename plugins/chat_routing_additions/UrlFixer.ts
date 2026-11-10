import userConfig from './UrlFixer.config.js'

const config = tm.utils.withDefaults(userConfig, {
  isEnabled: false,
  matchRegex: /(http:\/\/|https:\/\/)/gi,
  importance: 1,
})

if (config.isEnabled) {
  tm.chat.addMessageTextModifier(async (info): Promise<string | undefined> => {
    if (info.text.match(config.matchRegex)) {
      const [text, fixedText]: string[][] = [info.text.split(` `), [``]]
      for (const t of text) {
        t.match(config.matchRegex)
          ? fixedText.push(`$L${tm.utils.fixProtocol(tm.utils.strip(t))}$L`)
          : fixedText.push(t)
      }
      return fixedText.join(` `).slice(1)
    }
  }, config.importance)
}
