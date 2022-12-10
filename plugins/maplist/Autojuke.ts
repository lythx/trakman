/**
 * Adds commands used to quickly add maps to queue based on given conditions
 * @author lythx
 * @since 0.4
 */

import { maplist } from './Maplist.js'
import config from './Config.js'

const chooseAndAddMap = (maps: tm.Map[], info: { nickname: string, login: string }, errorMsg: string): void => {
  const eligibleMaps: tm.Map[] = maps.filter(a =>
    !tm.jukebox.juked.some(b => b.map.id === a.id) &&
    !tm.jukebox.history.some(b => b.id === a.id) &&
    tm.maps.current.id !== a.id)
  if (eligibleMaps.length === 0) {
    tm.sendMessage(errorMsg, info.login)
    return
  }
  const map: tm.Map = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
  tm.jukebox.add(map.id, info)
  tm.sendMessage(tm.utils.strVar(config.added, {
    nickname: tm.utils.strip(info.nickname, true),
    map: tm.utils.strip(map.name, true)
  }))
}

const autojuke = async (info: { privilege: number, login: string, nickname: string },
  option?: string): Promise<void> => {
  if (info.privilege <= 0 && tm.jukebox.juked.some(a => a.callerLogin === info.login)) {
    tm.sendMessage(config.noPermission, info.login)
    return
  }
  switch (option) {
    case 'nofinish': case 'nofin': {
      const mapsNoRec: Readonly<tm.Map>[] = await maplist.filterNoFinish(info.login)
      chooseAndAddMap(mapsNoRec, info, config.noFinishError)
      break
    }
    case 'noauthor': {
      const mapsNoAuthor: Readonly<tm.Map>[] = await maplist.filterNoAuthor(info.login)
      chooseAndAddMap(mapsNoAuthor, info, config.noAuthorError)
      break
    }
    case 'norank': {
      const mapsNoRank: Readonly<tm.Map>[] = await maplist.filterNoRank(info.login)
      chooseAndAddMap(mapsNoRank, info, config.noRankError)
      break
    }
    default: {
      chooseAndAddMap(tm.maps.list, info, config.defaultError)
    }
  }
}

tm.commands.add({
  aliases: config.autojuke.aliases,
  help: config.autojuke.help,
  params: [{ name: 'option', optional: true }],
  callback: autojuke,
  privilege: config.autojuke.privilege
})
