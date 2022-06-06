interface ServerInfo {
    name: string
    comment: string
    password: string
    passwordForSpectator: string
    currentMaxPlayers: number
    nextMaxPlayers: number
    currentMaxSpectators: number
    nextMaxSpectators: number
    isP2PUpload: boolean
    isP2PDownload: boolean
    currentLadderMode: number
    nextLadderMode: number
    currentVehicleNetQuality: number
    nextVehicleNetQuality: number
    currentCallVoteTimeOut: number
    nextCallVoteTimeOut: number
    callVoteRatio: number
    allowChallengeDownload: boolean
    autoSaveReplays: boolean
}