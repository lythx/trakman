interface TMEvents {
  "Startup": 'result' | 'race'
  "PlayerChat": TMMessageInfo
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
  "VotesPrefetch": Readonly<TMVote>[]
  "MapAdded": MapAddedInfo
  "MapRemoved": MapRemovedInfo
  "BillUpdated": BillUpdatedInfo
  "MatchSettingsUpdated": TMMap[]
  "PrivilegeChanged": PrivilegeChangedInfo
  "LocalRecordsRemoved": TMRecord[]
  "JukeboxChanged": TMMap[]
  "RanksAndAveragesUpdated": Readonly<{ login: string, average: number }>[]
  "Ban": Readonly<TMBanlistEntry>
  "Unban": Readonly<TMBanlistEntry>
  "Blacklist": Readonly<TMBlacklistEntry>
  "Unblacklist": Readonly<TMBlacklistEntry>
  "Mute": Readonly<TMMutelistEntry>
  "Unmute": Readonly<TMMutelistEntry>
  "AddGuest": Readonly<TMGuestlistEntry>
  "RemoveGuest": Readonly<TMGuestlistEntry>
  "TrackMania.PlayerConnect": [string, boolean]
  "TrackMania.PlayerDisconnect": [string]
  "TrackMania.PlayerChat": [number, string, string, any] // todo
  "TrackMania.PlayerCheckpoint": [number, string, number, number, number]
  "TrackMania.PlayerFinish": [number, string, number]
  "TrackMania.BeginRace": [any]
  "TrackMania.EndRace": [any[], any] //todo
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