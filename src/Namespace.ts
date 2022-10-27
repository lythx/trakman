export { }
declare global {
  namespace tm {
    export interface Map {
      readonly id: string
      readonly name: string
      readonly fileName: string
      readonly author: string
      readonly environment: 'Stadium' | 'Island' | 'Desert' | 'Rally' | 'Bay' | 'Coast' | 'Snow'
      readonly mood: 'Sunrise' | 'Day' | 'Sunset' | 'Night'
      readonly bronzeTime: number
      readonly silverTime: number
      readonly goldTime: number
      readonly authorTime: number
      readonly copperPrice: number
      readonly isLapRace: boolean
      readonly addDate: Date
      isNadeo: boolean
      isClassic: boolean
      voteCount: number
      voteRatio: number
      lapsAmount?: number
      checkpointsAmount?: number
      leaderboardRating?: number
      awards?: number
    }
    export interface Player {
      readonly id: number
      readonly login: string
      readonly nickname: string
      readonly country: string
      readonly countryCode: string
      readonly region: string
      readonly timePlayed: number
      readonly joinTimestamp: number
      readonly currentCheckpoints: Checkpoint[]
      readonly visits: number
      readonly ip: string
      readonly isUnited: boolean
      readonly ladderPoints: number
      readonly ladderRank: number
      readonly lastOnline?: Date
      title: string
      wins: number
      privilege: number
      isSpectator: boolean
      rank?: number
      average: number
    }
    export interface OfflinePlayer {
      readonly login: string
      readonly nickname: string
      readonly country: string
      readonly countryCode: string
      readonly region: string
      readonly timePlayed: number
      readonly visits: number
      readonly isUnited: boolean
      readonly wins: number
      readonly privilege: number
      readonly lastOnline?: Date
      readonly rank?: number
      readonly average: number
    }
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
    export interface Call {
      readonly method: string
      readonly params?: CallParams[]
      readonly expectsResponse?: boolean
    }
    export interface Command {
      readonly aliases: string[]
      readonly help?: string
      readonly params?: {
        readonly name: string,
        readonly type?: 'int' | 'double' | 'boolean' | 'time' | 'player' | 'offlinePlayer' | 'multiword',
        readonly validValues?: (string | number)[]
        readonly optional?: true
      }[]
      readonly callback: (info: MessageInfo & { aliasUsed: string }, ...params: any[]) => void
      readonly privilege: number
    }
    export interface BanlistEntry {
      readonly ip: string
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface BlacklistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface MutelistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
      reason: string | undefined
      expireDate: Date | undefined
    }
    export interface GuestlistEntry {
      readonly login: string
      nickname: string | undefined
      date: Date
      callerLogin: string
      callerNickname: string
    }
    export interface Checkpoint {
      readonly index: number
      readonly time: number
      readonly lap: number
    }
    export interface Message {
      readonly login: string
      readonly nickname: string
      readonly text: string
      readonly date: Date
    }
    export interface Record {
      readonly map: string
      readonly login: string
      readonly time: number
      readonly date: Date
      readonly checkpoints: number[]
      nickname: string
    }
    export interface Vote {
      readonly mapId: string
      readonly login: string
      vote: -3 | -2 | -1 | 1 | 2 | 3
      date: Date
    }
    export interface TMXMap {
      readonly id: string
      readonly TMXId: number
      readonly name: string
      readonly authorId: number
      readonly author: string
      readonly uploadDate: Date
      readonly lastUpdateDate: Date
      readonly type: string
      readonly environment: string
      readonly mood: string
      readonly style: string
      readonly routes: string
      readonly length: string
      readonly difficulty: 'Beginner' | 'Intermediate' | 'Expert' | 'Lunatic'
      readonly leaderboardRating: number
      readonly game: string
      readonly comment: string
      readonly commentsAmount: number
      readonly awards: number
      readonly pageUrl: string
      readonly screenshotUrl: string
      readonly thumbnailUrl: string
      readonly downloadUrl: string
      readonly isClassic: boolean
      readonly isNadeo: boolean
      readonly replays: TMXReplay[]
      readonly validReplays: TMXReplay[]
    }
    export interface TMXReplay {
      readonly id: number
      readonly userId: number
      readonly name: string
      readonly time: number
      readonly recordDate: Date
      readonly mapDate: Date
      readonly approved: any
      readonly leaderboardScore: number
      readonly expires: any
      readonly lockspan: any
      readonly url: string
      login?: string
    }
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
    export interface BillUpdatedInfo {
      readonly id: number
      readonly state: number
      readonly stateName: string
      readonly transactionId: number
    }
    export interface InfoChangedInfo {
      readonly login: string
      readonly nickname: string
      readonly id: number
      readonly teamId: number
      readonly ladderRanking: number
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
    export interface PrivilegeChangedInfo {
      readonly player?: OfflinePlayer
      readonly login: string
      readonly newPrivilege: number
      readonly previousPrivilege: number
      readonly caller?: { readonly login: string, readonly nickname: string }
    }
    export interface KarmaVoteInfo {
      readonly mapId: string
      readonly login: string
      readonly vote: -3 | -2 | -1 | 1 | 2 | 3
      readonly date: Date
    }
    export interface Listener {
      readonly event: (keyof Events) | (keyof Events)[]
      readonly callback: ((params: any) => void)
    }
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
    export interface PlayerDataUpdatedInfo {
      readonly login: string, readonly nickname?: string, readonly title?: string,
      readonly country?: { readonly name: string, readonly code: string, readonly region: string }
    }
    export interface TrackmaniaMapInfo {
      readonly Uid: string;
      readonly Name: string;
      readonly FileName: string;
      readonly Author: string;
      readonly Environnement: string;
      readonly Mood: string;
      readonly BronzeTime: number;
      readonly SilverTime: number;
      readonly GoldTime: number;
      readonly AuthorTime: number;
      readonly CopperPrice: number;
      readonly LapRace: boolean;
      readonly NbLaps: number;
      readonly NbCheckpoints: number;
    }
    export interface TrackmaniaRankingInfo {
      readonly Login: string;
      readonly NickName: string;
      readonly PlayerId: number;
      readonly Rank: number;
      readonly BestTime: number;
      readonly BestCheckpoints: number[];
      readonly Score: number;
      readonly NbrLapsFinished: number;
      readonly LadderScore: number;
    }
    export interface TrackmaniaPlayerInfo {
      readonly Login: string;
      readonly NickName: string;
      readonly PlayerId: number;
      readonly TeamId: number;
      readonly SpectatorStatus: number;
      readonly LadderRanking: number;
      readonly Flags: number;
    }
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
    export type JoinInfo = Omit<Player, 'currentCheckpoints'> & {
      readonly isSpectator: boolean
      readonly privilege: number
      readonly wins: number
    }
    export type EndMapInfo = Readonly<CurrentMap> & {
      readonly localRecords: Readonly<Readonly<LocalRecord>[]>
      readonly liveRecords: Readonly<Readonly<FinishInfo>[]>
      readonly wasWarmUp: boolean
      readonly continuesOnNextMap: boolean
      readonly winnerLogin?: string
      readonly winnerWins?: number,
      readonly isRestart: boolean
    }
    export type BeginMapInfo = Map & { isRestart: boolean }
    export type CurrentMap = Map & {
      readonly lapsAmount: number
      readonly checkpointsAmount: number
    }
    export type LocalRecord = Record & OfflinePlayer
    export type CheckpointInfo = Checkpoint & { readonly player: Player }
    export type FinishInfo = Omit<Player & LocalRecord, 'currentCheckpoints' | 'isSpectator' | 'date'>
    export type LeaveInfo = Omit<Player, 'lastOnline'> & {
      readonly sessionTime: number
      readonly wins: number
      readonly privilege: number
      readonly isSpectator: boolean
    }
    export type ManialinkClickInfo = Player & { actionId: number }
    export type MapAddedInfo = Map &
    { readonly callerLogin?: string }
    export type MapRemovedInfo = Map & {
      readonly callerLogin?: string
    }
    export type RecordInfo = Omit<Player & LocalRecord & {
      readonly position: number
      readonly previousPosition: number
      readonly previousTime: number
    }, 'currentCheckpoints' | 'isSpectator'>
    export type MessageInfo = Message & Player
    export type TMXSite = 'TMNF' | 'TMU' | 'TMN' | 'TMO' | 'TMS'
  }
}