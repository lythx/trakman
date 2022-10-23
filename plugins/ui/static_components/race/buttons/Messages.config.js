const p = tm.utils.palette

export default {
  paySkip: {
    paymentFail: `${p.error}Failed to process payment.`,
    success: `${p.highlight}#{name}${p.donation} has paid ${p.highlight}#{amount}C ${p.donation}to skip the ongoing map.` +
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
    start: `${p.highlight}#{nickname} ${p.vote}started a vote to ${p.highlight}skip ${p.vote}the ongoing map.`,
    tooLate: `${p.error}It's too late for skip vote.`,
    failedRecently: `${p.error}Vote failed recently, wait a bit.`,
    tooManyFailed: `${p.error}Too many votes failed.`,
    alreadyRunning: `${p.error}A vote is already running.`,
    didntPass: `${p.vote}Vote to ${p.highlight}skip ${p.vote}the ongoing map ${p.highlight}did not pass${p.vote}.`,
    success: `${p.vote}Vote to ${p.highlight}skip ${p.vote}the ongoing map ${p.highlight}has passed${p.vote}.`,
    forcePass: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has passed the vote to skip the ongoing map.`,
    cancelled: `${p.admin} Vote to skip the ongoing map was cancelled.`,
    cancelledBy: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has cancelled the vote to skip the ongoing map.`
  },
  voteReplay: {
    start: `${p.highlight}#{nickname} ${p.vote}started a vote to ${p.highlight}replay ${p.vote}the ongoing map.`,
    tooLate: `${p.error}It's too late for replay vote.`,
    failedRecently: `${p.error}Vote failed recently, wait a bit.`,
    tooManyFailed: `${p.error}Too many votes failed.`,
    alreadyRunning: `${p.error}A vote is already running.`,
    didntPass: `${p.vote}Vote to ${p.highlight}replay ${p.vote}the ongoing map ${p.highlight}did not pass${p.vote}.`,
    success: `${p.vote}Vote to ${p.highlight}replay ${p.vote}the ongoing map ${p.highlight}has passed${p.vote}.`,
    forcePass: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has passed the vote to replay the ongoing map.`,
    cancelled: `${p.admin} Vote to replay the ongoing map was cancelled.`,
    cancelledBy: `${p.admin}#{title} ${p.highlight}#{nickname}${p.admin} has cancelled the vote to replay the ongoing map.`
  }
} 