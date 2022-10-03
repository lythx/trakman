interface TMListener {
  readonly event: (keyof tm.Events) | (keyof tm.Events)[]
  readonly callback: ((params: any) => void)
}
