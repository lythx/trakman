## db
### getMapId
**(mapUid: string): Promise<number | undefined>**  
Fetches map database id  
- ```mapUid``` Map uid
- ```Returns``` Map id or undefined if map is not in database

**(mapUids: string[]): Promise<{ uid: string, id: number }[]>**  
Fetches multiple map database ids  
- ```mapUids``` Array of map uids  
- ```Returns``` Array of objects containing map id and uid. If map is not in the database it won't be in the array
### getPlayerId
**(login: string): Promise<number | undefined>**  
Fetches player database id  
 - ```login``` Player login
 - ```Returns```  Player id or undefined if player is not in database

### getPlayerId
**(logins: string[]): Promise<{ login: string, id: number }[]>**
Fetches multiple player database ids.  
  
 - ```logins``` Player login
 - ```Returns```   Array of objects containing player id and login. If map is not in the database it won't be in the array

### query
**(query: string, ...params: any[]): Promise<any[] | Error>**  
Executes a query on the database   
- ```query``` Query to execute
- ```Returns``` Database response or error on invalid query

### getClient
**(): Promise<(query: string, ...params: any[]) => Promise<any[] | Error>>**  
Initializes a database client and returns a function which executes database queries using the client.
Client queries are handled by a separate thread which makes them a bit faster. Use this only if your plugin needs to execute database queries very frequently. Only a few clients can be active at the same time, if there is too many the program might hang.
- ```Returns``` Function to execute database queries using the client


## TMX
### fetchMapInfo
**(mapId: string): Promise<tm.TMXMap | Error>**  
Fetches TMX for map information.
- ```mapId``` map UID
- ```Returns``` Map info from TMX or error if unsuccessful

### fetchMapFile
**(mapId: string): Promise<{ name: string, content: Buffer } | Error>**  
Fetches map file from TMX via its UID.
- ```mapId``` Map UID
- ```Returns``` Object containing map name and file content, or Error if unsuccessfull

**(tmxId: number, site?: tm.TMXSite): Promise<{ name: string, content: Buffer } | Error>**  
Fetches map file from TMX via its TMX ID.
- ```tmxId``` Map TMX ID
- ```site``` Optional TMX site (TMNF by default)
- ```Object``` containing map name and file content, or Error if unsuccessfull

## searchForMap
**(query: string, site: tm.TMXSite = 'TMNF', count: number = config.defaultTMXSearchLimit): Promise<Error | tm.TMXSearchResult[]>**  
Searches for maps matching the specified name on TMX.
- ```query``` Search query
- ```site``` TMX Site to fetch from
- ```count``` Number of maps to fetch
- `Returns` An array of searched map objects or Error if unsuccessfull

## players

### get
**(login: string): Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }> | undefined**  
Gets the player information from runtime memory. Only online players are stored.
- ```login``` Player login
- ```Returns``` Player object or undefined if the player isn't online

**(logins: string[]): Readonly<tm.Player & { currentCheckpoints: Readonly<Readonly<tm.Checkpoint>[]> }>[]**  
Gets multiple players information from runtime memory. Only online players are stored If some player is not online he won't be returned. Returned array is not in initial order.
- ```logins``` Array of player logins
- ```Returns``` Array of player objects

### fetch
**(login: string): Promise<tm.OfflinePlayer | undefined>**  
Fetches a player from the database. This method should be used to get players who are not online.
- ```login``` Player login
- ```Returns``` Player object or undefined if player is not in the database

**(logins: string[]): Promise<tm.OfflinePlayer[]>**  
Fetches multiple players from the database. This method should be used to get players who are not online of some player is not present in the database he won't be returned. Returned array is not in initial order.
- ```logins``` Array of player logins
- ```Returns``` Player objects array

### list
All online players.

### count
Number of online players.

## records

### getLocal
**(login: string): tm.LocalRecord | undefined**  
Gets the players local record on the current map.
- ```login``` Player login
- ```Returns``` Local record object or undefined if the player doesn't have a local record

**(logins: string[]): tm.LocalRecord[]**  
Gets multiple local records on the current map from runtime memory. If some player has no local record his record object wont be returned. Returned array is sorted primary by time ascending, secondary by date ascending.
- ```logins``` Array of player logins
- ```Returns``` Array of local record objects

### getLive
**(login: string): tm.FinishInfo | undefined**  
Gets the players live record

