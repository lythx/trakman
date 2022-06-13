export default interface IPopupWindow {
    readonly id: number
    readonly openId: number
    readonly closeId: number
    readonly displayedToPlayers: string[]
    displayToPlayer(login: string): void
    closeToPlayer(login: string): void
    constructHeader(login: string): string
    constructContent(login: string): string
    constructFooter(login: string): string
}