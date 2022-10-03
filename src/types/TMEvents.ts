import { MessageInfo } from "./TMMessageInfo"

export interface TMEvents {
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
  "KarmaVote": KarmaVoteInfo
  "VotesPrefetch": Readonly<tm.Vote>[]
  "MapAdded": MapAddedInfo
  "MapRemoved": MapRemovedInfo
  "BillUpdated": BillUpdatedInfo
  "MatchSettingsUpdated": tm.Map[]
  "PrivilegeChanged": PrivilegeChangedInfo
  "LocalRecordsRemoved": tm.Record[]
  "JukeboxChanged": tm.Map[]
  "RanksAndAveragesUpdated": Readonly<{ login: string, average: number }>[]
  "Ban": Readonly<tm.BanlistEntry>
  "Unban": Readonly<tm.BanlistEntry>
  "Blacklist": Readonly<tm.BlacklistEntry>
  "Unblacklist": Readonly<tm.BlacklistEntry>
  "Mute": Readonly<tm.MutelistEntry>
  "Unmute": Readonly<tm.MutelistEntry>
  "AddGuest": Readonly<tm.GuestlistEntry>
  "RemoveGuest": Readonly<tm.GuestlistEntry>
  "PlayerInfoUpdated": Readonly<{
    readonly login: string, readonly nickname?: string, readonly title?: string,
    readonly country?: { readonly name: string, readonly code: string, readonly region: string }
  }[]>
  "TrackMania.PlayerConnect": [string, boolean]
  "TrackMania.PlayerDisconnect": [string]
  "TrackMania.PlayerChat": [number, string, string, boolean]
  "TrackMania.PlayerCheckpoint": [number, string, number, number, number]
  "TrackMania.PlayerFinish": [number, string, number]
  "TrackMania.BeginRace": [any]
  "TrackMania.EndRace": [any[], any]
  "TrackMania.BeginRound": []
  "TrackMania.EndRound": []
  "TrackMania.BeginChallenge": [any, any, any]
  "TrackMania.EndChallenge": [any, any, boolean, boolean, boolean]
  "TrackMania.StatusChanged": [number, string]
  "TrackMania.PlayerManialinkPageAnswer": [number, string, any]
  "TrackMania.BillUpdated": [number, number, string, number]
  "TrackMania.ChallengeListModified": [number, number, any]
  "TrackMania.PlayerInfoChanged": [any]
  "TrackMania.PlayerIncoherence": [number, string]
  "TrackMania.Echo": [any, any]
  "TrackMania.VoteUpdated": [string, string, string, any]
}