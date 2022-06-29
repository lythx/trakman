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
        const res = await Client.call('GetServerOptions')
        if (res instanceof Error) {
            ErrorHandler.fatal('Cant fetch server info', res.message)
            return
        }
        const options = res[0]
        this._config = {
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
            autoSaveReplays: options.AutoSaveReplays
        }
    }

    static get config(): ServerInfo {
        return { ...this._config }
    }

}