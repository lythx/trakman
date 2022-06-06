interface TMCommand {
  readonly aliases: string[]
  readonly help?: string
  readonly callback: Function
  readonly privilege: number
}
