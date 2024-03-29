const passCancelPrivilege = 1

export default {
  yesKey: 'F5', // keys can be either F5 F6 or F7
  noKey: 'F6',
  keyListenerImportance: 10,
  passCancelPrivilege,
  commands: {
    yes: {
      aliases: ['y', 'yes'],
      help: `Vote "Yes".`,
      privilege: 0
    },
    no: {
      aliases: ['n', 'no'],
      help: `Vote "No".`,
      privilege: 0
    },
    pass: {
      aliases: ['pv', 'pass'],
      help: 'Pass the ongoing vote.',
      privilege: passCancelPrivilege
    },
    cancel: {
      aliases: ['cv', 'can', 'cancel'],
      help: 'Cancel the ongoing vote.',
      privilege: passCancelPrivilege
    }
  }
}