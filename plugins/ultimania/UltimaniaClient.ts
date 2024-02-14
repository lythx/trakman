import fetch from "node-fetch"
import { UltimaniaRecord } from "./UltimaniaTypes"
export { }

const url = `http://ultimania5.askuri.de/api/v5`

async function fetchRecords(mapId: string): Promise<UltimaniaRecord[] | Error> {
  const res = await fetch(`${url}/maps/${mapId}/records`)
  if (!res.ok) {
    return new Error() // TODO
  }
  const data = await res.json() as any
  return data.map((a: any) => ({
    login: a.player_id,
    nickname: a.player.nick,
    score: a.score,
    date: new Date(a.updated_at)
  }))
}

async function sendRecord(mapId: string, record: UltimaniaRecord) {
  const body = JSON.stringify({
    player_login: record.login,
    map_uid: mapId,
    score: record.score
  })
  const res = await fetch(`${url}/records`, {
    method: 'PUT',
    headers: {
      'Content-Type': `application/json`
    },
    body
  })
  if (!res.ok) {
    return new Error() // TODO
  }
  const data = await res.text()
  return true
}

async function updatePlayer(player: { login: string, nickname: string }) {
  const body = JSON.stringify({
    login: player.login,
    nick: player.nickname
  })
  const res = await fetch(`${url}/players`, {
    method: 'PUT',
    headers: {
      'Content-Type': `application/json`
    },
    body
  })
  if (!res.ok) {
    return new Error() // TODO
  }
  const data = await res.text()
  return true
}

export { fetchRecords, updatePlayer, sendRecord }


