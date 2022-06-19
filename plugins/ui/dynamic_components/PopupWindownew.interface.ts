export default interface IPopupWindow {
    readonly id: number
    readonly openId: number
    readonly closeId: number
    readonly displayedToPlayers: string[]
    setupListeners(): void
    displayToPlayer(login: string, params: any): void
    closeToPlayer(login: string, params: any): void
    constructHeader(login: string, params: any): string
    constructContent(login: string, params: any): string
    constructFooter(login: string, params: any): string
}