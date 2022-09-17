interface TMListener {
  readonly event: (keyof TMEvents) | (keyof TMEvents)[]
  readonly callback: ((params: any) => void)
}
