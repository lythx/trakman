/**
 * Adds custom brackets to chat messages.
 * @author lythx
 * @since 1.3
 */

import userConfig from './CustomBracket.config.js'

const config = tm.utils.withDefaults(userConfig, {
  isEnabled: false,
  brackets: [] as { logins: string[]; left: string; right: string }[],
  importance: 1,
})

if (config.isEnabled) {
  tm.chat.setMessageStyle(async (info): Promise<string | undefined> => {
    const brackets = config.brackets.find((a) => a.logins.includes(info.login))
    if (brackets === undefined) {
      return undefined
    }
    return `${brackets.left}${info.nickname}${brackets.right}`
  }, config.importance)
}
