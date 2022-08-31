import { palette as p } from '../../src/Trakman.js'

export default {
  paymentFail: `${p.error}Failed to process payment.`,
  paymentSuccess: `${p.highlight}#{nickname}${p.donation} `
    + `donated ${p.highlight}#{amount}C${p.donation} to the server.`
}