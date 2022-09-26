interface PrivilegeChangedInfo {
  readonly player?: TM.OfflinePlayer
  readonly login: string
  readonly newPrivilege: number
  readonly previousPrivilege: number
  readonly caller?: { login: string, nickname: string }
}