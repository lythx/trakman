# Changelog
Changelog can also be found in the controller (/changes)

## 1.6.0
**18/11/2024**
+ Added support for potentially infinite map handling
+ Added new search algorithm #253
+ Added support for Bun (experimental)
+ Added nickname to player (login) translation for admin actions
+ Added manialink interaction timeouts
+ Added page selection in MapList via $p (by default) #252
+ Added stats update on interval
+ Added dedicated server healthchecks
+ Added SIGINT handling #224
+ Added BestCps and BestFinishes horizontal layouts
+ Added rank recalculation via //recrank
+ Added CpCounter relative layout
+ Added environment display to MapList and MapWidgetResult
+ Added different default screenshots for all environments
+ Added //savematchsettings
+ Added new options for UI text
- Fixed //requeue allowing continuous requeueing of the same map #254
- Fixed crash in Paginator when landing on a non-existent page
- Fixed Freezone plugin sending too long names
- Fixed maps not being added due to having the same filename
- Fixed the server hanging when attempting to add a map too big in size
- Fixed TMXFetcher not going through other TMX websites on empty response
- Fixed restart/extend related bugs
- Fixed skipping during transition state not doing anything
- Fixed UI breaking on non-escaped characters in player name #258
- Fixed admin windows not refreshing when interacting with an offline player
- Fixed RoundService not recognising changes made in the config file
- Fixed several non-optimised algorithms

## 1.5.0
**21/03/2024**
* Removed DiscordJS dependency
+ Added Stunts mode support
+ Added Ultimania support for Stunts records
+ Added new TMX API support for records and map info
+ Added the ability to hide UI elements with the F7 key
+ Added Trakman mod to hide overlapping TMF UI elements
+ Added alias search to Commandlist #233
+ Added author search to TMXSearchWindow #238
+ Added map removal to Maplist for admins #237
+ Added switchable separators for author search
+ Added own Discord embeds to Logger
+ Added Dockerfile and Docker installation support
+ Added URL fixer to chat routing utilities
+ Added the ability to disable chat commands for muted players
+ Added text offset properties to static buttons
+ Added the ability to disable default messages individually
+ Added configurable defaults to chat commands
+ Added ability to configure margins in UI layouts
- Fixed TMXSearchWindow crash on invalid TMX response
- Fixed empty names in TMX UI windows due to multibyte characters
- Fixed ServerInfo querying the database every second
- Fixed records being visually duplicated in various UI components
- Fixed the controller not being able to add 5000+ maps in one go to the database
- Fixed cup scores erasing on skip/res in cup mode #234
- Fixed misleading //shuffle description #235
- Fixed Docker running as root #232
- Fixed BannerWidget position and width when modifying othrr UI elements
- Fixed wrong colouring in NextMapRecords widget due to not storing the player's time on the next map
- Fixed crash on empty string when invoking strip util #240
- Fixed wrong colouring in CheckpointRecords window
- Fixed Logger crash on empty Discord webhook URL #241
- Fixed controller allowing to remove the last map in the playlist #242
- Fixed custom buttons not rendering on PlayerJoin event
- Fixed all icon URLs
- Fixed icons preload

## 1.4.0
**16/09/2023**
+ Added optimisations for UI display and hide
+ Added lighter UI for when there are too many players
+ Added the banner widget on result
+ Added the player stats window
+ Added the TMX detailed info window
+ Added the public /add vote
+ Added the skip endscreen plugin
+ Added matchsettings change handling
+ Added privilege levels to commandlist
+ Added admin lists to admin service
+ Added admin list windows
- Fixed client reconnect crash
- Fixed handling of newlines in chatlog
- Fixed the round averages calculation
- Fixed the controller stalling for 30 seconds on failed call
- Fixed vote ratios to disallow passing on 1 to 1 votes
- Fixed /laston not finding the player
- Fixed karma spam clicking
- Fixed cache in maplist
- Fixed possible infinite recursion in the map service
- Fixed the current map not being in memory bug
- Fixed the dollar character handling in utils
- Fixed stats not updating on init
- Fixed no log output in daemon mode
- Fixed pagination in Commandlist
- Fixed pagination in TMX search
- Fixed various sent messages

## 1.3.0
**07/04/2023**
* Removed mysterious checkpoint
+ Added manual chat routing features
+ Added a server links plugin
+ Added a music plugin
+ Added an actions plugin
+ Added custom buttons to UI
+ Added improvements to static UI
+ Added new utils
+ Added a warn widget
+ Added an info messages plugin
+ Added scripts to run the controller in the background
+ Added passing and cancelling votes
+ Added a command list search
+ Added a call chat command
+ Added multiple mod compatibility
- Fixed the round averages window
- Fixed the time utils
- Fixed the vote automatically passing if there's one person on the server
- Fixed the timer not displaying after gamemode change
- Fixed util naming
- Fixed controller crash on webservices HTTP error
- Fixed addrandom adding maps in a loop bug fix
- Fixed chat repository crashing in case two messages were sent at the same exact time

## 1.2.0
**02/03/2023**
+ Added UI for Rounds/Teams/Laps/Cup gamemodes
+ Added rerendering capabilitied to Server Info Window
+ Added new UI utils
+ Added new utils and events for Rounds/Teams/Laps/Cup gamemodes
+ Added the multilap records database table
+ Added more sorting functionality to Map List
+ Added client reconnect on dedicated server socket error
- Fixed controller crash on empty player zone
- Fixed RecordList not updating on click and leaking memory
- Fixed the dedicated server not being able to queue a previously added map
- Fixed the dedicated server not being able to remove a map under specific circumstances
- Fixed TMX Window not handling special characters in various places
- Fixed author update on map queue showing previously fetched nickname
- Fixed the dynamic timer not being set when below the threshold
- Fixed the Dedimania name update not writing into the database
- Fixed Dedimania not working on TMUF due to environment mismatch
- Fixed various commands for Rounds/Teams/Laps/Cup gamemodes

