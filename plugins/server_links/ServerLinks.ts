import config from './Config.js'
import fs from 'fs/promises'
import UiComponent from './ui/ServerLinks.component.js'
import http from 'http'
import fetch from 'node-fetch'

export interface Server {
  name: string
  path?: string
  url?: string
}

export interface ServerInfo {
  login: string
  name: string
  lastUpdate: number
  playerCount: number
  maxPlayerCount: number
  currentMap: string
  currentMapAuthor: string
  gameMode: tm.GameMode
  environment: tm.Environment
  minLadderLimit: number
  maxLadderLimit: number
}

const servers: Server[] = config.servers
const serverInfos: ServerInfo[] = []
let serverData: Omit<ServerInfo, 'name'>
let ui: UiComponent

if (config.isEnabled) {
  tm.addListener('Startup', () => {
    ui = new UiComponent()
    void updateDataFile()
    void refreshOtherServersData()
    if (config.useHttpServer) {
      startHttpServer()
    }
    setInterval(() => {
      void updateDataFile()
      void refreshOtherServersData()
    }, config.refreshTimeout * 1000)
  })
}

async function updateDataFile() {
  const res: { LadderServerLimitMin: number, LadderServerLimitMax: number } | Error =
    await tm.client.call('GetLadderServerLimits')
  if (res instanceof Error) {
    tm.log.error(`Error when getting server ladder limits`, res.message)
    return
  }
  serverData = {
    login: tm.config.server.login,
    lastUpdate: Date.now(),
    playerCount: tm.players.count,
    gameMode: tm.getGameMode(),
    environment: tm.maps.current.environment,
    minLadderLimit: res.LadderServerLimitMin,
    maxLadderLimit: res.LadderServerLimitMax,
    maxPlayerCount: tm.config.server.currentMaxPlayers,
    currentMap: tm.maps.current.name,
    currentMapAuthor: tm.maps.current.author
  }
  try {
    await fs.writeFile(config.dataFilePath, JSON.stringify(serverData))
  } catch { }
}

async function refreshOtherServersData() {
  for (const e of servers) {
    let file: string
    if (e.path !== undefined && e.path.length !== 0) {
      const rawFile = await fs.readFile(e.path).catch(err => err)
      if (rawFile instanceof Error) {
        continue
      }
      file = rawFile.toString()
    } else if (e.url !== undefined && e.url.length !== 0) {
      const res = await fetch(e.url).catch((err: Error) => err)
      if (res instanceof Error) {
        continue
      }
      file = await res.text()
    } else {
      continue
    }
    let newInfo: Partial<ServerInfo>
    try {
      newInfo = JSON.parse(file)
    } catch (err) {
      continue
    }
    const infoObj = constructInfoObject(newInfo, e.name)
    const index = serverInfos.findIndex(a => a.login === infoObj?.login)
    if (infoObj !== undefined && Date.now() - infoObj.lastUpdate < config.updateLimit * 1000) {
      serverInfos[index === -1 ? serverInfos.length : index] = infoObj
    } else if (index !== -1) {
      serverInfos.splice(index, 1)
    }
  }
  ui.update(serverInfos)
}

function constructInfoObject(info: Partial<ServerInfo>, name: string): ServerInfo | undefined {
  if (info.login === undefined || info.lastUpdate === undefined ||
    Date.now() - info.lastUpdate > config.updateLimit * 1000) { return }
  return {
    login: info.login,
    lastUpdate: info.lastUpdate,
    name,
    playerCount: info.playerCount ?? 0,
    gameMode: info.gameMode ?? 'TimeAttack',
    environment: info.environment ?? 'Stadium',
    minLadderLimit: info.minLadderLimit ?? 0,
    maxLadderLimit: info.maxLadderLimit ?? 0,
    maxPlayerCount: info.maxPlayerCount ?? 0,
    currentMap: info.currentMap ?? config.noDataText,
    currentMapAuthor: info.currentMapAuthor ?? config.noDataText
  }

}

function startHttpServer() {

  const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(JSON.stringify(serverData));
  });

  server.listen(config.httpPort, config.httpAddress, () => {
    tm.log.info(`Server links server running at http://${config.httpAddress}:${config.httpPort}`);
  });

}

/**
 * Provides utilites for sharing the server data with related servers, fetching related servers data
 * and renders UI components with related servers information.
 * @author lythx
 * @since 1.3
 */
export const serverLinks = {
  /**
   * Linked online servers current data
   */
  get otherServers(): Readonly<ServerInfo>[] {
    return [...serverInfos]
  },
  /**
   * Data shared by this server
   */
  get thisServer(): Readonly<Omit<ServerInfo, 'name'>> {
    return serverData
  },
  /**
   * Linked servers config
   */
  get serversConfig(): Server[] {
    return servers
  },
  /**
   * Plugin status
   */
  isEnabled: config.isEnabled,
  /**
   * Whether the plugin is using HTTP server for remote links
   */
  isHTTPServerRunning: config.useHttpServer,
  /**
   * HTTP server address for remote links
   */
  httpAddress: config.httpAddress,
  /**
   * HTTP server port for remote links
   */
  httpPort: config.httpPort
}
