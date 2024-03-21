<div align="center">
<h1>TRAKMAN</h1>

[![License](https://img.shields.io/github/license/lythx/trakman?style=for-the-badge&logo=codesandbox&logoColor=eeeeee&color=aaff44&labelColor=222222)](https://github.com/lythx/trakman/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/lythx/trakman?style=for-the-badge&logo=starship&logoColor=eeeeee&color=ffcc11&labelColor=222222)](https://github.com/lythx/trakman/stargazers)
[![Discord](https://img.shields.io/discord/1130534915218354327?style=for-the-badge&logo=discord&label=chat&logoColor=eeeeee&color=aaaaff&labelColor=222222)](https://discord.gg/vC8vyMthWX)
[![Issues](https://img.shields.io/github/issues-raw/lythx/trakman?style=for-the-badge&logo=gitbook&logoColor=eeeeee&color=ee9799&labelColor=222222)](https://github.com/lythx/trakman/issues)

<h3>Trackmania Forever server controller written in TypeScript</h3>

![Trakman UI](https://trakman.ptrk.eu/TRAKMAN-UI.png)

</div>

## Installation
The recommended and fastest way to install Trakman is by using [Docker](https://docs.docker.com/get-docker), you can find the instructions [here](https://github.com/lythx/trakman/wiki/Docker-Installation)

If you prefer not to use containers and/or want to install manually, [see this page instead](https://github.com/lythx/trakman/wiki/Manual-Installation)

## Manual Installation Requirements
- Trackmania Forever dedicated server [v2011-02-21 / Latest](http://files2.trackmaniaforever.com/TrackmaniaServer_2011-02-21.zip)
- NodeJS [v14.21.3+](https://nodejs.org/en/download) (we recommend using the latest LTS version)
- PostgreSQL [v12+](https://www.postgresql.org/download) (any currently supported version is fine)

On Linux, relevant versions of NodeJS & PostgreSQL should be available in your distro's repositories by default (see [here](https://repology.org/project/nodejs/versions) for NodeJS and [here](https://repology.org/project/postgresql/versions) for PostgreSQL)

On Windows, the installation instructions should be covered by the projects' websites, which are linked above

## XASECO Migration
Information about XASECO database migration is available on [this page](https://github.com/lythx/trakman/wiki/Migration-from-other-controllers)

## Included Plugins
The default shipment of the controller is (somewhat) outlined on [the wiki](https://github.com/lythx/trakman/wiki/Included-Plugins)

## Settings
Most controller configuration options are available on [this wiki page](https://github.com/lythx/trakman/wiki/Controller-Configs)

## Limitations
1. Only the TimeAttack gamemode was thoroughly tested
2. Bugs, while rare, can still happen, [reports are welcome](https://github.com/lythx/trakman/issues)
