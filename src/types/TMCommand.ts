interface TMCommand {
  readonly aliases: string[]
  readonly help?: string
  readonly params?: {
    readonly name: string,
    readonly type?: 'int' | 'double' | 'boolean' | 'time' | 'player' | 'offlinePlayer' | 'multiword',
    readonly validValues?: (string | number)[]
    readonly optional?: true
  }[]
  readonly callback: (info: TMMessageInfo & { aliasUsed: string }, ...params: any[]) => void
  readonly privilege: number
}
