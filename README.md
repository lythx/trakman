## TRAKMAN
Trackmania Forever server controller written in TypeScript

Info about plugin development can be found on the [project wiki](https://github.com/felacek/trakman/wiki)

### Prerequisites
Node.js [v18](https://nodejs.org/en/download/current/)+

PostgreSQL [v14](https://www.postgresql.org/download/)+

### Install & Run
1. Get a hold of the current main branch via `git clone` or by downloading the source
2. `$ npm i` to install all the dependencies
3. Copy `.env.example` to `.env` and configure [settings](https://github.com/felacek/trakman/README.md#settings)
4. `$ npx tsc` to [transpile](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html#compiling-your-code) the code
5. `$ node ./built/src/Main.js` to run the controller

### Settings
The following settings are currently supported by the `.env` file:
##### Dedicated Server
See [the TM-Forum post](https://www.tm-forum.com/viewtopic.php?t=14203) for Dedicated Server installation instructions.
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
You might want to take a look at the [official PostgreSQL docs](https://www.postgresql.org/docs/current/) before setting these.
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
Before configuring this, please see the [wiki page](https://github.com/felacek/trakman/wiki/Trackmania-Web-Services) for Webservices.
- `USE_WEBSERVICES`: Enable or disable nickname fetching from TMWS (`YES` or `NO`)
- `WEBSERVICES_LOGIN`: Your TMWS login
- `WEBSERVICES_PASSWORD`: Your TMWS password
##### Trackmania Exchange
- `USE_TMX`: Enable or disable track info fetching from TMExchange (`YES` or `NO`)
- `TMX_PREFETCH_AMOUNT`: Amount of tracks to be pre-fetched from TMExchange (`4` by default)
#### ManiaKarma
- `USE_MANIAKARMA`: Enable or disable the use of Maniakarma global votes (`YES` or `NO`)
- `MANIAKARMA_PREFETCH_AMOUNT`: Amount of tracks to have Maniakarma fetched for (`4` by default)
#### Miscellaneous
- `LOG_LEVEL`: The level of logging (`1` - error, `2` - warn, `3` - info, `4` - debug, `5` - trace)

### Limitations
1. Stunts mode is not supported (yet?)
2. Rounds mode is not supported by the UI (yet)
3. Some methods/callbacks were never tested, thus may disfunction (very unlikely)
