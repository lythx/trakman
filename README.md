## TRAKMAN
Trackmania Forever server controller written in TypeScript

Info about plugin development can be found on the [project wiki](https://github.com/felacek/trakman/wiki)

### Prerequisites
- [Latest](https://nodejs.org/en/download/current/) Node.js

- [Latest](https://www.postgresql.org/download/) PostgreSQL

On Linux, those should be available in your repos by default (see [[1]](https://repology.org/project/nodejs/versions) and [[2]](https://repology.org/project/postgresql/versions), unless you're using a distro with prehistoric package versions (sometimes people call it [Debian](https://packages.debian.org/bookworm/nodejs)).

On Windows, the installation instructions might be a little goofy and I'm not willing to look for it to satisfy the minority.

### Install & Run
1. Get a hold of the current main branch via `git clone` or by downloading the source
2. `$ npm i` to install all the dependencies
3. Open `config` directory and configure the [settings](#settings)
4. `$ npm run build` to [compile](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html#compiling-your-code) the code
5. `$ npm run start` to run the controller

### Settings
The `config` directory is split into multiple files:
##### Config.js
- `localRecordsLimit` - Local records limit for widget display and rank calculation
- `chatMessagesInRuntime` - Amount of chat messages stored in runtime memory
- `jukeboxQueueSize` - Amount of maps in the dedicated server map queue
- `jukeboxHistorySize` - Amount of maps kept in the queue history
- `privileges` - Privilege levels for each of the administrative actions (e.g. ban, mute, etc.)
- `blacklistFile` - Relative path (/GameData/Config/) to the blacklist file
- `guestlistFile` - Relative path (/GameData/Config/) to the guestlist file
- `matchSettingsFile` - Relative path (/GameData/Tracks/) to the matchsettings file
- `defaultReasonMessage` - Default message sent as the reason for administrative actions if nothing was specified by the admin
- `truthyParams` - Things that will be interpreted as `true` for the `boolean` command parameter
- `falsyParams` - Things that will be interpreted as `false` for the `boolean` command parameter
- `nicknameToLoginSimilarityGoal` - Represents minimal similarity value at which translation will be successful
- `nicknameToLoginMinimumDifferenceBetweenMatches` - Represents minimal similarity difference between best and second-best match at which translation will be successful
- `version` - Current controller version
##### Messages.js
- `noPermission` - Message sent to the player attempting to use a command he does not have the permission for
- `noParam` - Message sent to the player attempting to use a command without an obligatory parameter
- `invalidValue` - Message sent to the player attempting to use a command while supplying the wrong value for a parameter
- `notInt` - Message sent to the player attempting to use a command while supplying the wrong type for the `int` parameter
- `notDouble` - Message sent to the player attempting to use a command while supplying the wrong type for the `double` parameter
- `notBoolean`- Message sent to the player attempting to use a command while supplying the wrong type for the `boolean` parameter
- `notTime` - Message sent to the player attempting to use a command while supplying the wrong type for the `time` parameter
- `timeTooBig` - Message sent to the player attempting to use a command while supplying an out-of-range value for the `time` parameter
- `noPlayer` - Message sent to the player if the specified login is not found in the runtime
- `unknownPlayer` - Message sent to the player if the specified login is not found in the database
##### Prefixes.js
- `palette` - Controller messages palette object
- `prefixes.serverToPlayer` - Characters with which every message sent to individual players will be prefixed (e.g. ChatSendServerMessageToLogin)
- `prefixes.serverToAll` - Characters with which every message sent in public will be prefixed (e.g. ChatSendServerMessage)
##### Titles.js
- `titles.logins` - Pairs of `login` and `title` where the `title` is assigned to the specified `login`
- `titles.countries` - Pairs of `country` and `title` where the `title` is assigned to every player from the specified `country` (country codes work too)
- `titles.privileges` - Pairs of `privilege` and `title` where the `title` is assigned to every player with the specified `privilege` level
##### Server.js
See [the TM-Forum post](https://www.tm-forum.com/viewtopic.php?t=14203) for dedicated server installation instructions
- `serverAddress` - IP address of the server
- `serverPort` - Port used for the server communication (`5000` by [default](https://www.tm-forum.com/viewtopic.php?p=107361&hilit=5000#p107361))
- `superAdminName` - SuperAdmin name from your `dedicated_cfg.txt`
- `superAdminPassword` - SuperAdmin password from your `dedicated_cfg.txt`
##### Database.js
You might want to take a look at the [official PostgreSQL docs](https://www.postgresql.org/docs/current/) before setting these
- `dbUser` - PostgreSQL database user
- `dbPassword` - Password for `dbUser`
- `dbName` - Name of the PostgreSQL database
- `dbAddress` - IP address of the database server
- `dbPort` - Port used for the database communication (`5432` by [default](https://www.postgresql.org/docs/current/runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS))
- `serverOwnerLogin` - Trackmania login of the server owner, highest privilege user
- `fixRankCoherence` - Whether to fix rankings coherence on startup (useful if you changed the `localRecordsLimit`, or just migrated the database)
##### Logging.js
If you want to use the Discord logging feature, please [take a look at the Discord webhook docs](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) first
- `logLevel` - The level of logging (`1` - error, `2` - warn, `3` - info, `4` - debug, `5` - trace)
- `discordEnabled` - Enable or disable sending logs to Discord
- `discordLogLevel - The level of logging, affects only the webhook (`1` - error, `2` - warn, `3` - info, `4` - debug, `5` - trace)
- `discordWebhookUrl` - URL for the Discord webhook you have created
- `discordEmbedImages` - List of image URLs to be used in the Discord embed
- `discordTaggedUsers` - List of users to be mentioned when the controller crashes (fatal error)

### Limitations
1. Stunts mode is not supported (yet?)
2. Rounds mode is not supported by the UI (yet)
3. Some methods/callbacks were never tested, thus may disfunction (very unlikely)
4. Stability is questionable as of now
