import config from './Config.js'

/**
 * Sends informational messages periodically
 * @author wiseraven
 * @since 1.3
 */

const getRandomMessage = (): string => {
    return config.messages[~~(Math.random() * config.messages.length)]
}

const sendInfoMessage = (): void => {
    tm.sendMessage(config.messagePrefix
        + `$z$s ${config.defaultFormatting}` // Reset codes in case somebody is very clever
        + getRandomMessage(), undefined, config.chatPrefixEnabled)
}

if (config.isEnabled) {
    tm.addListener(`Startup`, async (): Promise<void> => {
        if (config.messages.length === 0) {
            tm.log.warn(`There aren't any info messages available for display.`)
            return
        }
        setInterval(async (): Promise<void> => {
            sendInfoMessage()
        }, config.messageInterval * 1000)
    })
    config.events.forEach(e => {
        tm.addListener(e as keyof tm.Events, (): void => {
            sendInfoMessage()
        })
    });
}
