interface TMBanlistEntry {
    readonly ip: string
    readonly login: string
    readonly nickname: string | undefined
    date: Date
    callerLogin: string
    callerNickname: string
    reason: string | undefined
    expireDate: Date | undefined
}