export default {
  truthyParams: ['true', 'yes', 'y', '1'],
  falsyParams: ['false', 'no', 'n', '0'],
  // Used in nickname to login translation in commands. 
  // Represents minimal similarity value at which translation can be successfull
  // 0.4 is default value
  nicknameToLoginSimilarityGoal: 0.4,
  // Used in nickname to login translation in commands. 
  // Represents minimal similarity difference between best and second-best match at which translation will be successfull.
  // 0.15 is default value
  nicknameToLoginMinimumDifferenceBetweenMatches: 0.15,
  blacklistFile: "blacklist.txt",
  guestlistFile: "guestlist.txt",
  matchSettingsFile: "MatchSettings/MatchSettings.txt",
  messagesInRuntimeMemory: 250,
  jukeboxQueueSize: 30,
  jukeboxPreviousMapsInRuntime: 30,
  tmxMapPrefetch: 4,
  tmxPreviousMapsInRuntime: 4,
  version: "0.6"
}
