export default interface IDynamicComponent {
    readonly id: number
    readonly displayedToPlayers: string[]
    displayToPlayer(login: string): void
    closeToPlayer(login: string): void
}