#!/bin/sh
# Do **NOT** run this script locally,
# it is meant to only be used in the provided Docker environment.

# create and copy dedicated config
if find /app/server/GameData/Config -mindepth 1 -maxdepth 1 | read; then
  echo 'Server config exists, skipping initial setup.'
  rm dedicated_cfg.txt.bk
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
  xml ed -L -u "/dedicated/server_options/password" -v "$SERVER_PASSWORD" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/server_port" -v "$SERVER_NET_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/server_p2p_port" -v "$SERVER_P2P_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/xmlrpc_port" -v "$SERVER_PORT" dedicated_cfg.txt.bk
  xml ed -L -u "/dedicated/system_config/packmask" -v "$SERVER_PACKMASK" dedicated_cfg.txt.bk
  mv /app/server/dedicated_cfg.txt.bk /app/server/GameData/Config/dedicated_cfg.txt
fi
# copy over default tracks
if find /app/server/GameData/Tracks -mindepth 1 -maxdepth 1 | read; then
  echo 'Tracks exist, skipping initial setup.'
  rm -r Tracksbk
else
  echo 'Setting up tracks...'
  mv /app/server/Tracksbk/* /app/server/GameData/Tracks/
fi
# update and copy over Trakman directory
if find /app/server/trakman -mindepth 1 -maxdepth 1 | read; then
  echo 'Trakman exists. Attempting update...'
  cd trakman || exit
  cp ../trakmanbk/Update.js .
  node Update.js /app/server/trakmanbk/.hashes.json
  if [ $? -gt 0 ]; then
    chown server:server update.log
    echo 'Update not fully successful, please stop the container.'
    sleep 1m # wait a minute for user to read the message, or to realise something's wrong
    exit
  fi
  cd ..
  rm -r trakmanbk
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
mkdir -p trakman/temp
touch trakman/temp/rank_coherence.txt
mkdir -p trakman/plugins/server_links/temp
touch trakman/plugins/server_links/temp/data.txt
chown -R server:server /app/server
# build and actually run everything
echo "#!/bin/sh
(while true; do
  /app/server/TrackmaniaServer /game_settings=MatchSettings/MatchSettings.txt /dedicated_cfg=dedicated_cfg.txt /nodaemon
  echo 'Server exited with code ' $?
  echo 'Restarting...'
done) &
npm i --prefix /app/server/trakman
npm run build --prefix /app/server/trakman
chmod -R a+w /app/server
cd trakman
trap 'echo Terminating; npx pm2 stop 0; npx pm2 kill; exit' SIGTERM SIGINT
npx pm2 start ./built/src/Main.js --name Trakman
wait $!" > run.sh
chown server:server run.sh
chmod 766 run.sh
exec su-exec server ./run.sh
