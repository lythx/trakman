import colours from './src/data/Colours.json' assert { type: 'json' }

export default {
  prefixes: {
    serverToPlayer: `${colours.yellow}» `,
    serverToAll: `${colours.yellow}»» `
  },
  palette: {
    // All admin commands
    admin: colours.erin,
    // Dedi record messages
    dedirecord: colours.darkpastelgreen,
    // Dedi misc messages
    dedimessage: colours.kellygreen,
    // Donation messages
    donation: colours.brilliantrose,
    // Error messages
    error: colours.red,
    // General highlighting colour
    highlight: colours.white,
    // Karma messages
    karma: colours.greenyellow,
    // Server messages
    servermsg: colours.erin,
    // Misc messages
    message: colours.lightseagreen,
    // Rank highlighting colour
    rank: colours.icterine,
    // Record messages
    record: colours.erin,
    // Server message prefix colour
    server: colours.yellow,
    // Voting messages
    vote: colours.chartreuse,
    // Green
    tmGreen: '$af4',
    // Red
    tmRed: '$e22',
    // Yellow
    tmYellow: '$fc1',
    // Purple
    tmPurple: '$73f'
  }
}