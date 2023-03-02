import colours from '../src/data/Colours.js'

export const prefixes = {
  // TODO DOC
  manualChatRoutingMessageFormat: `$g[#{name}$z$s$g] `,
  /** Characters with which every message sent to individual players will be prefixed (e.g. ChatSendServerMessageToLogin) */
  serverToPlayer: `${colours.yellow}» `,
  /** Characters with which every message sent in public will be prefixed (e.g. ChatSendServerMessage) */
  serverToAll: `${colours.yellow}»» `
}

/** Controller messages palette object */
export const palette = {
  /** All admin commands */
  admin: colours.erin,
  /** Dedi record messages */
  dedirecord: colours.darkpastelgreen,
  /** Dedi misc messages */
  dedimessage: colours.kellygreen,
  /** Donation messages */
  donation: colours.brilliantrose,
  /** Error messages */
  error: colours.red,
  /** General highlighting colour */
  highlight: colours.white,
  /** Karma messages */
  karma: colours.greenyellow,
  /** Server messages */
  servermsg: colours.erin,
  /** Misc messages */
  message: colours.lightseagreen,
  /** Rank highlighting colour */
  rank: colours.icterine,
  /** Record messages */
  record: colours.erin,
  /** Server message prefix colour */
  server: colours.yellow,
  /** Voting messages */
  vote: colours.chartreuse,
  /** Green */
  green: 'af4',
  /** Red */
  red: 'e22',
  /** Yellow */
  yellow: 'fc1',
  /** Purple */
  purple: '4af'
}

export default {
  prefixes,
  palette
}