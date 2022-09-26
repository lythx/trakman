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
  "VotesPrefetch": Readonly<TM.Vote>[]
  "MapAdded": MapAddedInfo
  "MapRemoved": MapRemovedInfo
  "BillUpdated": BillUpdatedInfo
  "MatchSettingsUpdated": TM.Map[]
  "PrivilegeChanged": PrivilegeChangedInfo
  "LocalRecordsRemoved": TM.Record[]
  "JukeboxChanged": TM.Map[]
  "RanksAndAveragesUpdated": Readonly<{ login: string, average: number }>[]
  "Ban": Readonly<TM.BanlistEntry>
  "Unban": Readonly<TM.BanlistEntry>
  "Blacklist": Readonly<TM.BlacklistEntry>
  "Unblacklist": Readonly<TM.BlacklistEntry>
  "Mute": Readonly<TM.MutelistEntry>
  "Unmute": Readonly<TM.MutelistEntry>
  "AddGuest": Readonly<TM.GuestlistEntry>
  "RemoveGuest": Readonly<TM.GuestlistEntry>
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