- ```login``` Player login
- ```Returns``` Live record object or undefined if the player doesn't have a live record

**(logins: string[]): tm.FinishInfo[]**  
Gets multiple live records If some player has no live record his record object wont be returned.Returned array is sorted primary by time ascending, secondary by date ascending.
- ```logins``` Array of player logins
- ```Returns``` Array of live record objects

### getFromQueue
**(...mapIds: string[]): tm.Record[]**  
Gets local records on the given map if it's in map queue. Returned array is sorted primary by queue position ascending, time ascending and date ascending.
- ```madIds``` Array of map ids
- ```Returns``` Array of record objects

### getOneFromQueue
**(login: string, mapId: string): tm.Record | undefined**  
Gets local record of the given player, on the given map if it's in map queue.
- ```login``` Player login
- ```mapId``` Map id
- ```Returns``` Record object or undefined if record doesn't exist

### getFromHistory
**(...mapIds: string[]): tm.Record[]**  
Gets local records on the given map if it's in map history. Returned array is sorted primary by history position ascending, time ascending and date ascending.
- ```mapIds``` Array of map ids
- ```Returns``` Array of record objects

### getOneFromHistory
**(login: string, mapId: string): tm.Record | undefined**  
Gets local record of the given player, on the given map if it's in map history.
- ```login``` Player login
- ```Returns``` Record object or undefined if record doesn't exist

### remove
**(player: { login: string, nickname: string }, mapId: string, caller?: { login: string, nickname: string }): void**  
Removes a player record.
- ```player``` Player object
- ```mapId``` Map uid
- ```caller``` Caller player object

### removeAll
**(mapId: string, caller?: { login: string, nickname: string }): void**  
Removes all records on a given map.
- ```mapId``` Map uid
- ```caller``` Caller player object
- ```Returns``` Database response

### fetch
**(...mapIds: string[]): Promise<tm.Record[]>**  
Fetches local records for given logins from the database. Returned array is sorted primary by time ascending, secondary by date ascending.
- ```mapIds``` Map uids
- ```Returns``` Array of record objects

### fetchOne
**(mapId: string, login: string): Promise<tm.Record | undefined>**  
Fetches a given player record on a given map.
- ```mapId``` Map uid
- ```login``` Player login
- ```Returns``` Record object or undefined if player has no record

### fetchRecordsByLogin
**(...logins: string[]): Promise<tm.Record[]>**  
Fetches local records for given logins from the database. Returned array is sorted primary by time ascending, secondary by date ascending.
- ```logins``` Player logins
- ```Returns``` Array of record objects

### fetchRecordCount
**(login: string): Promise<number>**  
Fetches number of records a player has in the database.
- ```login``` Player login
- ```Returns``` Number of records

### getRank
**(login: string, mapId: string): number | undefined**  
Gets given player local rank on given map.
- ```login``` Player login
- ```mapId``` Map uid
- ```Returns``` Rank or undefined if player doesn't have a record

**(login: string, mapIds?: string[]): { mapId: string, rank: number }[]**  
Gets given player local ranks on given maps.
- ```login``` Player login
- ```mapIds``` Array of map uids
- ```Returns``` Array of objects with player ranks and map uids

**(login: string): { mapId: string, rank: number }[]**  
Gets given player local ranks on all maps.
- ```login``` Player login
- ```Returns``` Array of objects with player ranks and map uids

### local
Current map local records.

### localCount
Number of local records on the current map.

### live
Current live records.

### liveCount
Number of live records.

### maxLocalsAmount 
Maximum amount of local records. All local records get fetched, but only the ones below max amount count towards server rank.

## messages

### fetch
**(options: { limit?: number; date?: Date; }): Promise<tm.Message[]>**  
Fetches chat messages.
- ```options``` Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched.
- ```Returns``` Array of message objects

### fetchByLogin
**(login: string, options: { limit?: number; date?: Date; }): Promise<tm.Message[]>**  
Fetches chat messages written by specified player.
- ```login``` Player login
- ```options``` Limit is maximum amount of fetched messages, date is timestamp after which messages will be fetched
- ```Returns``` Array of message objects

### get
**(login: string): Readonly<tm.Message>[]**  
Gets recent chat messages written by specified player.
- ```login``` Player login
- ```Returns``` Array of message objects

### list
Recent chat messages.  

