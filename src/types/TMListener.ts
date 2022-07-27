interface TMListener {
  readonly event: TMEvent | TMEvent[]
  readonly callback: ((params: any) => void)
}
