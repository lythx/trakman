# Changelog
Changelog can be found in the controller (/changes)
## 0.6
**29/09/2022**
- Removed dotenv dependency
- Removed json files and configs
- Added player stats windows and related commands
- Added player ladder rank to player object
- Added gzip compression for dedimania request and response
- Added enums to command params
- Added time difference to checkpoint counter
- Added cache to maplist
- Added karma vote transfer among the two systems
- Added coppers payment from the server
- Added name sync across all systems
- Added name sync from dedimania records
- Added global trakman object/namespace for ease of access and types
- Added admin panel basic functionality
- Fixed checkpoint counter only updating on finish
- Fixed maniakarma returned value potentially being not a number
- Fixed gitignore like twenty times
- Fixed broken actions in administration service
- Fixed socket response being interpreted incorrectly
- Fixed skip and res commands doing opposite things
- Fixed pagination in administration lists
- Fixed karma vote calculation
- Fixed controller crash on too big time param
- Fixed controller crash on stats update due to hardcoded limit
- Fixed controller crash on double vote (perhaps)
## 0.5
**04/09/2022**
- Removed unnecessary things from source
- Added actual plugin system
- Added config files for each plugin/window/command
- Added tmx (map info) window and related commands
- Fixed administration services
- Fixed karma service
- Fixed karma service crashing when no people are on the server
- Fixed map service history not working properly
- Fixed dedimania nation display for players/server
- Fixed dedimania sending records when there are none
- Fixed dedimania gamemode display
- Fixed chat commands being categorised in a silly way
- Fixed recordlist crash on new map
## 0.4
**10/08/2022**
- Removed unused dependencies
- Removed the sole broken test
- Added result UI
- Added result display support to static component
- Added scripts for easier build/startup
- Added autojuke and related commands
- Added donations functionality
- Added maplist sorting options
- Added some commands
- Added player stats widgets
- Added checkpoint counter
- Added player ranking prefetch
- Added controller check for startup
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
## 0.3
**31/07/2022**
- Added vote class
- Added vote window
- Added skip/res votes
- Added player wins
- Added ranking system
- Added proxy for system.multicall
- Added ability to specify multiple events in addListener 
- Added checkpoint records and related windows, commands
- Added sector records and related windows, commands
- Added changelog window
- Added some user commands
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
- Fixed dedimania reconnection not working
## 0.2
**28/07/2022**
- Fixed client splitting the chunk in very specific circumstances
- Fixed UI marker display
- Fixed nickname display in administration windows
- Fixed certain UI elements reappearing on result in case of an update
- Fixed Discord log escaped characters
- Fixed incorrect length for map author name column (40 in TMN)
- Fixed local records crashing the server in certain circumstances
- Fixed local records display when the record index is above the configured threshold
- Added PB messages
- Added plain X to the welcome window, as the image might not load instantly
## 0.1
**27/07/2022**
- First public release
- Most basic functionality, e.g. record storage and most basic chat commands
- Most plugins' functionality, albeit in form of services, thus not actual 'plugins'
- Repo structure is still chaotic
