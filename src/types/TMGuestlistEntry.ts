export interface TMGuestlistEntry {
  readonly login: string
  readonly nickname: string | undefined
  date: Date
  callerLogin: string
  callerNickname: string
}