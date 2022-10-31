# TRAKMAN
Trackmania Forever server controller written in TypeScript

Info about included plugins and general plugin development can be found on the [project wiki](https://github.com/lythx/trakman/wiki)

## Prerequisites
- [Latest](http://files2.trackmaniaforever.com/TrackmaniaServer_2011-02-21.zip) Trackmania Forever dedicated server
- [Latest](https://nodejs.org/en/download/current/) Node.js
- [Latest](https://www.postgresql.org/download/) PostgreSQL

On Linux, relevant versions of Node & Postgres should be available in your distro's repositories by default (see [[1]](https://repology.org/project/nodejs/versions),  [[2]](https://repology.org/project/postgresql/versions)), that might not be the case if you are a [Debian](https://packages.debian.org/bookworm/nodejs) user.

On Windows, the installation instructions might be a little goofy, thus you are adviced to look into it by yourself (it is never a good idea though).

## Install & Run
See the [relevant wiki page](https://github.com/lythx/trakman/wiki/Installation-Instructions) on the matter.

## Contributions
See the [CONTRIBUTING](https://github.com/lythx/trakman/blob/main/CONTRIBUTING.md) file.

## Recent Changes
See the [CHANGELOG](https://github.com/lythx/trakman/blob/main/CHANGELOG.md) file.

Shortened version of the changelog is normally available in-game via the `/changes` command.

## Settings
Most controller configs descriptions are available on [this wiki page](https://github.com/lythx/trakman/wiki/Controller-Configs).

## Limitations
1. Only the TimeAttack gamemode is fully supported as of now, with Stunts being very low on the priority list.
2. Some of the [methods](https://methods.xaseco.org/methodstmf.php) were never tested, and might be broken.
3. Bugs can still happen rather often.
