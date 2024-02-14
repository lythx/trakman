import fetch from "node-fetch"
import { UltimaniaRecord } from "./UltimaniaTypes"
import config from './Config.js'


async function fetchRecords(mapId: string): Promise<UltimaniaRecord[] | Error> {
  const res = await fetch(`${config.host}/maps/${mapId}/records`)
  if (!res.ok) {
    return new Error() // TODO
  }
  const data = await res.json() as any
  return data.map((a: any) => ({
    login: a.player_login,
    nickname: a.player.nick,
    score: a.score,
    date: new Date(Number(a.updated_at) * 1000)
  }))
}

async function sendRecord(mapId: string, record: UltimaniaRecord) {
  const body = JSON.stringify({
    player_login: record.login,
    map_uid: mapId,
    score: record.score
  })
  const res = await fetch(`${config.host}/records`, {
    method: 'PUT',
    headers: {
      'Content-Type': `application/json`
    },
    body
  })
  if (!res.ok) {
    return new Error() // TODO
  }
  return true
}

async function updatePlayer(player: { login: string, nickname: string }) {
  const body = JSON.stringify({
    login: player.login,
    nick: player.nickname
  })
  const res = await fetch(`${config.host}/players`, {
    method: 'PUT',
    headers: {
      'Content-Type': `application/json`
    },
    body
  })
  if (!res.ok) {
    return new Error() // TODO
  }
  return true
}

export { fetchRecords, updatePlayer, sendRecord }


