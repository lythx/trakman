const p = tm.utils.palette
import buttonCfg from './ButtonsWidget.config.js'

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
    success: `${p.highlight}#{name}${p.donation} has paid ${p.highlight}#{amount}C ${p.donation}to replay the ongoing map.`,
    refundMail: `Refund for failed map replay on ${tm.config.server.name}`
  },
  voteSkip: {
    start: `${p.highlight}#{nickname} ${p.vote}started a vote to ${p.highlight}skip ${p.vote}the ongoing map.`,
    tooLate: `${p.error}It's too late for skip vote.`,
    failedRecently: `${p.error}Vote failed recently, wait a bit.`,
    tooManyFailed: `${p.error}Too many votes failed.`,
    alreadyRunning: `${p.error}A vote is already running.`,
    didntPass: `${p.vote}Vote to ${p.highlight}skip ${p.vote}the ongoing map ${p.highlight}did not pass${p.vote}.`,
    success: `${p.vote}Vote to ${p.highlight}skip ${p.vote}the ongoing map ${p.highlight}has passed${p.vote}.`,
    forcePass: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has passed the vote to skip the ongoing map.`,
    cancelled: `${p.vote} Vote to skip the ongoing map was cancelled.`,
    cancelledBy: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has cancelled the vote to skip the ongoing map.`
  },
  voteReplay: {
    replayStr: `${p.highlight}replay${p.vote}`,
    extendStr: `${p.highlight}extend${p.vote} the time on`,
    extendedRecently: `${p.error}Time extended recently, wait a bit.`,
    start: `${p.highlight}#{nickname} ${p.vote}started a vote to #{action} the ongoing map.`,
    tooLate: `${p.error}It's too late for replay vote.`,
    failedRecently: `${p.error}Vote failed recently, wait a bit.`,
    cantReplay: `${p.error}Can't vote for replay when the dynamic timer is enabled.` +
      ` Use ${p.highlight}/${buttonCfg.voteReplay.extendCommand.aliases[0]}${p.error} to vote for time extension instead.`,
    cantExtend: `${p.error}Can't vote for time extension when the dynamic timer is disabled.` +
      ` Use ${p.highlight}/${buttonCfg.voteReplay.command.aliases[0]}${p.error} to vote for replay instead.`,
    tooManyFailed: `${p.error}Too many votes failed.`,
    tooManyReplays: `${p.error}Too many replays.`,
    tooManyExtensions: `${p.error}Too many time extensions.`,
    alreadyRunning: `${p.error}A vote is already running.`,
    didntPass: `${p.vote}Vote to #{action} the ongoing map ${p.highlight}did not pass${p.vote}.`,
    success: `${p.vote}Vote to #{action} the ongoing map ${p.highlight}has passed${p.vote}.`,
    forcePass: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has passed the vote to #{action} the ongoing map.`,
    cancelled: `${p.vote} Vote to #{action} the ongoing map was cancelled.`,
    cancelledBy: `${p.vote}#{title} ${p.highlight}#{nickname}${p.vote} has cancelled the vote to #{action} the ongoing map.`
  }
} 