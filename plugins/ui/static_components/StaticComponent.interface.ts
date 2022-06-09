export default interface IStaticComponent {
    readonly id: number
    readonly displayMode: number
    isDisplayed: boolean
    display(): void
    displayToPlayer(login: string): void
    close(): void
}