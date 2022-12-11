export default {
  isEnabled: true,
  file: 'test.xml',
  refreshTimeout: 1000,
  commands: {
    displaytest: {
      aliases: ['displaytest'],
      help: `Displays the current test window.`,
      privilege: 3
    },
    hidetest: {
      aliases: ['hidetest'],
      help: `Hides the current test window.`,
      privilege: 3
    }
  }
}