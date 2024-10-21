import config from './Config.js'

/**
 * Sends informational messages periodically.
 * @author wiseraven
 * @since 1.3
 */

let currentInterval: NodeJS.Timeout

const getRandomMessage = (): string => {
  return config.messages[~~(Math.random() * config.messages.length)]
}

const sendInfoMessage = (): void => {
  tm.sendMessage(config.messagePrefix
    + `${config.defaultFormatting}`
    + getRandomMessage(), undefined, config.chatPrefixEnabled)
}

if (config.isEnabled) {
  tm.addListener(`Startup`, async (): Promise<void> => {
    if (config.messages.length === 0) {
      tm.log.warn(`There aren't any info messages available for display.`)
      return
    }
    // This is here because we don't emit BeginMap on Startup
    if (!config.sendOnInterval) { return }
    currentInterval = setInterval(async (): Promise<void> => {
      sendInfoMessage()
    }, config.messageInterval * 1000)
  })
  if (config.sendOnInterval) {
    // On EndMap, clear the interval for BeginMap
    // Also clears up whatever left from Startup, which can happen whenever
    tm.addListener(`EndMap`, (): void => {
      // Can happen if the message amount is 0
      if (currentInterval !== undefined) {
        clearInterval(currentInterval)
      }
    })
    // On BeginMap, reset the interval so the messages are always sent at the same time
    tm.addListener(`BeginMap`, (): void => {
      currentInterval = setInterval(async (): Promise<void> => {
        sendInfoMessage()
      }, config.messageInterval * 1000)
    })
  }
  for (const e of config.events) {
    tm.addListener(e as keyof tm.Events, (): void => {
      sendInfoMessage()
    })
  }
}
