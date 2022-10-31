export default {
  localRecordsLimit: 30,
  chatMessagesInRuntime: 300,
  jukeboxQueueSize: 30,
  jukeboxHistorySize: 30,
  privileges: {
    ban: 2,
    blacklist: 2,
    mute: 1,
    addGuest: 1
  },
  blacklistFile: "blacklist.txt",
  guestlistFile: "guestlist.txt",
  matchSettingsFile: "MatchSettings/MatchSettings.txt",
  defaultReasonMessage: 'No reason specified',
  truthyParams: ['true', 'yes', 'y', '1'],
  falsyParams: ['false', 'no', 'n', '0'],
  // Used in nickname to login translation in commands. 
  // Represents minimal similarity value at which translation will be successfull
  // 0.4 is default value
  nicknameToLoginSimilarityGoal: 0.4,
  // Used in nickname to login translation in commands. 
  // Represents minimal similarity difference between best and second-best match at which translation will be successfull.
  // 0.15 is default value
  nicknameToLoginMinimumDifferenceBetweenMatches: 0.15,
  version: "0.6"
}
