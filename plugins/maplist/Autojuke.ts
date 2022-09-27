
import { maplist } from './Maplist.js'
import config from './Config.js'

const chooseAndAddMap = (maps: TM.Map[], info: { nickname: string, login: string }, errorMsg: string) => {
  const eligibleMaps: TM.Map[] = maps.filter(a =>
    !tm.jukebox.juked.some(b => b.map.id === a.id) &&
    !tm.jukebox.history.some(b => b.id === a.id) &&
    tm.maps.current.id !== a.id)
  if (eligibleMaps.length === 0) {
    tm.sendMessage(errorMsg, info.login)
    return
  }
  const map: TM.Map = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
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
      const mapsNoRec = await maplist.filterNoFinish(info.login)
      chooseAndAddMap(mapsNoRec, info, config.noFinishError)
      break
    }
    case 'noauthor': {
      const mapsNoAuthor = await maplist.filterNoAuthor(info.login)
      chooseAndAddMap(mapsNoAuthor, info, config.noAuthorError)
      break
    }
    case 'norank': {
      const mapsNoRank = await maplist.filterNoRank(info.login)
      chooseAndAddMap(mapsNoRank, info, config.noRankError)
      break
    }
    default: {
      chooseAndAddMap(tm.maps.list, info, config.defaultError)
    }
  }
}

tm.commands.add({
  aliases: ['aj', 'autojuke'],
  help: 'Juke a random map. Options: nofinish(nofin), norank, noauthor',
  params: [{ name: 'option', optional: true }],
  callback: autojuke,
  privilege: 0
})
