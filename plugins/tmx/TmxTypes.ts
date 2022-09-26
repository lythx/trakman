export interface TMXMapChangedInfo {
  history: (TM.TMXMap | null)[]
  current: TM.TMXMap | null
  queue: (TM.TMXMap | null)[]
}
