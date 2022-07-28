interface TMCommand {
  readonly aliases: string[]
  readonly help?: string
  readonly params?: {
    readonly name: string,
    readonly type?: 'int' | 'double' | 'boolean' | 'time' | 'multiword',
    readonly optional?: true
  }[]
  readonly callback: (info: MessageInfo, ...params: any[]) => void
  readonly privilege: number
}
