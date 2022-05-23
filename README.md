## TRAKMAN
Trackmania Forever server controller written in TypeScript.

More information is going to be available on the [wiki](https://github.com/felacek/trakman/wiki), later.

### Prerequisites
Node.js [v18](https://nodejs.org/en/download/current/)+

PostgreSQL [v14](https://www.postgresql.org/download/)+

### Install & Run
1. Get a hold of the current master branch via `git clone` or by downloading the source.
2. `$ npm i` to install all the dependencies.
3. Copy `.env.example` to `.env` and configure [settings](https://github.com/felacek/trakman/README.md#settings).
4. `$ npx tsc` to transpile the code.
5. `$ node ./built/src/Main.js` to run the controller.

### Settings
The following settings are currently supported by the `.env` file:
- `SERVER_IP`: IP address of the server.
- `SERVER_PORT`: Port used for the server communication (`5000` by default).
- `SUPERADMIN_NAME`: SuperAdmin name from your `dedicated_cfg.txt`.
- `SUPERADMIN_PASSWORD`: SuperAdmin password from your `dedicated_cfg.txt`.
- `DB_USER`: PostgreSQL database user.
- `DB_PASSWORD`: Password for `DB_USER`.
- `DB_NAME`: Name of the PostgreSQL database.
- `DB_SERVER`: IP address of the database server.
- `DB_PORT`: Port used for the database communication (`5432` by default).
- `SERVER_OWNER_LOGIN`: Trackmania login of the server owner, highest privilege user.
- `USE_DEDIMANIA`: Enable or disable Dedimania (`YES` or `NO`).
- `DEDIMANIA_PORT`: Port used for dedimania communication (`8002` by default).
- `SERVER_LOGIN`: Trackmania login of the server account.
- `SERVER_PASSWORD`: Password for `SERVER_LOGIN`.
- `SERVER_GAME`: Current server game (`TMF` by default).
- `SERVER_NATION`: Server nation country code.
- `SERVER_PACKMASK`: Current server packmask (`Stadium`, `Original`, etc.)

### ...
