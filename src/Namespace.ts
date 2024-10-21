export { }
declare global {
  /** Global Trakman object providing methods to interact with controller */
  namespace tm {
    /** Controller map object */
    export interface Map {
      /** Map UID */
      readonly id: string
      /** Map name */
      readonly name: string
      /** Map file location (Relative to GameData/Tracks directory) */
      readonly fileName: string
      /** Map author login */
      readonly author: string
      /** Map environment ('Stadium', 'Island', etc.) */
      readonly environment: Environment
      /** Map mood ('Sunrise', 'Night', etc.) */
      readonly mood: Mood
      /** Bronze medal time */
      readonly bronzeTime: number
      /** Silver medal time */
      readonly silverTime: number
      /** Gold medal time */
      readonly goldTime: number
      /** Author medal time */
      readonly authorTime: number
      /** Coppers "price" of the map */
      readonly copperPrice: number
      /** Whether the map is multilap */
      readonly isLapRace: boolean
      /** Date on which the map got added to the controller database */
      readonly addDate: Date
      /** Whether the map is made by Nadeo */
      isNadeo: boolean
      /** Whether the map is an TMX classic */
      isClassic: boolean
      /** Amount of karma votes for the map */
      voteCount: number
      /** Map karma vote ratio (0 to 100) */
      voteRatio: number
      /** Default amount of laps (different amounts can be set using server call) (undefined if the map was never played) */
      defaultLapsAmount?: number
      /** Amount of checkpoints per lap (undefined if the map was never played) */
      checkpointsPerLap?: number
      /** Map TMX leaderboard rating (undefined if the map was never fetched from TMX) */
      leaderboardRating?: number
      /** Map TMX awards (undefined if the map was never fetched from TMX) */
      awards?: number
    }
    /** TM Server Challenge return type */
    export interface ServerMap {
      Name: string,
      UId: string,
      FileName: string,
      Environnement: string,
      Author: string,
      GoldTime: number,
      CopperPrice: number,
      Mood?: string,
      BronzeTime?: number,
      SilverTime?: number,
      AuthorTime?: number,
      NbLaps?: number
    }
    /** Controller online player object */
    export interface Player {
      /** 
       * Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250, inclusive (0 is the server account).
       */
      readonly id: number
      /** Player login */
      readonly login: string
      /** Player nickname */
      readonly nickname: string
      /** Player country ('France', 'Poland', etc.) */
      readonly country: string
      /** 3 letter country code ('POL', 'FRA', etc.) */
      readonly countryCode: string
      /** Player region eg. Russia|Moscow, Serbia|Beograd */
      readonly region: string
      /** Player total playtime (doesn't include current session) */
      readonly timePlayed: number
      /** Player server join timestamp */
      readonly joinTimestamp: number
      /** Current player checkpoint times */
      readonly currentCheckpoints: Checkpoint[]
      /** Player server visit count */
      readonly visits: number
      /** Player ip address */
      readonly ip: string
      /** Whether player account is United */
      readonly isUnited: boolean
      /** Player ladder points */
      readonly ladderPoints: number
      /** Player ladder rank */
      readonly ladderRank: number
      /** Player last leave date (undefined if the player never visited the server before) */
      readonly lastOnline?: Date
      /** Player title ('Player', 'Admin', etc.) */
      title: string
      /** Player wins count */
      wins: number
      /** Player privilege level */
      privilege: number
      /** Whether the player is in the spectator mode */
      isSpectator: boolean
      /** True if the player is in non-temporary spectator mode and has a player slot */
      isPureSpectator: boolean
      /** Whether the player is in spectator mode temporarily (eg. result screen, inbetween rounds) */
      isTemporarySpectator: boolean
      /** Whether the player has a player slot 
       * (player slot is needed to switch to player mode, it's automatically assigned if the server is not full) */
      hasPlayerSlot: boolean
      /** Player server rank (undefined if the player doesn't have any record) */
      rank?: number
      /** Player average server map rank */
      average: number
      /** Player team (Teams mode only) */
      team?: 'red' | 'blue'
      /** Player rounds points sum (Cup and Rounds mode only) */
      roundsPoints: number
      /** Player round finish times (Cup, Rounds and Teams mode only) (-1 if the player didn't finish the round) */
      roundTimes: number[]
      /** Player cup winner position (Cup mode only) */
      cupPosition?: number
      /** Whether the player is a cup finalist (Cup mode only) (Winners are not finalists) */
      isCupFinalist: boolean
    }
    /** Controller offline player object */
    export interface OfflinePlayer {
      /** Player login */
      readonly login: string
      /** Player nickname */
      readonly nickname: string
      /** Player country ('France', 'Poland', etc.) */
      readonly country: string
      /** 3 letter country code ('POL', 'FRA', etc.) */
      readonly countryCode: string
      /** Player region eg. Russia|Moscow, Serbia|Beograd */
      readonly region: string
      /** Player total playtime (doesn't include current session) */
      readonly timePlayed: number
      /** Player server visit count */
      readonly visits: number
      /** Whether player account is United */
      readonly isUnited: boolean
      /** Player wins count */
      readonly wins: number
      /** Player privilege level */
      readonly privilege: number
      /** Player last leave date (undefined if the player never visited the server before) */
      readonly lastOnline?: Date
      /** Player server rank (undefined if the player doesn't have any record) */
      readonly rank?: number
      /** Player average server map rank */
      readonly average: number
    }
    /** Trackmania dedicated server call parameters */
    export interface CallParams {
      string?: string
      int?: number,
      double?: number,
      boolean?: boolean,
      struct?: {
        [key: string]: CallParams
      },
      base64?: string,
      array?: CallParams[]
    }
    /** Trackmania dedicated server call object */
    export interface Call {
      /** Dedicated server method name */
      readonly method: string
      /** Call parameters */
      readonly params?: CallParams[]
    }
    /** Controller command object */
    export interface Command {
      /** Aliases that can be used to call the command in the chat */
      readonly aliases: string[]
      /** Short command description */
      readonly help?: string
      /** Command parameters */
      readonly params?: {
        /** Parameter name */
        readonly name: string,
        /** Parameter data type */
        readonly type?: CommandParameterType,
        /** If set only the given values will be considered valid */
        readonly validValues?: (string | number)[]
        /** Whether the parameter is optional or not */
        readonly optional?: true
      }[]
      /** Callback function to execute on command call */
      readonly callback: (info: MessageInfo & { aliasUsed: string }, ...params: any[]) => void
      /** Player privilege required to call the command */
      readonly privilege: number,
      /** Whether the command is usable by players currently in the mutelist */
      readonly disableForMuted?: boolean
    }
    /** Controller ban object */
    export interface BanlistEntry {
      /** Banned player ip */
      readonly ip: string
      /** Banned player login */
      readonly login: string
      /** Banned player nickname (undefined if the player is not in the database) */
      nickname: string | undefined
      /** Date of the ban */
      date: Date
      /** Login of the admin who banned the player */
      callerLogin: string
      /** Nickname of the admin who banned the player */
      callerNickname: string
      /** Ban reason (undefined if wasn't specified) */
      reason: string | undefined
      /** Ban expire date (undefined if wasn't specified) */
      expireDate: Date | undefined
    }
    /** Controller blacklist object */
    export interface BlacklistEntry {
      /** Blacklisted player login */
      readonly login: string
      /** Blacklisted player nickname (undefined if the player is not in the database) */
      nickname: string | undefined
      /** Date on which the player got blacklisted */
      date: Date
      /** Login of the admin who blacklisted the player */
      callerLogin: string
      /** Nickname of the admin who blacklisted the player */
      callerNickname: string
      /** Blacklist reason (undefined if wasn't specified) */
      reason: string | undefined
      /** Blacklist expire date (undefined if wasn't specified) */
      expireDate: Date | undefined
    }
    /** Controller mute object */
    export interface MutelistEntry {
      /** Muted player login */
      readonly login: string
      /** Muted player nickname (undefined if the player is not in the database) */
      nickname: string | undefined
      /** Date of the mute */
      date: Date
      /** Login of the admin who muted the player */
      callerLogin: string
      /** Nickname of the admin who muted the player */
      callerNickname: string
      /** Mute reason (undefined if wasn't specified) */
      reason: string | undefined
      /** Mute expire date (undefined if wasn't specified) */
      expireDate: Date | undefined
    }
    /** Controller guest object */
    export interface GuestlistEntry {
      /** Guest login */
      readonly login: string
      /** Guest nickname (undefined if the player is not in the database) */
      nickname: string | undefined
      /** Date on which the guest got added */
      date: Date
      /** Login of the admin who added the guest */
      callerLogin: string
      /** Nickname of the admin who added the guest */
      callerNickname: string
    }

    /** Controller privilege object */
    export interface PrivilegeEntry {
      /** Privileges table login */
      readonly login: string
      /** Privileges table privilege */
      readonly privilege: number
    }

    /** Controller checkpoint object */
    export interface Checkpoint {
      /** Checkpoint index */
      readonly index: number
      /** Checkpoint time */
      readonly time: number
      /** Checkpoint lap */
      readonly lap: number
      /** Checkpoint time in the current lap (Multilap maps only) */
      readonly lapCheckpointTime: number
      /** Checkpoint index in the current lap (Multilap maps only) */
      readonly lapCheckpointIndex: number
      /** Whether the checkpoint is a finish (Multilap maps only) 
       * (Actual race finish is not counted as a checkpoint) */
      readonly isLapFinish: boolean
    }
    /** Controller chat message object */
    export interface Message {
      /** Player login */
      readonly login: string
      /** Player login */
      readonly nickname: string
      /** Message text */
      readonly text: string
      /** Message date */
      readonly date: Date
    }
    /** Controller player record object */
    export interface Record {
      /** Map UID */
      readonly map: string
      /** Player login */
      readonly login: string
      /** Finish time */
      readonly time: number
      /** Record date */
      readonly date: Date
      /** Checkpoint times */
      readonly checkpoints: number[]
      /** Player nickname */
      nickname: string
    }
    /** Controller karma map vote object */
    export interface Vote {
      /** Map UID */
      readonly mapId: string
      /** Player login */
      readonly login: string
      /** Vote value */
      vote: -3 | -2 | -1 | 1 | 2 | 3
      /** Vote date */
      date: Date
    }
    /** TMX map object */
    export interface TMXMap {
      /** Map UID */
      readonly id: string
      /** Map TMX ID */
      readonly TMXId: number
      /** Map name */
      readonly name: string
      /** Map author TMX ID */
      readonly authorId: number
      /** Map author login */
      readonly author: string
      /** Date on which the map was uploaded to TMX */
      readonly uploadDate: Date
      /** Date on which the current version of the map was uploaded to TMX */
      readonly lastUpdateDate: Date
      /** TMX map type ('Race', 'Stunts', etc.) */
      readonly type: string
      /** Map environment ('Stadium', 'Island', etc.) */
      readonly environment: Environment
      /** Map mood ('Sunrise, 'Night', etc.) */
      readonly mood: Mood
      /** Map TMX style (eg. Full Speed, LOL) */
      readonly style: string
      /** Map TMX routes (Single, Multi, Symmetrical) */
      readonly routes: string
      /** Map TMX difficulty ('Beginner', 'Expert', etc.) */
      readonly difficulty: TMXDifficulty
      /** Map TMX leaderboard rating */
      readonly leaderboardRating: number
      /** Map TMX game, the version of the game the map was built in, eg. TMUF, TMNF etc. */
      readonly game: string
      /** Map TMX comment */
      readonly comment: string
      /** Number of TMX player comments for the map */
      readonly commentsAmount: number
      /** Map TMX awards count */
      readonly awards: number
      /** Map TMX page url */
      readonly pageUrl: string
      /** Map TMX screenshot url */
      readonly screenshotUrl: string
      /** Map TMX thumbnail url */
      readonly thumbnailUrl: string
      /** Map file download url */
      readonly downloadUrl: string
      /** Whether the map is an TMX classic */
      readonly isClassic: boolean
      /** Whether the map is made by Nadeo */
      readonly isNadeo: boolean
      /** Map TMX replays (includes replays from previous versions of the map) */
      readonly replays: TMXReplay[]
      /** Map TMX valid replays (only ones driven on current version of the map) */
      readonly validReplays: TMXReplay[]
      /** Author medal time */
      readonly authorTime: number
      /** Author score (Stunts Mode) */
      readonly authorScore?: number
    }
    /** TMX replay object */
    export interface TMXReplay {
      /** TMX replay ID */
      readonly id: number
      /** Player TMX ID */
      readonly userId: number
      /** Player TMX name */
      readonly name: string
      /** Finish time */
      readonly time: number
      /** Replay score (Stunts Mode) */
      readonly score?: number
      /** Record date */
      readonly recordDate: Date
      /** Date on which the map version the replay was driven on was uploaded to TMX */
      readonly mapDate: Date
      /** Replay TMX leaderobard score */
      readonly leaderboardScore: number
      /** Replay file download url */
      readonly url: string
    }
    /** TMX map search result object */
    export interface TMXSearchResult {
      /** Map UID */
      readonly id: string
      /** Map TMX ID */
      readonly TMXId: number
      /** Map name */
      readonly name: string
      /** Map author TMX ID */
      readonly authorId: number
      /** Map author login */
      readonly author: string
      /** Date on which the map was uploaded to TMX */
      readonly uploadDate: Date
      /** Date on which the current version of the map was uploaded to TMX */
      readonly lastUpdateDate: Date
      /** TMX map type ('Race', 'Stunts', etc.) */
      readonly type: string
      /** Map environment ('Stadium', 'Island', etc.) */
      readonly environment: Environment
      /** Map mood ('Sunrise, 'Night', etc.) */
      readonly mood: Mood
      /** Map TMX style (eg. Full Speed, LOL) */
      readonly style: string
      /** Map TMX routes (Single, Multi, Symmetrical) */
      readonly routes: string
      /** Map TMX difficulty ('Beginner', 'Expert', etc.) */
      readonly difficulty: TMXDifficulty
      /** Map TMX game, the version of the game the map was built in, eg. TMUF, TMNF etc. */
      readonly game: string
      /** Map TMX comment */
      readonly comment: string
      /** Number of TMX player comments for the map */
      readonly commentsAmount: number
      /** Map TMX awards count */
      readonly awards: number
      /** Map TMX page url */
      readonly pageUrl: string
      /** Map TMX screenshot url */
      readonly screenshotUrl: string
      /** Map TMX thumbnail url */
      readonly thumbnailUrl: string
      /** Map file download url */
      readonly downloadUrl: string
      /** Bronze medal time */
      readonly bronzeTime: number
      /** Silver medal time */
      readonly silverTime: number
      /** Gold medal time */
      readonly goldTime: number
      /** Author medal time */
      readonly authorTime: number
      /** Author score (Stunts Mode) */
      readonly authorScore?: number
      /** Map vehicle */
      readonly car: string
    }
    /** Server information object */
    export interface ServerInfo {
      /** The server name */
      name: string
      /** The server comment */
      comment: string
      /** The server player password */
      password: string
      /** The server spectator password */
      passwordForSpectator: string
      /** Current round max players amount */
      currentMaxPlayers: number
      /** Next round max players amount */
      nextMaxPlayers: number
      /** Current round max spectators amount */
      currentMaxSpectators: number
      /** Next round max spectators amount */
      nextMaxSpectators: number
      /** Whether peer-to-peer upload is enabled */
      isP2PUpload: boolean
      /** Whether peer-to-peer download is enabled */
      isP2PDownload: boolean
      /** Current round ladder mode (1 = Enabled, 0 = Disabled) */
      currentLadderMode: number
      /** Next round ladder mode (1 = Enabled, 0 = Disabled) */
      nextLadderMode: number
      /** Current round vehicle quality (1 = Good, 0 = Bad) */
      currentVehicleNetQuality: number
      /** Next round vehicle quality (1 = Good, 0 = Bad) */
      nextVehicleNetQuality: number
      /** Current round callvote timeout time */
      currentCallVoteTimeOut: number
      /** Next round callvote timeout time */
      nextCallVoteTimeOut: number
      /** Current callvote ratio */
      callVoteRatio: number
      /** Whether map downloads are enabled */
      allowMapDownload: boolean
      /** Whether replay autosaving is enabled */
      autoSaveReplays: boolean
      /** The server account login */
      login: string
      /** The server account ID, always 0 */
      id: number
      /** The server account zone (region) */
      zone: string
      /** The server public IP address */
      ipAddress: string
      /** Whether the server account is paid (has the key specified in config) */
      isUnited: boolean
      /** Dedicated server game version (for TMF, this is always TmForever) */
      game: string
      /** Dedicated server executable version (for TMF, the latest version is v2011-02-21) */
      version: string
      /** Dedicated server executable build (for TMF, the latest build is 2.11.26) */
      build: string
    }
    /** Object containing Trackmania coppers bill state information. Created and emitted on the BillUpdated event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export interface BillUpdatedInfo {
      /** Bill ID */
      readonly id: number
      /** Bill state ID */
      readonly state: number
      /** Bill state name */
      readonly stateName: string
      /** Transaction ID */
      readonly transactionId: number
    }
    /** Object containing player state information. Created and emitted on the PlayerInfoChanged event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export interface InfoChangedInfo {
      /** Player login */
      readonly login: string
      /** Player nickname */
      readonly nickname: string
      /** Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250, inclusive (0 is the server account). */
      readonly id: number
      /** Possibly leftover from earlier versions? Usually undefined or 0. */
      readonly teamId: number
      /** Player ladder rank */
      readonly ladderRanking: number
      /** Player forcespec mode (0 - not forced, 1 - forcespec, 2 - forceplay) */
      readonly forceSpectator: number
      /** Whether the player */
      readonly isReferee: boolean
      /** True if the player pressed delete/backspace in result screen. Pressing it again makes it false */
      readonly isPodiumReady: boolean
      /** Whether the player is using 3D mode */
      readonly isUsingStereoscopy: boolean
      /** Related to relay servers, unsupported */
      readonly isManagedByOtherServer: boolean
      /** Whether the player is ... the server ..? */
      readonly isServer: boolean
      /** Whether the player has a reserved player slot */
      readonly hasPlayerSlot: boolean
      /** Whether the player is a spectator */
      readonly isSpectator: boolean
      /** Whether the player is in spectator mode temporarily (eg. result screen, inbetween rounds) */
      readonly isTemporarySpectator: boolean
      /** True if the player is in non-temporary spectator mode and has a player slot */
      readonly isPureSpectator: boolean
      /** Whether the player has autotarget enabled in spec-mode */
      readonly autoTarget: boolean
      /** Identifier of the player currently being watched by the spectator */
      readonly currentTargetId: number
    }
    /** Object containing player controller privilege information. Created and emitted on the PrivilegeChange event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export interface PrivilegeChangedInfo {
      /** Player object (undefined if the player is not in the database) */
      readonly player?: OfflinePlayer
      /** Player login */
      readonly login: string
      /** New player privilege level */
      readonly newPrivilege: number
      /** Previous player privilege level */
      readonly previousPrivilege: number
      /** Object containing information about player who changed the privilege (undefined if not specified) */
      readonly caller?: {
        /** Caller player login */
        readonly login: string,
        /** Caller player nickname */
        readonly nickname: string
      }
    }
    /** Object containing map karma vote information. Created and emitted on the KarmaVote event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export interface KarmaVoteInfo {
      /** Map UID */
      readonly mapId: string
      /** Player login */
      readonly login: string
      /** Vote value */
      readonly vote: -3 | -2 | -1 | 1 | 2 | 3
      /** Vote date */
      readonly date: Date
    }
    /** Controller event listener object */
    export interface Listener {
      /** Event name or an array of event names */
      readonly event: (keyof Events) | (keyof Events)[]
      /** Callback function to execute on the event */
      readonly callback: ((params: any) => void)
    }
    /** Game information object */
    export interface GameInfo {
      /** Current server gamemode (Rounds (0), TimeAttack (1), Team (2), Laps (3), Stunts (4), Cup (5)) */
      gameMode: number
      /** Amount of time (in msec) to be spent at scoretable */
      resultTime: number
      /** Index of the currently played map */
      mapIndex: number
      /** Points system type used in Rounds mode.
       *  The controller always uses a custom point system, with "new" limit **/
      roundsPointSystemType: 'new' | 'old'
      /** Amount of points to end the map in rounds mode when using the "old" point system type.
       *  The controller always uses a custom point system, with "new" limit **/
      roundsPointLimitOld: number
      /** Amount of points to end the map in rounds mode when using the "new" point system type.
       *  The controller always uses a custom point system, with "new" limit **/
      roundsPointLimitNew: number
      /** Amount of forced laps in Rounds mode */
      roundsModeLapsAmount: number
      /** Amount of time (in msec) to be spent in race */
      timeAttackLimit: number
      /** Amount of time (in msec) to be added to the start countdown */
      countdownAdditionalTime: number
      /** Points system type used in Rounds mode.
       *  The controller always uses a custom point system, with "new" limit */
      teamPointSystemType: 'new' | 'old'
      /** Amount of points to end the map in teams mode when using the "old" point system type.
       *  The controller always uses the "new" point system **/
      teamPointLimitOld: number
      /** Amount of points to end the map in teams mode when using the "new" point system type.
       *  The controller always uses the "new" point system **/
      teamPointLimitNew: number
      /** Maximum amount of points that a team can get in one round when using the "old" point system.
       *  The controller always uses the "new" point system */
      teamMaxPoints: number
      /** Amount of laps in Laps mode */
      lapsModeLapsAmount: number
      /** Laps mode time limit (no time limit if set to 0) */
      lapsModeTimeLimit: number
      /** Amount of time left for players to finish the track after the leader in rounds-based gamemodes */
      finishTimeout: number
      /** Duration of the warm-up in all modes */
      warmUpDuration: number
      /** Whether disabled respawning on checkpoints is active */
      disableRespawn: boolean
      /** Whether force display of all opponents is enabled */
      forceShowOpponents: boolean
      /** Amount of points to become a finalist in Cup mode */
      cupPointsLimit: number
      /** Amount of times the map will be replayed until skip in Cup mode */
      cupRoundsPerMap: number
      /** Amount of winners in Cup mode */
      cupWinnersAmount: number
      /** Warm-up rounds count in Cup mode */
      cupWarmUpRounds: number
    }
    /** Object containing player information. Created and emitted on the PlayerDataUpdated event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export interface PlayerDataUpdatedInfo {
      /** Player login */
      readonly login: string,
      /** Player nickname (undefined if wasn't changed) */
      readonly nickname?: string,
      /** Player controller title ('Player', 'Admin', etc.) (undefined if wasn't changed) */
      readonly title?: string,
      /** Object containing player country information (undefined if wasn't changed) */
      readonly country?: {
        /** Player country ('France', 'Poland', etc.) */
        readonly name: string
        /** 3 letter country code ('POL', 'FRA', etc.) */
        readonly code: string
        /** Player region eg. Russia|Moscow, Serbia|Beograd */
        readonly region: string
      }
    }
    /** Map object received from certain dedicated server callbacks and methods */
    export interface TrackmaniaMapInfo {
      /** Map UID */
      readonly Uid: string;
      /** Map name */
      readonly Name: string;
      /** Map file location (Relative to GameData/Tracks directory) */
      readonly FileName: string;
      /** Map author login */
      readonly Author: string;
      /** Map environment ('Stadium', 'Island', etc.) */
      readonly Environnement: string;
      /** Map mood ('Sunrise, 'Night', etc.) */
      readonly Mood: string;
      /** Bronze medal time */
      readonly BronzeTime: number;
      /** Silver medal time */
      readonly SilverTime: number;
      /** Gold medal time */
      readonly GoldTime: number;
      /** Author medal time */
      readonly AuthorTime: number;
      /** Coppers "price" of the map */
      readonly CopperPrice: number;
      /** Whether the map is multilap */
      readonly LapRace: boolean;
      /** Amount of laps (certain methods (eg. GetChallengeInfo, GetNextChallengeInfo) return -1 here for some reason) */
      readonly NbLaps: number;
      /** Amount of checkpoints (certain methods (eg. GetChallengeInfo, GetNextChallengeInfo) return -1 here for some reason) */
      readonly NbCheckpoints: number;
    }
    /** Ranking object received from EndChallenge and EndRace dedicated server callbacks */
    export interface TrackmaniaRankingInfo {
      /** Player login */
      readonly Login: string;
      /** Player nickname */
      readonly NickName: string;
      /** 
       * Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250, inclusive (0 is the server account).
       */
      readonly PlayerId: number;
      /** Rank on the last race */
      readonly Rank: number;
      /** Player best finish time */
      readonly BestTime: number;
      /** Player checkpoints in the best run */
      readonly BestCheckpoints: number[];
      /** Player best Stunts Mode score */
      readonly Score: number;
      /** Amount of finished laps */
      readonly NbrLapsFinished: number;
      /** Player ladderpoints amount */
      readonly LadderScore: number;
    }
    /** Player object received from certain dedicated server callbacks and methods */
    export interface TrackmaniaPlayerInfo {
      /** Player login */
      readonly Login: string;
      /** Player nickname */
      readonly NickName: string;
      /** 
       * Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250, inclusive (0 is the server account).
       */
      readonly PlayerId: number;
      /** Possibly leftover from earlier versions? Usually undefined or 0. */
      readonly TeamId: number;
      /** Integer representing the player spectator status .
       * (isSpectator + isTemporarySpectator * 10 + isPureSpectator * 100 + 
       * autoTarget * 1000 + currentTargetId * 10000) 
       */
      readonly SpectatorStatus: number;
      /** Player ladder ranking */
      readonly LadderRanking: number;
      /** Integer representing player status.
       * (forceSpectator + isReferee * 10 + isPodiumReady * 100 +
       * isUsingStereoscopy * 1000 + isManagedByAnOtherServer * 10000 +
       * isServer * 100000 + hasPlayerSlot * 1000000)
       */
      readonly Flags: number;
    }
    /** Object containing event names and types that get passed as parameters */
    export interface Events {
      "*": { event: keyof Events, params: any }
      "Startup": 'result' | 'race'
      "ServerStateChanged": ServerState
      "PlayerChat": MessageInfo
      "PlayerJoin": JoinInfo
      "PlayerLeave": LeaveInfo
      "LocalRecord": RecordInfo
      "PlayerFinish": FinishInfo
      "LiveRecord": FinishInfo
      "PlayerInfoChanged": InfoChangedInfo
      "ManialinkClick": ManialinkClickInfo
      "PlayerCheckpoint": CheckpointInfo
      "BeginMap": BeginMapInfo
      "EndMap": EndMapInfo
      "KarmaVote": readonly KarmaVoteInfo[]
      "RecordsPrefetch": readonly Readonly<Record>[]
      "VotesPrefetch": readonly Readonly<Vote>[]
      "MapAdded": MapAddedInfo | MapAddedInfo[]
      "MapRemoved": MapRemovedInfo | MapRemovedInfo[]
      "BillUpdated": BillUpdatedInfo
      "MatchSettingsUpdated": readonly Readonly<Map>[]
      "PrivilegeChanged": PrivilegeChangedInfo
      "LocalRecordsRemoved": readonly Readonly<Record>[]
      "JukeboxChanged": readonly Readonly<Map>[]
      "RanksAndAveragesUpdated": readonly Readonly<{ login: string, average: number }>[]
      "Ban": Readonly<BanlistEntry>
      "Unban": Readonly<BanlistEntry>
      "Blacklist": Readonly<BlacklistEntry>
      "Unblacklist": Readonly<BlacklistEntry>
      "Mute": Readonly<MutelistEntry>
      "Unmute": Readonly<MutelistEntry>
      "AddGuest": Readonly<GuestlistEntry>
      "RemoveGuest": Readonly<GuestlistEntry>
      "PlayerDataUpdated": readonly PlayerDataUpdatedInfo[]
      "DynamicTimerStateChanged": 'enabled' | 'disabled'
      "BeginRound": Readonly<FinishInfo>[]
      "EndRound": Readonly<FinishInfo>[]
      "GameConfigChanged": Readonly<GameInfo>
      "ServerConfigChanged": Readonly<ServerInfo>
      "PlayerLap": Readonly<LapFinishInfo>
      "LapRecord": Readonly<LapRecordInfo>
      "TrackMania.PlayerConnect": readonly [string, boolean]
      "TrackMania.PlayerDisconnect": string
      "TrackMania.PlayerChat": readonly [number, string, string, boolean]
      "TrackMania.PlayerCheckpoint": readonly [number, string, number, number, number]
      "TrackMania.PlayerFinish": readonly [number, string, number]
      "TrackMania.BeginRace": TrackmaniaMapInfo
      "TrackMania.EndRace": readonly [readonly TrackmaniaRankingInfo[], TrackmaniaMapInfo]
      "TrackMania.BeginRound": void
      "TrackMania.EndRound": void
      "TrackMania.BeginChallenge": readonly [TrackmaniaMapInfo, boolean, boolean]
      "TrackMania.EndChallenge": readonly [readonly TrackmaniaRankingInfo[], TrackmaniaMapInfo, boolean, boolean, boolean]
      "TrackMania.StatusChanged": readonly [number, string]
      "TrackMania.PlayerManialinkPageAnswer": readonly [number, string, number]
      "TrackMania.BillUpdated": readonly [number, number, string, number]
      "TrackMania.ChallengeListModified": readonly [number, number, boolean]
      "TrackMania.PlayerInfoChanged": TrackmaniaPlayerInfo
      "TrackMania.PlayerIncoherence": readonly [number, string]
      "TrackMania.Echo": readonly [string, string]
      "TrackMania.VoteUpdated": readonly [string, string, string, string]
    }
    /** Object containing player information. Created and emitted on the PlayerJoin event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type JoinInfo = Readonly<Omit<Player, 'currentCheckpoints'>>
    /** Object containing map information. Created and emitted on the EndMap event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type EndMapInfo = Readonly<CurrentMap> & {
      /** Map local records */
      readonly localRecords: Readonly<Readonly<LocalRecord>[]>
      /** Map live records */
      readonly liveRecords: Readonly<Readonly<FinishInfo>[]>
      /** Whether the last round played was a warm-up */
      readonly wasWarmUp: boolean
      /** Whether the point amounts from the last map will be preserved (Cup mode only) */
      readonly continuesOnNextMap: boolean
      /** Login of the winner */
      readonly winnerLogin?: string
      /** Amount of wins of the winner */
      readonly winnerWins?: number,
      /** Whether the map was restarted using dedicated server call */
      readonly isRestart: boolean
      /** Server side ranking objects. 
       * (Can differ from controller rankings only if it was restarted during the map) */
      readonly serverSideRankings: readonly TrackmaniaRankingInfo[]
      /** If keep queue after leave is set to false, this is the object that stores the dropped map 
       * This is the exact copy of the JukeboxMap interface off of MapService */
      readonly droppedMap?: {
        /** The dropped map object */
        map: Map
        /** Login of the player who juked the map */
        callerLogin: string
      }
    }
    /** Object containing map information. Created and emitted on the BeginMap event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type BeginMapInfo = Readonly<CurrentMap> & {
      /** Whether the map was restarted using dedicated server call */
      readonly isRestart: boolean
    }
    /** Controller current map object */
    export type CurrentMap = Map & {
      /** Default amount of laps (may be incoherent with actual laps amount if it's modified using dedicated server call) */
      readonly defaultLapsAmount: number
      /** Current amount of laps depending on dedicated server config and map default laps */
      readonly lapsAmount: number
      /** Amount of checkpoints per lap (includes finish) */
      readonly checkpointsPerLap: number
      /** Total amount of checkpoints depending on map checkpoints per lap and laps amount (includes finish) */
      readonly checkpointsAmount: number
      /** Whether the map is in laps mode (always false in TimeAttack and Stunts, true in other gamemodes if map has multilap start) */
      readonly isInLapsMode: boolean
      /** Whether the laps amount was modified by dedicated server calls (always false in TimeAttack, Stunts always true in Laps) */
      readonly isLapsAmountModified: boolean
    }
    /** Controller local record object */
    export type LocalRecord = Record & OfflinePlayer
    /** Object containing player checkpoint information. Created and emitted on the PlayerCheckpoint event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type CheckpointInfo = Checkpoint & {
      /** Player object */
      readonly player: Player
    }
    /** Object containing player finish information. Created and emitted on the PlayerFinish and LiveRecord events https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type FinishInfo = Omit<Player & LocalRecord & {
      /** Amount of round points acquired by the player in the current round (Rounds/Cup/Teams mode only) */
      readonly roundPoints?: number
    },
      'currentCheckpoints' | 'isSpectator' | 'date' | 'isTemporarySpectator' | 'isPureSpectator'>
    /** Object containing player information. Created and emitted on the PlayerLeave event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type LeaveInfo = Omit<Player, 'lastOnline'> & {
      /** Amount of time the player spent on the server in the current session */
      readonly sessionTime: number
      /** Player wins count */
      readonly wins: number
      /** Player privilege level */
      readonly privilege: number
      /** Whether the player was in the spectator mode */
      readonly isSpectator: boolean
    }
    /** Object containing manialink click information. Created and emitted on the ManialinkClick event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type ManialinkClickInfo = Player & {
      /** Clicked manialink action ID */
      readonly actionId: number
    }
    /** Object containing map information. Created and emitted on the MapAdded event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type MapAddedInfo = Map & {
      /** Login of the player who added the map */
      readonly callerLogin?: string
    }
    /** Object containing map information. Created and emitted on the MapRemoved event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type MapRemovedInfo = Map & {
      /** Login of the player who removed the map */
      readonly callerLogin?: string
    }
    /** Object containing player record information. Created and emitted on the MapRemoved event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type RecordInfo = Omit<Player & LocalRecord & {
      /** Player rank in the local records leaderboard */
      readonly position: number
      /** Player previous local record info (undefined if the player didn't have a local record on the map) */
      readonly previous?: {
        /** Previous player rank in the local records leaderboard */
        readonly position: number,
        /** Previous player local record time */
        readonly time: number
      }
    }, 'currentCheckpoints' | 'isSpectator' | 'isTemporarySpectator' | 'isPureSpectator'>
    /** Object containing player lap finish information. Created and emitted on the PlayerLap event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type LapFinishInfo = Readonly<FinishInfo & {
      /** Whether the lap was the finish lap */
      readonly isFinish: boolean
    }>
    /** Object containing player lap record information. Created and emitted on the LapRecord event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type LapRecordInfo = Readonly<RecordInfo & {
      /** Whether the lap was the finish lap */
      readonly isFinish: boolean
    }>
    /** Object containing chat message information. Created and emitted on the PlayerChat event https://github.com/lythx/trakman/wiki/Controller-Events#events-list */
    export type MessageInfo = Message & Player
    /** Dedicated server state ('result', 'race', 'transition') */
    export type ServerState = 'result' | 'race' | 'transition'
    /** Server game mode ('TimeAttack', 'Rounds', 'Cup', 'Laps', 'Teams', 'Stunts') */
    export type GameMode = 'TimeAttack' | 'Rounds' | 'Cup' | 'Laps' | 'Teams' | 'Stunts'
    /** Map environment ('Stadium', 'Island', etc.) */
    export type Environment = 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
    /** Map mood ('Sunrise', 'Night', etc.) */
    export type Mood = 'Sunrise' | 'Day' | 'Sunset' | 'Night'
    /** Server command data type */
    export type CommandParameterType = 'int' | 'double' | 'boolean' | 'time' | 'player' | 'offlinePlayer' | 'multiword'
    /** TMX map difficulty ('Beginner', 'Expert', etc.) */
    export type TMXDifficulty = 'Beginner' | 'Intermediate' | 'Expert' | 'Lunatic'
    /** TMX site ('TMNF', 'TMU', etc.) */
    export type TMXSite = 'TMNF' | 'TMU' | 'TMN' | 'TMO' | 'TMS'
    /** TMX map routes ('Single', 'Multiple', 'Symmetrical') */
    export type TMXRoutes = 'Single' | 'Multiple' | 'Symmetrical'
    /** TMX map type ('Race', 'Puzzle', etc.) */
    export type TMXMapType = 'Race' | 'Puzzle' | 'Platform' | 'Stunts' | 'Shortcut' | 'Laps'
    /** TMX map car ('SnowCar', 'DesertCar', etc.) */
    export type TMXCar = 'SnowCar' | 'DesertCar' | 'RallyCar' | 'IslandCar' | 'CoastCar' | 'BayCar' | 'StadiumCar'
    /** TMX map style ('Normal', 'Stunt', etc.) */
    export type TMXStyle = 'Normal' | 'Stunt' | 'Maze' | 'Offroad' | 'Laps' | 'Fullspeed' | 'LOL' |
      'Tech' | 'SpeedTech' | 'RPG' | 'PressForward' | 'Trial' | 'Grass'
  }
}
