type StringAutocomplete<T extends string> = T | Omit<string, T>

type TMEvent = StringAutocomplete<
"Controller.Ready" | 
"Controller.PlayerChat" | 
"Controller.PlayerJoin" | 
"Controller.PlayerLeave" | 
"Controller.PlayerRecord" |
"Controller.PlayerFinish" | 
"Controller.PlayerInfoChanged" | 
"Controller.ManialinkClick" | 
"Controller.PlayerCheckpoint" | 
"Controller.BeginChallenge" | 
"Controller.EndChallenge" | 
"Controller.DedimaniaRecords" |
"Controller.KarmaVote" |
"Controller.ManiakarmaVotes" | 
"Controller.MapAdded">