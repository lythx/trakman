import config from './UrlFixer.config.js'

if (config.isEnabled) {
  tm.chat.addMessageTextModifier(async (info): Promise<string | undefined> => {
    if (info.text.match(config.matchRegex)) {
      let [text, fixedText]: string[][] = [info.text.split(` `), [``]]
      for (const t of text) {
        t.match(config.matchRegex)
          ? fixedText.push(`$L${tm.utils.fixProtocol(tm.utils.strip(t))}$L`)
          : fixedText.push(t)
      }
      return fixedText.join(` `).slice(1)
    }
  }, config.importance)
}