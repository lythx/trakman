export interface TMXMapChangedInfo {
  history: (TMXMapInfo | null)[]
  current: TMXMapInfo | null
  queue: (TMXMapInfo | null)[]
}
