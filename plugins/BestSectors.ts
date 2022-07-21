import { TRAKMAN as TM } from '../src/Trakman.js'

interface mapSectors {
  readonly mapId: string
  readonly logins: string[]
  readonly sectors: number[]
}

const createQuery = `CREATE TABLE IF NOT EXISTS secrecs(
  logins VARCHAR(25)[],
  mapId VARCHAR(27) NOT NULL,
  sectors INT4[],
  PRIMARY KEY(mapId)
);`

let secRecs: mapSectors

const fetchSectors = async (mapId: string): Promise<void> => {
  const res: mapSectors[] | Error = await TM.queryDB('SELECT * FROM secrecs WHERE mapId=$1;', [mapId])
  if (res instanceof Error) {
    TM.error(`Error when fetching sector records`, res.message)
    return
  }
  secRecs = res[0] ?? { mapId, sectors: [], logins: []}
}
const updateDB = async (): Promise<void> => {
  const query = `UPDATE secrecs SET logins=$1, sectors=$2 WHERE mapId=$3;`
  const res: any[] | Error = await TM.queryDB(query, [secRecs.logins, secRecs.sectors, secRecs.mapId])
  if (res instanceof Error) {
    TM.error(`Error when updating sector records`, res.message)
    return
  }
}

TM.addListener('Controller.Ready', async (): Promise<void> => {
  await TM.queryDB(createQuery)
  void fetchSectors(TM.map.id)
})

TM.addListener('Controller.BeginMap', (info: BeginMapInfo): void => void fetchSectors(info.id))

TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
  const sector = secRecs.sectors[info.index]
  console.log(sector, info.index)
  if (sector === undefined || sector > info.time) {
    secRecs.sectors[info.index] = info.time
    secRecs.logins[info.index] = info.player.login
    updateDB()
  }
})