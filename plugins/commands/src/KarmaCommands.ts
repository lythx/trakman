import config from '../config/KarmaCommands.config.js'

const options = {
  '+++': 3,
  '++': 2,
  '+': 1,
  '-': -1,
  '--': -2,
  '---': -3
} as const

const processVote = (info: tm.MessageInfo): void => {
  const voteValue = options[info.text as keyof typeof options]
  if (voteValue !== undefined) {
    tm.karma.add(info, voteValue)
    tm.sendMessage(tm.utils.strVar(config.message, {
      nickname: info.nickname,
      voteText: config.voteTexts[info.text as keyof typeof config.voteTexts]
    }), config.public === true ? undefined : info.login)
  }
}

tm.addListener('PlayerChat', (info): void => { processVote(info) })

tm.commands.add(
  {
    aliases: ['+++', '++', '+', '-', '--', '---'],
    help: 'Vote for a map.',
    params: [],
    callback: async (info: tm.MessageInfo): Promise<void> => {
      processVote(info)
    },
    privilege: 0,
  }
)
