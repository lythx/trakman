import { Client } from "./Client.js"
import { ErrorHandler } from "./ErrorHandler.js"

export class ServerConfig {

  private static _config: ServerInfo

  static async initialize(): Promise<void> {
    this.update()
    // Client.addProxy(<methods> , ()=>{
    //    this.update()
    // }) TODO: ADD PROXY FOR ALL COMMANDS WHICH CHANGE SERVER CONFIG
    // then call this method instead of update on new map
  }

  static async update(): Promise<void> {
    //const res: any[]|Error = await Client.call('GetServerOptions')
    const res: any[] | Error = await Client.call('system.multicall', [{
      array:
        [{
          struct: {
            methodName: { string: 'GetServerOptions' },
            params: { array: [] }
          },
        },
        {
          struct: {
            methodName: { string: 'GetDetailedPlayerInfo' },
            params: { array: [{ string: process.env.SERVER_LOGIN }] }
          }
        },
        {
          struct: {
            methodName: { string: 'GetVersion' },
            params: { array: [] }
          }
        }]
    }])
    if (res instanceof Error) {
      ErrorHandler.fatal('Cant fetch server info', res.message)
      return
    }
    const options: any = res
    this._config = {
      name: options[0][0].Name,
      comment: options[0][0].Comment,
      password: options[0][0].Password,
      passwordForSpectator: options[0][0].PasswordForSpectator,
      currentMaxPlayers: options[0][0].CurrentMaxPlayers,
      nextMaxPlayers: options[0][0].NextMaxPlayers,
      currentMaxSpectators: options[0][0].CurrentMaxSpectators,
      nextMaxSpectators: options[0][0].NextMaxSpectators,
      isP2PUpload: options[0][0].IsP2PUpload,
      isP2PDownload: options[0][0].IsP2PDownload,
      currentLadderMode: options[0][0].CurrentLadderMode,
      nextLadderMode: options[0][0].NextLadderMode,
      currentVehicleNetQuality: options[0][0].CurrentVehicleNetQuality,
      nextVehicleNetQuality: options[0][0].NextVehicleNetQuality,
      currentCallVoteTimeOut: options[0][0].CurrentCallVoteTimeOut,
      nextCallVoteTimeOut: options[0][0].NextCallVoteTimeOut,
      callVoteRatio: options[0][0].CallVoteRatio,
      allowMapDownload: options[0][0].AllowChallengeDownload,
      autoSaveReplays: options[0][0].AutoSaveReplays,
      // Stuff from PlayerInfo
      login: options[1][0].Login, // Already in .env tho
      id: options[1][0].PlayerId, // Always 0
      zone: options[1][0].Path.substring(6), // Remove "World"
      ipAddress: options[1][0].IPAddress.split(':')[0], // Throw port away
      isUnited: options[1][0].OnlineRights === 3 ? true : false,
      // Stuff from GetVersion
      game: options[2][0].Name,
      version: options[2][0].Version,
      build: options[2][0].Build
    }
  }

  static get config(): ServerInfo {
    return { ...this._config }
  }

}