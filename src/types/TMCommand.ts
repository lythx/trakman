interface TMCommand {
  readonly aliases: string[]
  readonly help?: string
  // idk if type is needed
  readonly params?: { readonly name: string,/* readonly type: 'string' | 'number' | 'boolean' | 'time',*/ readonly optional?: true }[]
  readonly callback: Function
  readonly privilege: number
}
