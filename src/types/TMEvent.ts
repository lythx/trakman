interface TMEvent {
  readonly event: string
  readonly callback: ((params: any) => void)
}
