/**
 * Adds custom brackets to chat messages.
 * @author lythx
 * @since 1.3
 */

import config from './CustomBracket.config.js'

if (config.isEnabled) {
  tm.chat.setMessageStyle(async (info): Promise<string | undefined> => {
    const brackets = config.brackets.find(a => a.logins.includes(info.login))
    if (brackets === undefined) { return undefined }
    return `${brackets.left}${info.nickname}${brackets.right}`
  }, config.importance)
}
