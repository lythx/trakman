import { trakman as tm } from "../src/Trakman.js";

tm.commands.add({
  aliases: ['aj', 'autojuke'],
  help: 'Juke a random map. Options: nofinish(nofin), norank, noauthor',
  params: [{ name: 'option', optional: true }],
  callback: async (info, option?: string): Promise<void> => {
    if (info.privilege <= 0 && tm.jukebox.juked.some(a => a.callerLogin === info.login)) {
      tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.vote}You can't add more than one map to the queue.`, info.login)
      return
    }
    switch (option) {
      case 'nofinish': case 'nofin': {
        const mapsWithRec: string[] = (await tm.records.fetchByLogin(info.login)).map(a => a.map)
        const eligibleMaps: TMMap[] = tm.maps.list.filter(a =>
          !tm.jukebox.juked.some(b => b.map.id === a.id) &&
          !tm.jukebox.history.some(b => b.id === a.id) &&
          tm.maps.current.id !== a.id &&
          !mapsWithRec.includes(a.id))
        if (eligibleMaps.length === 0) {
          tm.sendMessage('No unfinished maps available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        tm.jukebox.add(map.id, info)
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)} `
          + `${tm.utils.palette.vote}added ${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.vote} to the queue.`)
        break
      }
      case 'noauthor': {
        const mapsWithAuthor: string[] = (await tm.records.fetchByLogin(info.login))
          .filter(a => tm.maps.list.find(b => b.id === a.map)?.authorTime ?? Infinity < a.time).map(a => a.map)
        const eligibleMaps: TMMap[] = tm.maps.list.filter(a =>
          !tm.jukebox.juked.some(b => b.map.id === a.id) &&
          !tm.jukebox.history.some(b => b.id === a.id) &&
          tm.maps.current.id !== a.id &&
          !mapsWithAuthor.includes(a.id))
        if (eligibleMaps.length === 0) {
          tm.sendMessage('No maps with no author time available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        tm.jukebox.add(map.id, info)
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)} `
          + `${tm.utils.palette.vote}added ${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.vote} to the queue.`)
        break
      }
      case 'norank': {
        const ranks: { mapId: string; rank: number; }[] = []
        let i: number = -1
        const fetchSize: number = 300
        do {
          i++
          if (i * 500 > tm.maps.list.length) { break }
          ranks.push(...(await tm.fetchMapRank(info.login, tm.maps.list.slice(i * fetchSize, (i + 1) * fetchSize).map(a => a.id))).filter(a => a.rank <= tm.records.maxLocalsAmount))
        } while (((i + 1) * fetchSize) - ranks.length < fetchSize)
        const list: TMMap[] = tm.maps.list.slice(0, (i + 1) * fetchSize)
        const eligibleMaps: TMMap[] = list.filter(a =>
          !tm.jukebox.juked.some(b => b.map.id === a.id) &&
          !tm.jukebox.history.some(b => b.id === a.id) &&
          tm.maps.current.id !== a.id &&
          !ranks.some(b => a.id === b.mapId))
        if (eligibleMaps.length === 0) {
          tm.sendMessage('No maps with no rank available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        tm.jukebox.add(map.id, info)
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)} `
          + `${tm.utils.palette.vote}added ${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.vote} to the queue.`)
        break
      }
      default: {
        const eligibleMaps: TMMap[] = tm.maps.list.filter(a =>
          !tm.jukebox.juked.some(b => b.map.id === a.id) &&
          !tm.jukebox.history.some(b => b.id === a.id) &&
          tm.maps.current.id !== a.id)
        if (eligibleMaps.length === 0) {
          tm.sendMessage('No maps available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        tm.jukebox.add(map.id, info)
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)} `
          + `${tm.utils.palette.vote}added ${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.vote} to the queue.`)
      }
    }
  },
  privilege: 0
})