export default {
  yesKey: 'F5', // keys can be either F5 F6 or F7
  noKey: 'F6',
  keyListenerImportance: 10,
  commands: {
    yes: {
      aliases: ['y', 'yes'],
      // help: `Vote "Yes".`,
      privilege: 0
    },
    no: {
      aliases: ['n', 'no'],
      // help: `Vote "No".`,
      privilege: 0
    }
  }
}