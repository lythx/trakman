import { actions } from '../../actions/Actions.js'
import config from '../config/KarmaCommands.config.js'

const options = {
  '+++': 3,
  '++': 2,
  '+': 1,
  '-': -1,
  '--': -2,
  '---': -3
} as const

const processVote = (vote: '---' | '--' | '-' | '+' | '++' | '+++', info: tm.MessageInfo): void => {
  const voteValue = options[vote as keyof typeof options]
  actions.addVote(info, voteValue)
}

tm.addListener('PlayerChat', (info): void => {
  processVote(info.text as keyof typeof options, info)
})

tm.commands.add(
  {
    aliases: config.aliases,
    help: config.help,
    callback: async (info): Promise<void> => {
      processVote(info.aliasUsed as keyof typeof options, info)
    },
    privilege: 0,
  }
)
