#!/bin/sh
# Do **NOT** run this script locally,
# it is meant to only be used in the provided docker environment.

# create and copy dedicated config
if find /app/server/GameData/Config -mindepth 1 -maxdepth 1 | read; then
  echo 'Server config exists, skipping initial setup.'
  rm dedicated_cfg.txt.bk
else
  echo 'Setting up server...'
  # cool and ugly xml replacement
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
# copy over trakman directory
if find /app/server/trakman -mindepth 1 -maxdepth 1 | read; then
  echo 'Trakman exists, skipping initial setup.'
  rm -r trakmanbk
else
  echo 'Setting up trakman...'
  mv /app/server/trakmanbk/* /app/server/trakman/
fi
# build and actually run everything
/app/server/TrackmaniaServer /game_settings=MatchSettings/MatchSettings.txt /dedicated_cfg=dedicated_cfg.txt
npm run build --prefix /app/server/trakman
npm run daemon --prefix /app/server/trakman
