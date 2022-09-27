export interface TMGuestlistEntry {
  readonly login: string
  nickname: string | undefined
  date: Date
  callerLogin: string
  callerNickname: string
}