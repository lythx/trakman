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
  /** Whether to reset Cup mode scores after a map is skipped or restarted */
  resetCupScoreOnSkipAndRestart: true,
  /** Timeout after clicking manialink in milliseconds */
  manialinkInteractionTimeout: 50,
  /** Interval between pings to the server to check its online status in milliseconds */
  healthcheckInterval: 10000,
  /** Privilege levels for each of the administrative actions */
  privileges: {
    ban: 2,
    blacklist: 2,
    mute: 1,
    addGuest: 1,
    kick: 1,
    forceSpectator: 1,
    addMap: 1,
    removeMap: 1,
  },
  /**
   * Enable this for Trakman to take over handling maps. The controller will read maps from a folder
   * defined below and give the upcoming ones to the server, allowing for much more map capacity than
   * the server can handle (it becomes basically unresponsive at 5000 maps).
   * Enabling is recommended for new servers since writing a MatchSettings file manually is laborious,
   * while old servers with some deleted maps will probably not gain a large advantage.
   *
   * Only works when the Trackmania server is on the same computer as Trakman!
   */
  manualMapLoading: {
    enabled: false,
    /** Path to the `GameData/Tracks/` directory of the server. MUST end with a slash '/'!
     * Default value: "../GameData/Tracks/" assuming the Trakman directory is on the same level as the server.
     */
    mapsDirectoryPrefix: "../GameData/Tracks/",
    /** Relative path to all the maps. Read recursively from `GameData/Tracks/`.
     *  MUST end with a slash '/' when a directory is specified (i.e. if not left empty)!
     *  Default value: ""
     */
    mapsDirectory: "",
    /** Ignore non-stadium maps */
    stadiumOnly: undefined,
    /** Amount of maps to load into the server. Default value: 5 */
    preloadMaps: 5,
  },
  /**
   * When adding a large amount of maps, it is better to add them in smaller chunks. This is the size
   * of each chunk. Set to a higher amount to increase speed of pushing to the database, decrease
   * if you are having problems with memory. Default value: 2000
   */
  splitBy: 2000,
  /** Whether the maplist gets reloaded on Match Settings updates.
   *  Enable this if you use external tools to modify the Match Settings */
  updateMatchSettingsOnChange: false,
  /** Point system for rounds and cup gamemodes */
  roundsModePointSystem: [33, 29, 27, 25, 23, 21, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  /** Default time limit in TimeAttack mode (in milliseconds) */
  defaultTimeAttackTimeLimit: 300000,
  /** Minimal time value to which the dynamic timer can be set (in milliseconds) */
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
  /** Object with options for ufuzzy, see https://github.com/leeoniya/uFuzzy#options */
  searchOptions: {
    intraMode: 1,
    alpha: "a-zа-яё"
  },
  /** Current controller version */
  version: "1.6.1",
  /** Controller repository link */
  repo: "github.com/lythx/trakman",
}