### count
Number of recent chat messages.  

## commands

### add
**(...commands: tm.Command[]): void**  
Adds chat commands to the server.
- ```commands``` Chat commands to register

### list
All registered chat commands.

### count
Number of commands.

## client

### call
**(method: string, params: tm.CallParams[] = []): Promise<any | Error>**  
Calls a dedicated server method and awaits the response.
- ```method``` Dedicated server method to be executed
- ```params``` Optional params for the dedicated server method
- ```Returns``` Server response or error if the server returns one

**(method: 'system.multicall', params: tm.Call[] = []): Promise<({ method: string, params: any } | Error)[] | Error>**  
Calls multiple dedicated server methods using system.multicall and awaits the response.
- ```method``` 'system.multicall'
- ```params``` Array of Call objects
- ```Returns``` Array of server responses or error if the server returns one

### callNoRes
**(method: string, params: tm.CallParams[] = []): void**  
Calls a dedicated server method without caring for the response.
- ```method``` Dedicated server method to be executed
- ```params``` Optional params for the dedicated server method

**(method: 'system.multicall', params: tm.Call[] = []): void**  
Calls multiple dedicated server methods using system.multicall without caring for the response.
- ```method``` 'system.multicall'
- ```params``` Array of Call objects

### addProxy
**(methods: string[], callback: ((method: string, params: tm.CallParams[], response: any) => void)): void**  
Adds a callback listener which will be executed when one of the specified dedicated server methods gets called.
- ```methods``` Array of dedicated server methods
- ```callback``` Callback to execute

## maps

### get
**(uid: string): Readonly<tm.Map> | undefined**  
Gets a map from current playlist. Playlist is stored in runtime memory.
- ```uid``` Map uid
- ```Returns``` map object or undefined if map is not in the playlist

**(uids: string[]): Readonly<tm.Map>[]**  
Gets multiple maps from current playlist. Playlist is stored in runtime memory. If some map is not present in memory it won't be returned. Returned array is not in the initial order.
- ```uids``` Array of map uids
- ```Returns``` Array of map objects

### fetch
**(uid: string): Promise<tm.Map | undefined>**  
Fetches a map from the database. This method should be used to get maps which are not in the current Match Settings.
- ```uids``` Array of map uid
- ```Returns``` Map object or undefined if map is not in the database

**(uids: string[]): Promise<tm.Map[]>**
Fetches multiple maps from the database. This method should be used to get maps which are not in the current Match Settings. If some map is not present in the database it won't be returned. Returned array is not in the initial order.
- ```uids``` Array of map uids
- ```Returns``` Map objects array

### add
**(filename: string, caller?: { login: string, nickname: string }): Promise<tm.Map | Error>**  
Adds a map to the server.
- ```filename``` Path to the map file
- ```caller``` Object containing login and nickname of the player who is adding the map
- ```Returns``` Added map object or error if unsuccessful

### remove
**(id: string, caller?: { login: string, nickname: string }): Promise<boolean | Error>**  
Removes a map from the server.
- ```id``` Map uid
- ```caller``` Object containing login and nickname of the player who is removing the map
- ```Returns``` True if map was successfuly removed, false if map was not in the map list, Error if server fails to remove the map

### list 
All maps from current playlist.

### current
Currently played map.

### count
Amount of maps in current playlist.

## log

### fatal
**(...lines: any[]): Promise<void>**  
Outputs an fatal error message into the console and exits the process.
- ```lines``` Message lines

### error
**(...lines: any[]): Promise<void>**  
Outputs an error message into the console.
- ```lines``` Message lines

### warn
**(...lines: any[]): Promise<void>**  
Outputs a warn message into the console.
- ```lines``` Message lines

### info
**(...lines: any[]): Promise<void>**  
Outputs an info message into the console.
- ```lines``` Message lines

### debug
**(...lines: any[]): Promise<void>**  
Outputs a debug message into the console.
- ```lines``` Message lines

### trace
**(...lines: any[]): Promise<void>**  
Outputs a trace message into the console.
- ```lines``` Message lines

## jukebox

### addToJukebox
**(mapId: string, caller?: { login: string, nickname: string }, setAsNextMap?: true): Promise<void | Error>**  
Adds map to the queue.
- ```mapId``` Map UID
- ```caller``` Object containing login and nickname of player adding the map
- ```setAsNextMap``` If true map is going to be placed in front of the queue
- ```Returns``` True if successfull, Error if map is not in the memory


