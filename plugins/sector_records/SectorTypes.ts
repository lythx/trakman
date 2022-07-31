export type BestSectors = ({
  login: string
  nickname: string
  sector: number
  date: Date
} | undefined)[]

export interface PlayerSectors {
  readonly login: string
  readonly sectors: (number | undefined)[]
}

export interface SectorEventFunctions {
  'BestSector': ((login: string, nickname: string, index: number, date: Date) => void)
  'SectorsFetch': ((sectors: BestSectors) => void)
  'DeleteBestSector': ((sectors: BestSectors) => void)
  'DeletePlayerSector': ((login: string) => void)
  'PlayerSector': ((login: string, nickname: string, index: number) => void)
}