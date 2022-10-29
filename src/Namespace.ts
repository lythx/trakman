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
      readonly environment: 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
      /** Map mood ('Sunrise, 'Night', etc.) */
      readonly mood: 'Sunrise' | 'Day' | 'Sunset' | 'Night'
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
      /** Amount of laps (undefined if the map was never played) */
      lapsAmount?: number
      /** Amount of checkpoints (undefined if the map was never played) */
      checkpointsAmount?: number
      /** Map TMX leaderboard rating (undefined if the map was never fetched from TMX) */
      leaderboardRating?: number
      /** Map TMX awards (undefined if the map was never fetched from TMX) */
      awards?: number
    }
    /** Controller online player object */
    export interface Player {
      /** 
       * Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250 (0 is the server account).
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
      /** Player region eg. TODO */
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
      /** Player server rank (undefined if the player doesn't have any record) */
      rank?: number
      /** Player average server map rank */
      average: number
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
      /** Player region eg. TODO */
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
        /** Parameter type */
        readonly type?: 'int' | 'double' | 'boolean' | 'time' | 'player' | 'offlinePlayer' | 'multiword',
        /** If set only the given values will be considered valid */
        readonly validValues?: (string | number)[]
        /** Whether the parameter is optional or not */
        readonly optional?: true
      }[]
      /** Callback function to execute on command call */
      readonly callback: (info: MessageInfo & { aliasUsed: string }, ...params: any[]) => void
      /** Player privilege required to call the command */
      readonly privilege: number
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
    /** Controller checkpoint object */
    export interface Checkpoint {
      /** Checkpoint index */
      readonly index: number
      /** Checkpoint time */
      readonly time: number
      /** Checkpoint lap */
      readonly lap: number
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
      readonly environment: 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
      /** Map mood ('Sunrise, 'Night', etc.) */
      readonly mood: 'Sunrise' | 'Day' | 'Sunset' | 'Night'
      /** Map TMX style (TODO) */
      readonly style: string
      /** Map TMX routes (TODO) */
      readonly routes: string
      /** Map TMX length TODO */
      readonly length: string
      /** Map TMX difficulty ('Beginner', 'Expert', etc.) */
      readonly difficulty: 'Beginner' | 'Intermediate' | 'Expert' | 'Lunatic'
      /** Map TMX leaderboard rating */
      readonly leaderboardRating: number
      /** TODO */
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
    }
    /** TMX replay object */
    export interface TMXReplay {
      /** TODO */
      readonly id: number
      /** Player TMX ID */
      readonly userId: number
      /** Player TMX name */
      readonly name: string
      /** Finish time */
      readonly time: number
      /** Record date */
      readonly recordDate: Date
      /** Date on which the map version the replay was driven on was uploaded to TMX */
      readonly mapDate: Date
      /** TODO */
      readonly approved: any
      /** Replay TMX leaderobard score */
      readonly leaderboardScore: number
      /** TODO */
      readonly expires: any
      /** TODO */
      readonly lockspan: any
      /** Replay file download url */
      readonly url: string
    }
    // TODO
    export interface ServerInfo {
      name: string
      comment: string
      password: string
      passwordForSpectator: string
      currentMaxPlayers: number
      nextMaxPlayers: number
      currentMaxSpectators: number
      nextMaxSpectators: number
      isP2PUpload: boolean
      isP2PDownload: boolean
      currentLadderMode: number
      nextLadderMode: number
      currentVehicleNetQuality: number
      nextVehicleNetQuality: number
      currentCallVoteTimeOut: number
      nextCallVoteTimeOut: number
      callVoteRatio: number
      allowMapDownload: boolean
      autoSaveReplays: boolean
      login: string
      id: number
      zone: string
      ipAddress: string
      isUnited: boolean
      game: string
      version: string
      build: string
    }
    /** Object containing Trackmania coppers bill state information. Created and emitted on the TODO LINK BillUpdated event */
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
    /** Object containing player state information. Created and emitted on the PlayerInfoChanged event */
    export interface InfoChangedInfo {
      /** Player login */
      readonly login: string
      /** Player nickname */
      readonly nickname: string
      /** Player server ID (assigned by the dedicated server when the 
       * player connects). Ranges from 0 to 250 (0 is the server account). */
      readonly id: number
      /** TODO */
      readonly teamId: number
      /** Player ladder rank TODO maybe ladder points */
      readonly ladderRanking: number
      /** TODO */
      readonly forceSpectator: number
      readonly isReferee: boolean
      readonly isPodiumReady: boolean
      readonly isUsingStereoscopy: boolean
      readonly isManagedByOtherServer: boolean
      readonly isServer: boolean
      readonly hasPlayerSlot: boolean
      readonly isSpectator: boolean
      readonly isTemporarySpectator: boolean
      readonly isPureSpectator: boolean
      readonly autoTarget: boolean
      readonly currentTargetId: number
    }
    /** Object containing player controller privilege information. Created and emitted on the PrivilegeChange event */
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
    /** Object containing map karma vote information. Created and emitted on the KarmaVote event */
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
    // TODO
    export interface Game {
      gameMode: number
      resultTime: number // what the fuck is this
      mapIndex: number
      roundsPointsLimit: number
      roundsPointSystemType: boolean // or this
      roundsModeLapsAmount: number
      timeAttackLimit: number
      countdownAdditionalTime: number
      teamPointsLimit: number
      teamMaxPoints: number
      teamPointSystemType: boolean // or this
      lapsModeLapsAmount: number // or this
      lapsModeFinishTimeout: number
      roundsModeFinishTimeout: number
      warmUpDuration: number
      disableRespawn: boolean
      forceShowOpponents: boolean
      roundsPointLimitSystemType: number
      teamPointLimitSystemType: number
      cupPointsLimit: number
      cupRoundsPerMap: number
      cupWinnersAmount: number
      cupWarmUpDuration: number
    }
    // TODO
    export interface ServerInfo {
      name: string
      comment: string
      password: string
      passwordForSpectator: string
      currentMaxPlayers: number
      nextMaxPlayers: number
      currentMaxSpectators: number
      nextMaxSpectators: number
      isP2PUpload: boolean
      isP2PDownload: boolean
      currentLadderMode: number
      nextLadderMode: number
      currentVehicleNetQuality: number
      nextVehicleNetQuality: number
      currentCallVoteTimeOut: number
      nextCallVoteTimeOut: number
      callVoteRatio: number
      allowMapDownload: boolean
      autoSaveReplays: boolean
      login: string
      id: number
      zone: string
      ipAddress: string
      isUnited: boolean
      game: string
      version: string
      build: string
    }
    /** Object containing player information. Created and emitted on the PlayerDataUpdated event */
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
        /** Player region eg. TODO */
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
       * player connects). Ranges from 0 to 250 (0 is the server account).
       */
      readonly PlayerId: number;
      /** TODO */
      readonly Rank: number;
      /** Player best finish time TODO */
      readonly BestTime: number;
      /** Player checkpoint in the best run TODO */
      readonly BestCheckpoints: number[];
      /** TODO ???????? */
      readonly Score: number;
      /** TODO */
      readonly NbrLapsFinished: number;
      /** TODO */
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
       * player connects). Ranges from 0 to 250 (0 is the server account).
       */
      readonly PlayerId: number;
      /** TODO */
      readonly TeamId: number;
      /** TODO */
      readonly SpectatorStatus: number;
      /** TODO */
      readonly LadderRanking: number;
      /** TODO */
      readonly Flags: number;
    }
    /** TODO */
    export interface Events {
      "Startup": 'result' | 'race'
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
      "MapAdded": MapAddedInfo
      "MapRemoved": MapRemovedInfo
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
      "TrackMania.PlayerConnect": [string, boolean]
      "TrackMania.PlayerDisconnect": string
      "TrackMania.PlayerChat": [number, string, string, boolean]
      "TrackMania.PlayerCheckpoint": [number, string, number, number, number]
      "TrackMania.PlayerFinish": [number, string, number]
      "TrackMania.BeginRace": TrackmaniaMapInfo
      "TrackMania.EndRace": [readonly TrackmaniaRankingInfo[], TrackmaniaMapInfo]
      "TrackMania.BeginRound": void
      "TrackMania.EndRound": void
      "TrackMania.BeginChallenge": [TrackmaniaMapInfo, boolean, boolean]
      "TrackMania.EndChallenge": [readonly TrackmaniaRankingInfo[], TrackmaniaMapInfo, boolean, boolean, boolean]
      "TrackMania.StatusChanged": [number, string]
      "TrackMania.PlayerManialinkPageAnswer": [number, string, number]
      "TrackMania.BillUpdated": [number, number, string, number]
      "TrackMania.ChallengeListModified": [number, number, boolean]
      "TrackMania.PlayerInfoChanged": TrackmaniaPlayerInfo
      "TrackMania.PlayerIncoherence": [number, string]
      "TrackMania.Echo": [string, string]
      "TrackMania.VoteUpdated": [string, string, string, string]
    }
    /** Object containing player information. Created and emitted on the PlayerJoin event */
    export type JoinInfo = Readonly<Omit<Player, 'currentCheckpoints'>>
    /** Object containing map information. Created and emitted on the EndMap event */
    export type EndMapInfo = Readonly<CurrentMap> & {
      /** Map local records */
      readonly localRecords: Readonly<Readonly<LocalRecord>[]>
      /** Map live records */
      readonly liveRecords: Readonly<Readonly<FinishInfo>[]>
      /** TODO */
      readonly wasWarmUp: boolean
      /** TODO */
      readonly continuesOnNextMap: boolean
      /** Login of the winner */
      readonly winnerLogin?: string
      /** Amount of wins of the winner */
      readonly winnerWins?: number,
      /** Whether the map was restarted using dedicated server call */
      readonly isRestart: boolean
    }
    /** Object containing map information. Created and emitted on the BeginMap event */
    export type BeginMapInfo = Map & {
      /** Whether the map was restarted using dedicated server call */
      readonly isRestart: boolean
    }
    /** Controller current map object */
    export type CurrentMap = Map & {
      /** Amount of laps */
      readonly lapsAmount: number
      /** Amount of checkpoints */
      readonly checkpointsAmount: number
    }
    /** Controller local record object */
    export type LocalRecord = Record & OfflinePlayer
    /** Object containing player checkpoint information. Created and emitted on the PlayerCheckpoint event */
    export type CheckpointInfo = Checkpoint & {
      /** Player object */
      readonly player: Player
    }
    /** Object containing player finish information. Created and emitted on the PlayerFinish and LiveRecord events */
    export type FinishInfo = Omit<Player & LocalRecord, 'currentCheckpoints' | 'isSpectator' | 'date'>
    /** Object containing player information. Created and emitted on the PlayerLeave event */
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
    /** Object containing manialink click information. Created and emitted on the ManialinkClick event */
    export type ManialinkClickInfo = Player & {
      /** Clicked manialink action ID */
      readonly actionId: number
    }
    /** Object containing map information. Created and emitted on the MapAdded event */
    export type MapAddedInfo = Map & {
      /** Login of the player who added the map */
      readonly callerLogin?: string
    }
    /** Object containing map information. Created and emitted on the MapRemoved event */
    export type MapRemovedInfo = Map & {
      /** Login of the player who removed the map */
      readonly callerLogin?: string
    }
    /** Object containing player record information. Created and emitted on the MapRemoved event */
    export type RecordInfo = Omit<Player & LocalRecord & {
      /** Player rank in the local records leaderboard */
      readonly position: number
      /** Previous player rank in the local records leaderboard (TODO OPTIONAL) */
      readonly previousPosition: number
      /** Previous player local record time (TODO OPTIONAL) */
      readonly previousTime: number
    }, 'currentCheckpoints' | 'isSpectator'>
    /** Object containing chat message information. Created and emitted on the PlayerChat event */
    export type MessageInfo = Message & Player
    /** TMX site ('TMNF', 'TMU', etc.) */
    export type TMXSite = 'TMNF' | 'TMU' | 'TMN' | 'TMO' | 'TMS'
  }
}