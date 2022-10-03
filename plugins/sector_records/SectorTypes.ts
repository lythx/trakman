export type BestSectors = ({
  login: string
  nickname: string
  sector: number
  date: Date
} | undefined)[]

export interface PlayerSectors {
  readonly login: string
  nickname: string
  readonly sectors: (number | undefined)[]
}

export interface SectorEventFunctions {
  'BestSector': ((bestSector: Readonly<{ login: string, nickname: string, index: number, date: Date }>) => void)
  'SectorsFetch': ((bestSectors: Readonly<BestSectors>, playerSectors: readonly Readonly<PlayerSectors>[]) => void)
  'DeleteBestSector': ((deletedSectors: readonly Readonly<{ index: number, login: string, sector: number, date: Date }>[]) => void)
  'DeletePlayerSector': ((player: Readonly<{
    login: string, nickname: string,
    deletedSectors: readonly Readonly<{ index: number, time: number }>[]
  }>) => void)
  'PlayerSector': ((playerSector: Readonly<{ login: string, nickname: string, index: number }>) => void)
  'NicknameUpdated': ((players: Readonly<Readonly<{ login: string, nickname: string }>[]>) => void)
}
