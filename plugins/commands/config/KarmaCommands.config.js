const p = tm.utils.palette

export default {
  message: `${p.highlight}#{nickname}${p.vote} voted ${p.highlight}#{voteText}${p.vote} for the current map.`,
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