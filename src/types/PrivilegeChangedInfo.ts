interface PrivilegeChangedInfo {
  readonly player?: TMOfflinePlayer
  readonly login: string
  readonly newPrivilege: number
  readonly previousPrivilege: number
  readonly caller?: { login: string, nickname: string }
}