### removeFromJukebox
**(mapId: string, caller?: { login: string, nickname: string }): Promise<boolean>**  
Removes a map from the queue. 
- ```mapid``` Map UID
- ```caller``` Object containing login and nickname of player removing the map
- ```Returns``` True if the map was in the jukebox, false if it wasn't

### clearJukebox
**(caller?: { login: string, nickname: string }): Promise<void>**  
Removes all maps from the jukebox.
- ```caller``` Object containing login and nickname of player clearing the jukebox

### shuffle
**(caller?: { login: string, nickname: string }): Promise<void>**  
Randomly changes the order of maps in the maplist.
- ```caller``` Object containing login and nickname of the player who called the method

### getFromQueue
**(uid: string): Readonly<tm.Map> | undefined**  
Gets a map from the queue.
- ```uid``` Map uid
- ```Returns``` Map object or undefined if map is not in the queue

**(uids: string[]): Readonly<tm.Map>[]**  
Gets multiple maps from queue. If some map is not present in queue it won't be returned. Returned array is not in initial order.
- ```uids``` Array of map uids
- ```Returns``` Array of map objects

### getFromJukebox
**(uid: string): Readonly<{ map: tm.Map, callerLogin?: string }> | undefined**  
Gets a map from the jukebox.
- ```uid``` Map uid
- ```Returns``` Jukebox object or undefined if map is not in the jukebox

**(uids: string[]): Readonly<{ map: tm.Map, callerLogin?: string }>[]**  
Gets multiple maps from jukebox. If some map is not present in jukebox it won't be returned. Returned array is not in initial order.
- ```uids``` Array of map uids
- ```Returns``` Array of jukebox objects

### getFromHistory
**(uid: string): Readonly<tm.Map> | undefined**  
Gets a map from map history.
- ```uid``` Map uid
- ```Returns``` Map object or undefined if map is not in the history

**(uids: string[]): Readonly<tm.Map>[]**  
Gets multiple maps from map history. If some map is not present in history it won't be returned. Returned array is not in initial order.
- ```uids``` Array of map uids
- ```Returns``` Array of map objects

### queueCount
Amout of maps in the queue (maps juked by the players and the server). This is always equal to maxQueueCount.

### historyCount
Amount of maps in the history.

### maxQueueCount
Max amount of maps in the queue (maps juked by the players and the server).

### maxHistoryCount
Max amount of maps in the history.

### jukedCount
Amount of maps juked by the players.

### queue
Map queue (maps juked by the players and the server).

### history
Map history.

### current 
Currently played map.

### juked
Maps juked by the players.

## karma

### add
**(player: { login: string, nickname?: string }, vote: -3 | -2 | -1 | 1 | 2 | 3): void**  
Adds a vote on the current map to runtime memory and database.
- ```player``` Player object
- ```vote``` Vote value

**(votes: { login: string, vote: -3 | -2 | -1 | 1 | 2 | 3 }[]): void**  
Adds multiple votes on the current map to runtime memory and database.
- ```votes``` Vote objects

### fetch
**(mapId: string): Promise<tm.Vote[] | undefined>**  
Fetches all the player votes for a given map UID.
- ```mapId``` Map UID
- ```Returns``` Array of vote objects or undefined if map is not in the database

**(mapIds: string[]): Promise<{ uid: string, votes: tm.Vote[] }[]>**  
Fetches all the player votes for given map UIDs.
- ```MapIds``` Array of Map UIDs
- ```Returns``` Array of objects containing map UID and vote objects array. If some map is not in the database it won't be in the returned array

### get
**(uid: string): tm.Vote[] | undefined**  
Gets all the player votes for given map UID from the runtime memory. Only votes for maps in the history, queue and the current map are stored.
- ```uid``` Map UID
- ```Returns``` Array of vote objects or undefined if map is not in the memory

**(uids: string[]): { uid: string, votes: tm.Vote[] }[]**
Gets all the player votes for given map UIDs from the runtime memory. Only votes for maps in the history, queue and the current map are stored.
- ```uids``` Array of Map UIDs
- ```Returns``` Array of objects containing map UID and vote objects array. If some map is not in the memory it won't be in the returned array.

### current
Current map votes.

