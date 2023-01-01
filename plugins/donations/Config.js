const p = tm.utils.palette

export default {
  paymentFail: `${p.error}Failed to process payment.`,
  paymentSuccess: `${p.highlight}#{nickname}${p.donation} `
    + `donated ${p.highlight}#{amount}C${p.donation} to the server.`,
  minimalAmount: 50,
  amountTooLow: `${p.error}Amount of coppers too low. ${p.highlight}50${p.error} is the minimum.`,
  command: {
    aliases: ['donate'],
    help: 'Donate coppers to the server.',
    privilege: 0
  }
}