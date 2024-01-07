# Creates a runnable environment with a dedicated server and trakman
FROM node:lts-alpine
# create directory, install xml editing tool and setup non-root user
RUN adduser -h /app/server -s /bin/sh -D -u 1001 server && \
    apk add xmlstarlet su-exec
USER server
WORKDIR /app/server
# copy useful trakman files and entrypoint command
COPY --chown=1001:1001 ./config ./trakmanbk/config
COPY --chown=1001:1001 ./plugins ./trakmanbk/plugins
COPY --chown=1001:1001 ./src ./trakmanbk/src
COPY --chown=1001:1001 ./Plugins.ts ./package.json ./tsconfig.json ./CHANGELOG.md ./trakmanbk/
COPY --chown=1001:1001 --chmod=0755 ./docker_run.sh ./docker_run.sh
# download dedicated server and remove unnecessary files
RUN wget -O serv.zip http://files2.trackmaniaforever.com/TrackmaniaServer_2011-02-21.zip && \
    unzip serv.zip && \
    rm -r serv.zip CommandLine.html ListCallbacks.html ListMethods.html \
    Readme_Dedicated.html RemoteControlExamples TrackmaniaServer.exe manialink_dedicatedserver.txt
# get trakman dependencies and build
WORKDIR /app/server/trakmanbk
RUN npm i && \
    npm run build
WORKDIR /app/server
# backup important files to prevent them being deleted by mounting the volume
RUN mv GameData/Config/dedicated_cfg.txt dedicated_cfg.txt.bk && \
    mkdir -p Tracksbk/MatchSettings && \
    mkdir -p Tracksbk/Campaigns/Nations && \
    mv GameData/Tracks/MatchSettings/Nations/NationsBlue.txt Tracksbk/MatchSettings/MatchSettings.txt && \
    mv GameData/Tracks/Campaigns/Nations/Blue Tracksbk/Campaigns/Nations/ && \
    mkdir trakman
# expose volumes
VOLUME /app/server/GameData/Config
VOLUME /app/server/GameData/Tracks
VOLUME /app/server/trakman
VOLUME /app/server/.pm2/logs
# set user back to root to be able to chown volumes in the run script
STOPSIGNAL SIGINT
USER root
CMD /app/server/docker_run.sh
