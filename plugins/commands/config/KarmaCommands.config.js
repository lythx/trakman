const p = tm.utils.palette

export default {
  message: `${p.highlight}#{nickname}${p.vote} thinks this map is ${p.highlight}#{voteText}${p.vote}.`,
  voteTexts: {
    '+++': 'fantastic',
    '++': 'beautiful',
    '+': 'good',
    '-': 'bad',
    '--': 'poor',
    '---': 'waste'
  },
  public: true
}