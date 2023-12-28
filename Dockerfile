# Creates a runnable environment with a dedicated server and trakman
FROM node:lts-alpine
# setup directory
RUN mkdir -p /app/server
WORKDIR /app/server
# copy useful trakman files and entrypoint command
COPY ./config ./trakmanbk/config
COPY ./plugins ./trakmanbk/plugins
COPY ./src ./trakmanbk/src
COPY ./Plugins.ts ./trakmanbk/Plugins.ts
COPY ./package.json ./trakmanbk/package.json
COPY ./tsconfig.json ./trakmanbk/tsconfig.json
COPY ./CHANGELOG.md ./trakmanbk/CHANGELOG.md
COPY --chmod=0755 ./docker_run.sh ./docker_run.sh
# download dedicated server and remove unnecessary files
RUN wget -O serv.zip http://files2.trackmaniaforever.com/TrackmaniaServer_2011-02-21.zip
RUN unzip serv.zip
RUN rm -r serv.zip CommandLine.html ListCallbacks.html ListMethods.html \
    Readme_Dedicated.html RemoteControlExamples TrackmaniaServer.exe manialink_dedicatedserver.txt
# get trakman dependencies and build
WORKDIR /app/server/trakmanbk
RUN npm i
RUN npm i typescript@latest
RUN npm run build
WORKDIR /app/server
# backup important files to prevent them being deleted by mounting the volume
RUN mv GameData/Config/dedicated_cfg.txt dedicated_cfg.txt.bk
RUN mkdir -p Tracksbk/MatchSettings
RUN mkdir -p Tracksbk/Campaigns/Nations
RUN mv GameData/Tracks/MatchSettings/Nations/NationsBlue.txt Tracksbk/MatchSettings/MatchSettings.txt
RUN mv GameData/Tracks/Campaigns/Nations/Blue Tracksbk/Campaigns/Nations/
# install xml editing tool for it
RUN apk add xmlstarlet
# expose volumes
VOLUME /app/server/GameData/Config
VOLUME /app/server/GameData/Tracks
VOLUME /app/server/trakman
VOLUME /root/.pm2/logs

CMD /app/server/docker_run.sh
