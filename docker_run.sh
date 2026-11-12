#!/bin/sh
# Do **NOT** run this script locally,
# it is meant to only be used in the provided Docker environment.

# create and copy dedicated config
if find /app/server/GameData/Config -mindepth 1 -maxdepth 1 | read; then
  echo 'Server config exists, skipping initial setup.'
  rm dedicated_cfg.txt.bk 2>/dev/null
else
  echo 'Setting up server...'
  # ugly xml replacement
  xml ed -L -u "/dedicated/authorization_levels/level[name='SuperAdmin']/password" -v "$SUPER_ADMIN_PASSWORD" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/authorization_levels/level[name='SuperAdmin']/name" -v "$SUPER_ADMIN_NAME" dedicated_cfg.txt.bk
  ADMIN_PASS=$(< /dev/urandom tr -dc _A-Z-a-z-0-9 | head -c"${1:-32}";echo;)
  xml ed -L -u "/dedicated/authorization_levels/level[name='Admin']/password" -v "$ADMIN_PASS" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/masterserver_account/login" -v "$SERVER_ACC_LOGIN" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/masterserver_account/password" -v "$SERVER_ACC_PASSWORD" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/masterserver_account/validation_key" -v "$SERVER_ACC_KEY" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/name" -v "$SERVER_NAME" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/comment" -v "$SERVER_COMMENT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/hide_server" -v "${SERVER_HIDE_SERVER=0}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/max_players" -v "${SERVER_MAX_PLAYERS=32}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/password" -v "$SERVER_PASSWORD" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/max_spectators" -v "${SERVER_MAX_SPECTATORS=32}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/password_spectator" -v "$SERVER_PASSWORD_SPECTATOR" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/ladder_mode" -v "${SERVER_LADDER_MODE=1}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/ladder_serverlimit_min" -v "${SERVER_LADDER_SERVERLIMIT_MIN=0}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/ladder_serverlimit_max" -v "${SERVER_LADDER_SERVERLIMIT_MAX=50000}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/enable_p2p_upload" -v "${SERVER_ENABLE_P2P_UPLOAD=True}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/server_options/enable_p2p_download" -v "${SERVER_ENABLE_P2P_DOWNLOAD=True}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/connection_uploadrate" -v "${SERVER_CONNECTION_UPLOADRATE=512}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/connection_downloadrate" -v "${SERVER_CONNECTION_DOWNLOADRATE=8192}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/server_port" -v "$SERVER_NET_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/server_p2p_port" -v "$SERVER_P2P_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/xmlrpc_port" -v "$SERVER_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/xmlrpc_allowremote" -v "${REMOTE_XMLRPC=False}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/packmask" -v "${SERVER_PACKMASK=nations}" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/disable_coherence_checks" -v "${SERVER_DISABLE_COHERENCE_CHECKS=laps}" dedicated_cfg.txt.bk
  mv /app/server/dedicated_cfg.txt.bk /app/server/GameData/Config/dedicated_cfg.txt
fi
# copy over default tracks
if find /app/server/GameData/Tracks -mindepth 1 -maxdepth 1 | read; then
  echo 'Tracks exist, skipping initial setup.'
  rm -r Tracksbk 2>/dev/null
else
  echo 'Setting up tracks...'
  mv /app/server/Tracksbk/* /app/server/GameData/Tracks/
fi
# update and copy over Trakman directory
if find /app/server/trakman -mindepth 1 -maxdepth 1 | read; then
  if [ "$UPDATE_UTILITY_DISABLED" = "YES" ]; then
    echo 'Trakman exists, skipping initial setup.'
  else
    echo 'Trakman exists. Attempting update...'
    if ! cd trakman 2>/dev/null
    then
      echo 'Trakman actually does not exist. This makes no sense. Aborting and trying again.'
      exit
    fi
    if ! cp ../trakmanbk/Update.js . 2>/dev/null
    then
      # this runs if trakmanbk doesn't exist so we have nothing to update from
      echo "Update not available."
    else
      if ! node Update.js /app/server/trakmanbk/.hashes.json
      then
        # this runs if trakmanbk exists and the update script fails
        chown server:server update.log
        echo 'Update not fully successful, please stop the container.'
        sleep 1m # wait a minute for the user to read the message, or to realise something's wrong
        exit 1
      fi
    fi
    cd ..
  fi
  rm -r trakmanbk 2>/dev/null
else
  echo 'Setting up Trakman...'
  mv /app/server/trakmanbk/* /app/server/trakman/
  mv /app/server/trakmanbk/.hashes.json /app/server/trakman/
fi
# ugly creating of files to be able to chmod and remove them later
mkdir -p trakman/logs
touch trakman/logs/combined.log
touch trakman/logs/fatal.log
touch trakman/logs/error.log
touch trakman/logs/warn.log
touch trakman/logs/info.log
touch trakman/logs/debug.log
touch trakman/logs/trace.log
mkdir -p .pm2/logs
touch .pm2/logs/Trakman-error.log
touch .pm2/logs/Trakman-out.log
touch .pm2/logs/docker.log
mkdir -p trakman/temp
touch trakman/temp/rank_coherence.txt
mkdir -p trakman/plugins/server_links/temp
touch trakman/plugins/server_links/temp/data.txt
chown -R server:server /app/server
# build and actually run everything
echo "#!/bin/sh
(while true; do
  /app/server/TrackmaniaServer /game_settings=MatchSettings/MatchSettings.txt /dedicated_cfg=dedicated_cfg.txt /nodaemon
  echo [\$(date +'%d %b %Y %T.%3N')] Server exited with code \$? | tee -a /app/server/.pm2/logs/docker.log
  echo 'Restarting...'
done) &" > run.sh
if [ "$INSTALL_ON_STARTUP" != "NO" ]; then
  echo "npm i --prefix /app/server/trakman" >> run.sh
fi
echo "npm run build --prefix /app/server/trakman
chmod -R a+w /app/server
cd trakman
trap 'echo Terminating; npx pm2 stop 0; npx pm2 kill; exit' SIGTERM SIGINT
npm run daemon
wait \$!" >> run.sh
chown server:server run.sh
chmod 766 run.sh
exec su-exec server ./run.sh