## 1.1.0
**01/01/2023**
+ Added the dynamic timer feature
+ Added the Server Info window
+ Added aliases & help messages to configs of each command
+ Added the betting plugin (disabled by default)
+ Added more filters to the /list search command
+ Added the ability to specify arrays in send message/manialink functions
+ Added //addrandom map command
- Fixed TMX errors getting logged twice
- Fixed the server process being unable to quit after a fatal error
- Fixed crashes related to TMX fetch errors
- Fixed the incorrect CP amount in TMX Window
- Fixed the infinite loop on map queue error
- Fixed the vote timeout
- Fixed formatting in various windows
- Fixed the window pagination in specific cases
- Fixed order of the maps added to the queue via //add

## 1.0.0
**07/11/2022**
* Removed the redundant welcome window
* Removed UI utils (merged into UI)
+ Added Chat Log
+ Added TMX Search (aka /xlist)
+ Added configurable karma messages
+ Added more logging
+ Added docs to almost everything in the code
+ Added wiki with up-to-date information
+ Added new TMX API to TMX fetcher
- Fixed player data not updating in database
- Fixed some stupid variable names
- Fixed incorrect window colours
- Fixed outdated code in early windows
- Fixed stats UI being outside of stats plugin
- Fixed database crash on too long chat string
- Fixed multibyte characters breaking manialinks

## 0.6.0
**29/09/2022**
* Removed JSON files and configs
+ Added player stats windows and related commands
+ Added player ladder rank to player object
+ Added GZip compression for Dedimania request and response
+ Added enums to command params
+ Added time difference to checkpoint counter
+ Added cache to Map List
+ Added karma vote transfer among the two systems
+ Added coppers payment from the server
+ Added name sync across all systems
+ Added name sync from Dedimania records
+ Added global namespace for ease of access and types
+ Added admin panel basic functionality
- Fixed checkpoint counter only updating on finish
- Fixed Maniakarma returned value potentially being NaN
- Fixed gitignore like twenty times
- Fixed broken actions in administration service
- Fixed socket response being interpreted incorrectly
- Fixed skip and res commands doing opposite things
- Fixed pagination in administration lists
- Fixed karma vote calculation
- Fixed controller crash on too big time param
- Fixed controller crash on stats update due to hardcoded limit
- Fixed controller crash on double vote (perhaps)

## 0.5.0
**04/09/2022**
* Removed unnecessary things from source
+ Added actual plugin system
+ Added config files for each plugin/window/command
+ Added TMX (Map Info) Window and related commands
- Fixed administration services
- Fixed karma service
- Fixed karma service crashing when no people are on the server
- Fixed map service history not working properly
- Fixed Dedimania nation display for players/server
- Fixed Dedimania sending records when there are none
- Fixed Dedimania gamemode display
- Fixed chat commands being categorised in a silly way
- Fixed recordlist crash on new map

## 0.4.0
**10/08/2022**
* Removed unused dependencies
* Removed the sole broken test
+ Added result UI
+ Added result display support to static component
+ Added scripts for easier build/startup
+ Added autojuke and related commands
+ Added donations functionality
+ Added Map List sorting options
+ Added player stats widgets
+ Added checkpoint counter
+ Added player ranking prefetch
+ Added controller check for startup
- Fixed players and player_ids tables being split
- Fixed trakman object being a big mess
- Fixed //ffdb creating same filenames on map fetch
- Fixed maplist player ranking display
- Fixed jukebox being split from map service
- Fixed paid res price incrementing indefinitely
- Fixed logger only logging the login/uid
- Fixed time consuming operations being unnecessarily awaited
- Fixed wins being incremented without player finish
- Fixed various messages display

## 0.3.0
**31/07/2022**
+ Added vote class
+ Added vote window
+ Added skip/res votes
+ Added player wins
+ Added ranking system
+ Added proxy for system.multicall
+ Added ability to specify multiple events in addListener 
+ Added checkpoint records and related windows, commands
+ Added sector records and related windows, commands
+ Added changelog window
+ Added some user commands
- Fixed database query missing a space
- Fixed some errors being fatal for no reason
- Fixed maplist sorting
- Fixed server name for freezone being potentially too long
- Fixed freezone server connection
- Fixed admin panel not displaying on map switch
- Fixed donation panel displaying for non-united accounts
- Fixed webservices nickname fetching
- Fixed wins being counted for the player that's alone on the server
- Fixed record position string function being a scattered mess
- Fixed Dedimania reconnection not working

## 0.2.0
**28/07/2022**
+ Added PB messages
+ Added plain "X" to the welcome window, as the image might not load instantly
- Fixed client splitting the chunk in very specific circumstances
- Fixed UI marker display
- Fixed nickname display in administration windows
- Fixed certain UI elements reappearing on result in case of an update
- Fixed Discord log escaped characters
- Fixed incorrect length for map author name column (40 in TMN)
- Fixed local records crashing the server in certain circumstances
- Fixed local records display when the record index is above the configured threshold

## 0.1.0
**27/07/2022**
- First "public" testing release
- Working record storage & other databases
- Working chat commands
- Working UI system
- Basic plugins system in form of services
- Repo structure is still chaotic
- Many things are TODO and don't work
- Documentation is lacking
