import config from './CustomBracket.config.js'

if (config.isEnabled) {
  tm.messages.addMessageStyle(async (info): Promise<string | undefined> => {
    const brackets = config.brackets.find(a => a.logins.includes(info.login))
    if (brackets === undefined) { return undefined }
    return `${brackets.left}${info.nickname}${brackets.right}`
  }, config.importance)
}
