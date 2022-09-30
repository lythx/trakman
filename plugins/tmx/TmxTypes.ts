export interface TMXMapChangedInfo {
  history: (tm.TMXMap | null)[]
  current: tm.TMXMap | null
  queue: (tm.TMXMap | null)[]
}
