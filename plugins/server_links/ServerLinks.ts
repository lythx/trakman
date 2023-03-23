import config from './Config.js'
import fs from 'fs/promises'
import UiComponent from './ui/ServerLinks.component.js'
// TODO HANDLE URLS

export interface Server {
  name: string
  login: string
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
let ui: UiComponent

tm.addListener('Startup', () => {
  setInterval(() => {
    void updateDataFile()
    void refreshOtherServersData()
  }, config.refreshTimeout * 1000)
  ui = new UiComponent()
})

async function updateDataFile() {
  const res: { LadderServerLimitMin: number, LadderServerLimitMax: number } | Error =
    await tm.client.call('GetLadderServerLimits')
  if (res instanceof Error) {
    tm.log.error(`Error when getting server ladder limits`, res.message)
    return
  }
  const data: Omit<ServerInfo, 'name'> = {
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
    await fs.writeFile(config.dataFilePath, JSON.stringify(data))
  } catch { }
}

async function refreshOtherServersData() {
  for (const e of servers) {
    if (e.path !== undefined && e.path.length !== 0) {
      const file: Buffer | Error = await fs.readFile(e.path).catch(err => err)
      if (file instanceof Error) {
        continue
      }
      let newInfo: Partial<ServerInfo>
      try {
        newInfo = JSON.parse(file.toString())
      } catch (err) {
        continue
      }
      const infoObj = constructInfoObject(newInfo, e.name)
      const index = serverInfos.findIndex(a => a.login === e.login)
      if (infoObj !== undefined) {
        serverInfos[index] = infoObj
      } else {
        serverInfos.splice(index, 1)
      }
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
    currentMap: info.currentMap ?? '--', // TODO CONFIG
    currentMapAuthor: info.currentMapAuthor ?? '--'
  }

}

export const serverLinks = {
  get infos(): Readonly<ServerInfo>[] {
    return [...serverInfos]
  }
}