### currentCount
Current map vote count.

### allVotes
All votes in runtime memory. Only votes for maps in the history, queue and the current map are stored.

## state

### remainingRaceTime
Remaining race time in seconds.

### remainingResultTime
Remaining result screen time in seconds.

### current
Server state.

### raceTimeLimit
Race time limit in the current round.

### resultTimeLimit
Result time limit in the current round.

## admin

### setPrivilege
**(login: string, privilege: number, caller?: { login: string, nickname: string }): Promise<void>**  
Sets a player privilege level.
- ```login``` Player login
- ```privilege``` Privilege level to set
- ```caller``` Optional caller player object

### ban
**(ip: string, login: string, caller: { login: string, privilege: number, nickname: string }, nickname?: string, reason?: string, expireDate?: Date): Promise<boolean>**  
Bans, blacklists and kicks a player. If player is not on the server adds him to banOnJoin array. Adds him to banlist table.
- ```ip``` Player IP address
- ```login``` Player login
- ```caller``` Caller player object
- ```nickname``` Optional player nickname
- ```reason``` Optional ban reason
- ```expireDate``` Optional ban expire date
- ```Returns``` True if successful, false if caller privilege is too low or if it's not higher than target privilege

### unban
**(login: string, caller?: { login: string, privilege: number, nickname: string }): Promise<boolean | 'Player not banned' | Error>**  
Unbans a player and unblacklists him if he is not blacklisted. Deletes all ips tied to his login from the banlist table.
- ```login``` Player login
- ```caller``` Caller player object
- ```Returns``` True if successful, false if caller privilege is too low, 'Player not banned' if player was not banned and Error if dedicated server call fails.

### addToBlacklist
**(login: string, caller: { login: string, privilege: number, nickname: string },nickname?: string, reason?: string, expireDate?: Date): Promise<boolean | Error>**  
Blacklists and kicks a player, adds him to blacklist table. Saves the server blacklist.
- ```login``` Player login
- ```caller``` Caller player object
- ```nickname``` Optional player nickname
- ```reason``` Optional blacklist reason
- ```expireDate``` Otional blacklist expire date
- ```Returns``` True if successful, false if caller privilege is too low or if it's not higher than target privilege, Error if dedicated server call fails

### unblacklist
**(login: string, caller?: { login: string, privilege: number, nickname: string }): Promise<boolean | 'Player not blacklisted' | Error>**  
Unblacklists a player if he is not banned and deletes him from blacklist table. Saves the server blacklist.
- ```login``` Player login
- ```caller``` Caller player object
- ```Returns``` True if successful, false if caller privilege is too low, 'Player not blacklisted' if player was not blacklisted and Error if dedicated server call fails

### mute
**(login: string, caller: { login: string, privilege: number, nickname: string }, nickname?: string, reason?: string, expireDate?: Date): Promise<boolean>**  
Mutes a player and adds him to mutelist table.
- ```login``` Player login
- ```caller``` Caller player object
- ```nickname``` Optional player nickname
- ```reason``` Optional mute reason
- ```expireDate``` Optional mute expire date
- ```Returns``` True if successful, false if caller privilege is too low

### unmute
**(login: string, caller?: { login: string, privilege: number, nickname: string }): Promise<boolean | 'Player not muted' | Error>**  
Unmutes a player and deletes him from mutelist table
- ```login``` Player login
- ```caller``` Caller player object
- ```Returns``` True if successful, false if caller privilege is too low, 'Player not muted' if player was not muted, Error if dedicated server call fails

### addGuest
**(login: string, caller: { login: string, privilege: number, nickname: string }, nickname?: string): Promise<boolean | 'Already guest' | Error>**  
Adds a player to server guestlist, saves it and adds him to guestlist table.
- ```login``` Player login
- ```caller``` Caller player object
- ```nickname``` Optional player nickname
- ```Returns``` True if successful, false if caller privilege is too low, 'Already guest' if player was already in the guestlist, Error if server call fails

### removeGuest
**(login: string, caller?: { login: string, privilege: number, nickname: string }):  Promise<boolean | 'Player not in guestlist' | Error>**  
Removes a player from server guestlist, saves it and deletes him from guestlist table.
- ```login``` Player login
- ```caller``` Caller player object
- ```Returns``` True if successful, false if caller privilege is too low, 'Player not in guestlist' if player was not in the guestlist, Error if dedicated server call fails

