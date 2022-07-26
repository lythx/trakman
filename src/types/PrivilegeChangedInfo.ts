interface PrivilegeChangedInfo  {
  readonly player?: TMOfflinePlayer
  readonly login: string
  readonly newPrivilege: number
  readonly previousPrivilege: number
  readonly callerLogin?: string
}