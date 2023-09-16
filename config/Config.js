export default {
  /** 
   * Manual chat routing is needed for chat utilities such as custom brackets or finish counter.
   * Enabling it makes the chat a bit slower, as all input has to go through the controller first.
   */
  manualChatRoutingEnabled: true,
  /** Local records limit for rank calculation and plugins */
  localRecordsLimit: 30,
  /** Amount of chat messages stored in runtime memory */
  chatMessagesInRuntime: 300,
  /** Amount of maps in the controller map queue */
  jukeboxQueueSize: 30,
  /** Amount of maps kept in the map history */
  jukeboxHistorySize: 30,
  /** Whether to keep the jukeboxed maps in the queue after the requester leaves */
  keepQueueAfterLeave: true,
  /** Whether to enable the /add functionality for all players */
  allowPublicAdd: false,
  /** Whether to start a vote to add maps with /add */
  voteOnPublicAdd: true,
  /** Default amount of maps fetched from the TMX search API */
  defaultTMXSearchLimit: 50,
  /** Privilege levels for each of the administrative actions */
  privileges: {
    ban: 2,
    blacklist: 2,
    mute: 1,
    addGuest: 1,
    kick: 1,
    forceSpectator: 1
  },
  /** Whether the maplist gets reloaded on Match Settings updates.
   *  Enable this if you use external tools to modify the Match Settings */
  updateMatchSettingsOnChange: false,
  /** Point system for rounds and cup gamemode */
  roundsModePointSystem: [33, 29, 27, 25, 23, 21, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  /** Default time limit in TimeAttack mode (in miliseconds) */
  defaultTimeAttackTimeLimit: 300000,
  /** Minimal time value to which the dynamic timer can be set (in miliseconds) */
  dynamicTimerSubtractionLimit: 30000,
  /** Relative path (/GameData/Config/) to the blacklist file */
  blacklistFile: "blacklist.txt",
  /** Relative path (/GameData/Config/) to the guestlist file */
  guestlistFile: "guestlist.txt",
  /** Relative path (/GameData/Tracks/) to the matchsettings file */
  matchSettingsFile: "MatchSettings/MatchSettings.txt",
  /** Default message sent as the reason for administrative actions if nothing was specified by the admin */
  defaultReasonMessage: 'No reason specified',
  /** Things that will be interpreted as true for the boolean command parameter */
  truthyParams: ['true', 'yes', 'y', '1'],
  /** Things that will be interpreted as false for the boolean command parameter */
  falsyParams: ['false', 'no', 'n', '0'],
  /** Represents default minimal similarity value at which nickname to
   * login translation will be successful. Used in nickname to login
   * translation in commands. 0.4 is the default value */
  nicknameToLoginSimilarityGoal: 0.4,
  /** Represents minimal similarity difference between best
   * and second-best match at which translation will be successfull.
   * Used in nickname to login translation in commands. 0.15 is default value */
  nicknameToLoginMinimumDifferenceBetweenMatches: 0.15,
  /** Current controller version */
  version: "1.4.0",
  /** Controller repository link */
  repo: "github.com/lythx/trakman",
}