### getBan
**(login: string): Readonly<tm.BanlistEntry> | undefined
Gets ban information for given login.**
- ```login``` Player login
- ```Returns``` Ban object or undefined if the player isn't banned

**(logins: string[]): Readonly<tm.BanlistEntry>[]
Gets multiple bans information for given logins.**
- ```logins``` Array of player logins
- ```Returns``` Array of ban objects

### getBlacklist
**(login: string): Readonly<tm.BlacklistEntry> | undefined**  
Gets blacklist information for given login.
- ```login``` Player login
- ```Returns``` Blacklist object or undefined if the player isn't blacklisted

**(logins: string[]): Readonly<tm.BlacklistEntry>[]**  
Gets multiple blacklists information for given logins
- ```logins``` Array of player logins
- ```Returns``` Array of blacklist objects

### getMute
**(login: string): Readonly<tm.MutelistEntry> | undefined**  
Gets mute information for given login.
- ```login``` Player login
- ```Returns``` Mute object or undefined if the player isn't muted

**(logins: string[]): Readonly<tm.MutelistEntry>[]**  
Gets multiple mutes information for given logins.
- ```logins``` Array of player logins
- ```Returns``` Array of mute objects

### getGuest
**(login: string): Readonly<tm.GuestlistEntry> | undefined**
Gets guest information for given login.
- ```login``` Player login
- ```Returns``` Guest object or undefined if the player isn't in the guestlist

**(logins: string[]): Readonly<tm.GuestlistEntry>[]**
Gets multiple guests information for given logins.
- ```logins``` Array of player logins
- ```Returns``` Array of guest objects

### banlist
Banned players.

### blacklist
Blacklisted players.

### mutelist
Muted players.

### guestlist
Server guests.

### banCount
Number of banned players.

### blacklistCount
Number of blacklisted players.

### muteCount
Number of muted players.

### guestCount
Number of guests.

## config

### controller
Controller config.

### server
Current dedicated server config.

### game
Current game config.

## utils

### getTimeString
**(time: number): string**  
Formats time for prettier display.
- ```time``` Time to format
- ```Returns``` Formatted time string

### getPositionString
**(pos: number): string**
Adds an ordinal suffix to numbers.
- ```pos``` Number to add the suffix to
- ```Returns``` Number with the suffix

### strip
**(str: string, removeColours: boolean = true): string**  
Removes all Trackmania specific formatting (e.g. $w, $fff, etc.) from the supplied string.
- ```str``` String to strip formatting from
- ```removeColours``` Whether to remove colours from the string, defaults to true
- ```Returns``` String without formatting

### stripSpecialChars
**(str: string): string**  
Attempts to convert supplied string to latin text based on the special charmap.
- ```str``` String to convert
- ```Returns``` Converted string

### getRegionInfo
**(region: string): { region: string, country: string, countryCode?: string }**  
Gets country information from region in Nadeo format
- ```region``` Region in Nadeo format, can start with World but doesn't have to
- ```Returns``` Object containing parsed region, country and country code if matching one was found

### matchString
**(searchString: string, possibleMatches: string[], stripSpecialChars?: true): { str: string, value: number }[]**  
Checks similarity of given strings, returns best matches sorted based on similarity.
- ```searchString``` String to compare possible matches to
- ```possibleMatches``` Array of strings to sort by similarity
- ```stripSpecialChars``` If true special characters get in strings get replaced with latin if possible
- ```Returns``` Array of objects containing string and its similarity value

**matchString<T extends { [key: string]: any }>(searchString: string, possibleMatches: T[], key: keyof T, stripSpecialChars?: true): { obj: T, value: number }[]**  
Checks similarity of given strings in an array of objects, returns best matches sorted based on similarity.
- ```searchString``` String to compare possible matches to
- ```possibleMatches``` Array of objects to sort by similarity
- ```key``` Key in objects containing the string to compare
- ```stripSpecialChars``` If true special characters get in strings get replaced with latin if possible
- ```Returns``` Array of objects containing object and its similarity value

### countryToCode
**(country: string): string | undefined**  
Gets the country code (non-ISO) for the specified country name
- ```country``` Country name
- ```Returns``` Country code

