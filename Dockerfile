# Creates a runnable environment with the dedicated server and Trakman
FROM node:lts-alpine
RUN mkdir -p /app/server
WORKDIR /app/server
# copy useful trakman files
COPY ./config ./trakman/config
COPY ./plugins ./trakman/plugins
COPY ./src ./trakman/src
COPY ./Plugins.ts ./trakman/Plugins.ts
COPY ./package.json ./trakman/package.json
COPY ./tsconfig.json ./trakman/tsconfig.json
# download dedicated server and set it up using NationsBlue as the default tracks
RUN wget -O serv.zip http://files2.trackmaniaforever.com/TrackmaniaServer_2011-02-21.zip
RUN unzip serv.zip
RUN rm serv.zip
RUN cp GameData/Tracks/MatchSettings/Nations/NationsBlue.txt GameData/Tracks/MatchSettings/MatchSettings.txt
# get trakman dependencies and build
WORKDIR /app/server/trakman
RUN npm i
RUN npm i typescript@latest
RUN npm run build
WORKDIR /app/server
# backup to-be-volume files
RUN mv ./trakman/* ./trakmanbk
RUN mv GameData/Config/dedicated_cfg.txt dedicated_cfg.txt.bk
# expose volumes
VOLUME /app/server/GameData/Config
VOLUME /app/server/trakman
# create a run script and use it as entry point
RUN echo -e "#!/bin/sh\n\
if find /app/server/GameData/Config -mindepth 1 -maxdepth 1 | read; then echo 'bruh'; else \
mv /app/server/dedicated_cfg.txt.bk /app/server/GameData/Config/dedicated_cfg.txt; fi\n\
if find /app/server/trakman -mindepth 1 -maxdepth 1 | read; then echo 'frfr'; else \
mv /app/server/trakmanbk/* /app/server/trakman/; fi\n\
npm run build --prefix /app/server/trakman\n\
/app/server/TrackmaniaServer /game_settings=MatchSettings/MatchSettings.txt /dedicated_cfg=dedicated_cfg.txt\n\
npm run daemon --prefix /app/server/trakman" > run.sh && chmod +x run.sh
CMD /app/server/run.sh
