import { Client } from "./client/Client.js"
import { Logger } from "./Logger.js"
import { Utils } from "./Utils.js"

export class ServerConfig {

  private static _config: ServerInfo
  private static readonly proxyMethods: string[] = [
    'SetCallVoteTimeOut',
    'SetCallVoteRatio',
    'SetCallVoteRatios',
    'SetServerName',
    'SetServerComment',
    'SetServerPassword',
    'SetServerPasswordForSpectator',
    'SetMaxPlayers',
    'SetMaxSpectators',
    'SetLadderMode',
    'SetVehicleNetQuality',
    'SetServerOptions'
  ]

  static async initialize(): Promise<void> {
    await this.update()
    Client.addProxy(this.proxyMethods, async (method: string, params: CallParams[]): Promise<void> => {
      Logger.info(`Server config changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
  }

  static async update(): Promise<void> {
    const res = await Utils.multiCall(
      { method: 'GetServerOptions' },
      { method: 'GetDetailedPlayerInfo', params: [{ string: 'ciekma_test' }] }, //TODO FETCH THE LOGIN FIRST
      { method: 'GetVersion' }
    )
    if (res instanceof Error) {
      Logger.error('Failed to fetch server info', res.message)
      return
    }
    const options: any[] | Error = res[0] instanceof Error ? res[0] : res[0].params
    const loginInfo: any[] | Error = res[1] instanceof Error ? res[1] : res[1].params
    const version: any[] | Error = res[2] instanceof Error ? res[2] : res[2].params
    if (options instanceof Error) {
      Logger.error(`Failed to fetch server options.`, options.message)
      return
    }
    if (loginInfo instanceof Error) {
      Logger.error(`Failed to fetch server login info.`, loginInfo.message)
      return
    }
    if (version instanceof Error) {
      Logger.error(`Failed to fetch server version.`, version.message)
      return
    }
    this._config = {
      name: options[0].Name,
      comment: options[0].Comment,
      password: options[0].Password,
      passwordForSpectator: options[0].PasswordForSpectator,
      currentMaxPlayers: options[0].CurrentMaxPlayers,
      nextMaxPlayers: options[0].NextMaxPlayers,
      currentMaxSpectators: options[0].CurrentMaxSpectators,
      nextMaxSpectators: options[0].NextMaxSpectators,
      isP2PUpload: options[0].IsP2PUpload,
      isP2PDownload: options[0].IsP2PDownload,
      currentLadderMode: options[0].CurrentLadderMode,
      nextLadderMode: options[0].NextLadderMode,
      currentVehicleNetQuality: options[0].CurrentVehicleNetQuality,
      nextVehicleNetQuality: options[0].NextVehicleNetQuality,
      currentCallVoteTimeOut: options[0].CurrentCallVoteTimeOut,
      nextCallVoteTimeOut: options[0].NextCallVoteTimeOut,
      callVoteRatio: options[0].CallVoteRatio,
      allowMapDownload: options[0].AllowChallengeDownload,
      autoSaveReplays: options[0].AutoSaveReplays,
      // Stuff from PlayerInfo
      login: loginInfo[0].Login, // Already in .env tho
      id: loginInfo[0].PlayerId, // Always 0
      zone: loginInfo[0].Path.substring(6), // Remove "World"
      ipAddress: loginInfo[0].IPAddress.split(':')[0], // Throw port away
      isUnited: loginInfo[0].OnlineRights === 3 ? true : false,
      // Stuff from GetVersion
      game: version[0].Name,
      version: version[0].Version,
      build: version[0].Build
    }
  }

  static get config(): ServerInfo {
    return { ...this._config }
  }

}