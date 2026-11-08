import userConfig from '../config/Config.js'
import { withDefaults } from './ConfigDefaults.js'

/**
 * Controller config (`config/Config.js`) with hard-coded defaults applied for every setting,
 * so that an outdated config file missing some settings doesn't crash the controller.
 */
export default withDefaults(userConfig, {
  manualChatRoutingEnabled: true,
  localRecordsLimit: 30,
  chatMessagesInRuntime: 300,
  jukeboxQueueSize: 30,
  jukeboxHistorySize: 30,
  keepQueueAfterLeave: true,
  allowPublicAdd: false,
  voteOnPublicAdd: true,
  defaultTMXSearchLimit: 50,
  resetCupScoreOnSkipAndRestart: true,
  manialinkInteractionTimeout: 50,
  healthcheckInterval: 10000,
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
  manualMapLoading: {
    enabled: false,
    mapsDirectoryPrefix: '../GameData/Tracks/',
    mapsDirectory: '',
    stadiumOnly: undefined as boolean | undefined,
    preloadMaps: 5,
  },
  splitBy: 2000,
  updateMatchSettingsOnChange: false,
  roundsModePointSystem: [33, 29, 27, 25, 23, 21, 19, 17, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  defaultTimeAttackTimeLimit: 300000,
  dynamicTimerSubtractionLimit: 30000,
  callVoteRatio: -1,
  blacklistFile: 'blacklist.txt',
  guestlistFile: 'guestlist.txt',
  matchSettingsFile: 'MatchSettings/MatchSettings.txt',
  defaultReasonMessage: 'No reason specified',
  truthyParams: ['true', 'yes', 'y', '1'],
  falsyParams: ['false', 'no', 'n', '0'],
  searchOptions: {
    intraMode: 1,
    alpha: 'a-zа-яё',
  },
  matchStringCacheSize: 10000,
  matchStringReduxModeThreshold: 5000,
  customEnvironments: ['Highlands', 'NewSnowCar'],
})
