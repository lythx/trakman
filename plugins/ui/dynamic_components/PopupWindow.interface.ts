export default interface IPopupWindow {
    readonly id: number
    readonly openId: number
    readonly closeId: number
    readonly displayedToPlayers: string[]
    setupListeners():void
    displayToPlayer(login: string, page:number): void
    closeToPlayer(login: string, page:number): void
    constructHeader(login: string, page:number): string
    constructContent(login: string, page:number): string
    constructFooter(login: string, page:number): string
}