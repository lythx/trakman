interface TMListener {
  readonly event: TMEvent
  readonly callback: ((params: any) => void)
}
