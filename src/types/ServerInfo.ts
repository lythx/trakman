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
    allowMapDownload: boolean
    autoSaveReplays: boolean
    login: string
    id: number
    zone: string
    ipAddress: string
    isUnited: boolean
    game: string
    version: string
    build: string
}