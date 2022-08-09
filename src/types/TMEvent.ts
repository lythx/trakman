type StringAutocomplete<T extends string> = T | Omit<string, T>

type TMEvent = StringAutocomplete<
"Controller.Ready" | 
"Controller.PlayerChat" | 
"Controller.PlayerJoin" | 
"Controller.PlayerLeave" | 
"Controller.PlayerRecord" |
"Controller.PlayerFinish" | 
"Controller.PlayerInfoChanged" | 
"Controller.LiveRecord" |
"Controller.ManialinkClick" | 
"Controller.PlayerCheckpoint" | 
"Controller.BeginMap" | 
"Controller.EndMap" | 
"Controller.DedimaniaRecords" |
"Controller.DedimaniaRecord" |
"Controller.KarmaVote" |
"Controller.ManiakarmaVotes" | 
"Controller.MapAdded" |
"Controller.MapRemoved" |
"Controller.BillUpdated" |
"Controller.PrivilegeChanged" |
"Controller.JukeboxChanged" |
"Controller.TMXQueueChanged" |
"Controller.MatchSettingsUpdated" | 
"Controller.RanksAndAveragesUpdated">