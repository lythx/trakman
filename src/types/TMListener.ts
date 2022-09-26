interface TMListener {
  readonly event: (keyof TM.Events) | (keyof TM.Events)[]
  readonly callback: ((params: any) => void)
}