### getRankingString
**(prevPos: number, currPos: number, prevTime: number, currTime: number): { status: '' | 'acquired' | 'obtained' | 'equaled' | 'improved', difference?: string }**
Gets the appropriate verb and calculates record differences.
- `current` Object containing current record time and position
- `previous` Optional object containing previous record time and position
- ```Returns``` Object containing the string to use, whether calculation is needed, and the difference

### sendCoppers
**(payerLogin: string, amount: number, message: string, targetLogin: string = ''): Promise<boolean | Error>**  
Sends coppers with specified parameters.
- ```payerLogin``` Login of the payee
- ```amount``` Coppers amount
- ```message``` Message to attach in the in-game mail
- ```targetLogin``` Login of the receiver
- ```Returns``` Whether the payment went through or error

### payCoppers
**(targetLogin: string, amount: number, message: string): Promise<true | Error>**  
Pays coppers from the server with specified parameters.
- ```targetLogin``` Login of the receiver
- ```amount``` Coppers amount
- ```message``` Message to attach in the in-game mail
- ```Returns``` True on payment success or error

### msToTime
**(ms: number): string**  
Converts milliseconds to humanly readable time.
- ```ms``` Time to convert (in milliseconds)
- ```Returns``` Humanly readable time string

### safeString
**(str: string): string**  
Removes certain HTML tags that may harm XML manialinks.
- ```str``` Original string
- ```Returns``` Escaped string

### nicknameToPlayer
**(nickname: string, options?: { similarityGoal: number,minDifferenceBetweenMatches: number): tm.Player | undefined**  
Attempts to convert the player nickname to their login via charmap.
- ```nickname``` Player nickname
- ```options``` Options to modify search similarity goals
- ```Returns```  Possibly matching login or undefined if unsuccessful

### formatDate
**(date: Date, displayDay?: true): string**  
Formats date into calendar display.
- ```date``` Date to be formatted
- ```displayDay``` Whether to display day
- ```Returns``` Formatted date string

### strVar
**(str: string, variables: { [name: string]: any }): string**  
Replaces #{variableName} in string with given variables.
- ```str``` String to replace #{variableName} in
- ```variables``` Object containing values for variable names (key is variableName)
- ```Returns``` String with replaced variables

**(str: string, variables: any[]): string**
Replaces #{variableName} in string with given variables
- ```str``` String to replace #{variableName} in
- ```variables``` Array containing values for variables in order
- ```Returns``` String with replaced variable

### colours 
List of colours in Trackmania format (prefixed with $ and in 3 digit hex).

### palette
Server palette of colours defined in config.

### countries
List of Trackmania countries and country codes.

## sendMessage
**(message: string, login?: string, prefix: boolean = true): void**  
Sends a server message.
- ```message``` Message to be sent
- ```login``` Optional player login (or comma-joined list of logins)

## sendManialink
**(manialink: string, login?: string, deleteOnClick: boolean = false, expireTime: number = 0): void**  
Sends a server manialink.
- ```manialink``` Manialink XML to be sent
- ```login``` Optional player login (or comma-joined list of logins)
- ```deleteOnClick``` Whether to remove the manialink on player interaction
- ```expireTime``` Amount of time (in seconds) for the manialink to disappear

## updatePlayerInfo
**(...players: { login: string, nickname?: string, region?: string, title?: string }[]): Promise<void>**
Updates player information in runtime memory and database.
- ```players``` Objects containing player login and infos to update

## addListener
**(event: keyof tm.Events, callback: ((params: tm.Events[T]) => void | Promise<void>), prepend?: true): void**  
Add callback function to execute on given event.
- ```event``` Dedicated server callback event
- ```callback``` Function to execute on event
- ```prepend``` If set to true puts the listener on the beggining of the array (it will get executed before other listeners)

**(event: (keyof tm.Events)[], callback: ((params: any) => void | Promise<void>), prepend?: true): void**  
Add callback function to execute on given events.
- ```event``` Array of dedicated server callback events
- ```callback``` Function to execute on events
- ```prepend``` If set to true puts the listener on the beggining of the array (it will get executed before other listeners)

## removeListener
**(callback: Function): void**  
Removes event listener.
- ```callback``` Callback function of the listener to remove

## openManialink
**(id: number, login: string): void**  
Emits ManialinkClick for given player and actionId. Used for manialink interaction such as opening UI windows.
- ```id``` Manialink ID
- ```login``` Player login
