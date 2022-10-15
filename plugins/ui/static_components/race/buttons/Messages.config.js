const p = tm.utils.palette

export default {
  paySkip: {
    paymentFail: `${p.error}Failed to process payment.`,
    success: `${p.highlight}#{name}${p.donation} has paid ${p.highlight}#{amount}C ${p.donation}to skip the ongoing map.`+
    ` Skipping in ${p.highlight}#{seconds}s${p.donation}.`
  },
  payReplay: {
    paymentFail: `${p.error}Failed to process payment.`,
    interrupt: `${p.error}The map got #{event} while processing the payment#{refund}.`,
    skipEvent: 'skipped',
    replayEvent: 'replayed',
    refund: `, coppers will be returned`,
    success: `${p.highlight}#{name}${p.donation} has paid ${p.highlight}#{amount}C ${p.donation} to replay the ongoing map.`,
    refundMail: `Refund for failed map replay on ${tm.state.serverConfig.name}`
  },
  voteSkip: {

  },
  voteReplay: {

  }
} 