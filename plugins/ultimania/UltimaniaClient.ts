import fetch from "node-fetch"
import type { UltimaniaRecord } from "./UltimaniaTypes"
import config from './Config.js'


async function fetchRecords(mapId: string): Promise<UltimaniaRecord[] | Error> {
  const res = await fetch(`${config.host}/maps/${mapId}/records`).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to fetch ultimania records`, res.message)
    return res
  }
  if (!res.ok) {
    const err = new Error(`Failed to fetch ultimania records. Code: ${res.status} Text: ${res.statusText}`)
    tm.log.error(err.message)
    return err
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
  }).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to send ultimania record`, res.message)
    return res
  }
  if (!res.ok) {
    const err = new Error(`Failed to send ultimania record. Code: ${res.status} Text: ${res.statusText}`)
    tm.log.error(err.message)
    return err
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
  }).catch((err: Error) => err)
  if (res instanceof Error) {
    tm.log.error(`Failed to update ultimania player`, res.message)
    return res
  }
  if (!res.ok) {
    const err = new Error(`Failed to update ultimania player. Code: ${res.status} Text: ${res.statusText}`)
    tm.log.error(err.message)
    return err
  }
  return true
}

export { fetchRecords, updatePlayer, sendRecord }


