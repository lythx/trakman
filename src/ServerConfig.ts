import { Client } from "./client/Client.js"
import { Events } from "./Events.js"
import { Logger } from "./Logger.js"

export class ServerConfig {

  private static _config: tm.ServerInfo
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
    Client.addProxy(this.proxyMethods, async (method: string, params: tm.CallParams[]): Promise<void> => {
      Logger.info(`Server config changed. Dedicated server method used: ${method}, params: `, JSON.stringify(params))
      await this.update()
    })
  }

  static async update(): Promise<void> {
    const systemRes = await Client.call('GetSystemInfo')
    if (systemRes instanceof Error) {
      Logger.error(`Failed to fetch system info.`, systemRes.message)
      return
    }
    const res = await Client.call('system.multicall',
      [
        { method: 'GetServerOptions' },
        { method: 'GetDetailedPlayerInfo', params: [{ string: systemRes.ServerLogin }] },
        { method: 'GetVersion' }
      ]
    )
    if (res instanceof Error) {
      Logger.error('Failed to fetch server info', res.message)
      return
    }
    const options: any | Error = res[0] instanceof Error ? res[0] : res[0].params
    const loginInfo: any | Error = res[1] instanceof Error ? res[1] : res[1].params
    const version: any | Error = res[2] instanceof Error ? res[2] : res[2].params
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
      // server options
      name: options.Name,
      comment: options.Comment,
      password: options.Password,
      passwordForSpectator: options.PasswordForSpectator,
      currentMaxPlayers: options.CurrentMaxPlayers,
      nextMaxPlayers: options.NextMaxPlayers,
      currentMaxSpectators: options.CurrentMaxSpectators,
      nextMaxSpectators: options.NextMaxSpectators,
      isP2PUpload: options.IsP2PUpload,
      isP2PDownload: options.IsP2PDownload,
      currentLadderMode: options.CurrentLadderMode,
      nextLadderMode: options.NextLadderMode,
      currentVehicleNetQuality: options.CurrentVehicleNetQuality,
      nextVehicleNetQuality: options.NextVehicleNetQuality,
      currentCallVoteTimeOut: options.CurrentCallVoteTimeOut,
      nextCallVoteTimeOut: options.NextCallVoteTimeOut,
      callVoteRatio: options.CallVoteRatio,
      allowMapDownload: options.AllowChallengeDownload,
      autoSaveReplays: options.AutoSaveReplays,
      // Stuff from PlayerInfo
      login: loginInfo.Login,
      id: loginInfo.PlayerId, // Always 0
      zone: loginInfo.Path.substring(6), // Remove "World"
      ipAddress: loginInfo.IPAddress.split(':')[0], // Throw port away
      isUnited: loginInfo.OnlineRights === 3,
      // Stuff from GetVersion
      game: version.Name,
      version: version.Version,
      build: version.Build,
    }
    Events.emit('ServerConfigChanged', this._config)
  }

  /**
   * Current dedicated server config
   */
  static get config(): tm.ServerInfo {
    return { ...this._config }
  }

}