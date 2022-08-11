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
3. Copy `.env.example` to `.env` and configure [settings](#settings)
4. `$ npm run build` to [transpile](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html#compiling-your-code) the code
5. `$ npm run start` to run the controller

### Settings
The following settings are currently supported by the `.env` file:
##### Dedicated Server
See [the TM-Forum post](https://www.tm-forum.com/viewtopic.php?t=14203) for Dedicated Server installation instructions
- `SERVER_IP`: IP address of the server
- `SERVER_PORT`: Port used for the server communication (`5000` by [default](https://www.tm-forum.com/viewtopic.php?p=107361&hilit=5000#p107361))
- `SUPERADMIN_NAME`: SuperAdmin name from your `dedicated_cfg.txt`
- `SUPERADMIN_PASSWORD`: SuperAdmin password from your `dedicated_cfg.txt`
- `SERVER_LOGIN`: Trackmania login of the server account
- `SERVER_PASSWORD`: Password or the [community code](http://official.trackmania.com/tmf-communitycode/) for `SERVER_LOGIN`
- `SERVER_GAME`: Current server game (`TMF` by default)
- `SERVER_NATION`: Server nation country code
- `SERVER_PACKMASK`: Current server packmask (`Stadium`, `Original`, etc.)
- `SERVER_OWNER_LOGIN`: Trackmania login of the server owner, highest privilege user
##### Database
You might want to take a look at the [official PostgreSQL docs](https://www.postgresql.org/docs/current/) before setting these
- `DB_USER`: PostgreSQL database user
- `DB_PASSWORD`: Password for `DB_USER`
- `DB_NAME`: Name of the PostgreSQL database
- `DB_SERVER`: IP address of the database server
- `DB_PORT`: Port used for the database communication (`5432` by [default](https://www.postgresql.org/docs/current/runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS))
- `LOCALS_AMOUNT`: Amount of records to be fetched from the database (`30` by default)
##### Dedimania
- `USE_DEDIMANIA`: Enable or disable Dedimania (`YES` or `NO`)
- `DEDIMANIA_PORT`: Port used for dedimania communication (`8002` by [default](http://dedimania.net/SITE/forum/viewtopic.php?pid=1366#p1366))
- `DEDIS_AMOUNT`: Amount of records to be fetched from Dedimania (`30` by default)
##### Webservices
Before configuring this, please see the [wiki page](https://github.com/felacek/trakman/wiki/Trackmania-Web-Services) for Webservices
- `USE_WEBSERVICES`: Enable or disable nickname fetching from TMWS (`YES` or `NO`)
- `WEBSERVICES_LOGIN`: Your TMWS login
- `WEBSERVICES_PASSWORD`: Your TMWS password
##### Trackmania Exchange
- `USE_TMX`: Enable or disable track info fetching from TMExchange (`YES` or `NO`)
- `TMX_PREFETCH_AMOUNT`: Amount of tracks to be pre-fetched from TMExchange (`4` by default)
##### ManiaKarma
- `USE_MANIAKARMA`: Enable or disable the use of Maniakarma global votes (`YES` or `NO`)
- `MANIAKARMA_PREFETCH_AMOUNT`: Amount of tracks to have Maniakarma fetched for (`4` by default)
##### Freezone
Note that enabling the plugin will not magically make your server Freezone-active, [gaze upon the wiki page](https://github.com/felacek/trakman/wiki/Freezone-Configuration) for a proper tutorial
- `USE_FREEZONE`: Enable or disable the Freezone plugin (`YES` or `NO`)
- `FREEZONE_PASSWORD`: Your freezone TMWS password
##### Logging
If you want to use the Discord logging feature, please [take a look at the Discord webhook docs](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks) first
- `LOG_LEVEL`: The level of logging (`1` - error, `2` - warn, `3` - info, `4` - debug, `5` - trace)
- `USE_DISCORD_LOG`: Enable or disable sending logs to Discord (`YES` or `NO`)
- `DISCORD_LOG_LEVEL`: The level of logging, affects only the webhook (`1` - error, `2` - warn, `3` - info, `4` - debug, `5` - trace)
- `DISCORD_WEBHOOK_URL`: URL for the Discord webhook you've created
- `USERS_TO_PING_ON_CRASH`: List of users to be mentioned when the controller crashes (fatal error)

### Limitations
1. Stunts mode is not supported (yet?)
2. Rounds mode is not supported by the UI (yet)
3. Some methods/callbacks were never tested, thus may disfunction (very unlikely)
4. Stability is questionable as of now
