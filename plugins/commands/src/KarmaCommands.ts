import config from '../config/KarmaCommands.config.js'

const options = {
  '+++': 3,
  '++': 2,
  '+': 1,
  '-': -1,
  '--': -2,
  '---': -3
} as const

tm.addListener('PlayerChat', (info) => {
  const voteValue = options[info.text as keyof typeof options]
  if (voteValue !== undefined) {
    tm.karma.add(info, voteValue)
    tm.sendManialink(tm.utils.strVar(config.message, {
      nickname: info.nickname,
      voteText: config.voteTexts[info.text as keyof typeof config.voteTexts]
    }), config.public === true ?  undefined : info.login)
  }
})