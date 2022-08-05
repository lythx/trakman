import { TRAKMAN as TM } from "../src/Trakman.js";

TM.commands.add({
  aliases: ['aj', 'autojuke'],
  help: 'Juke a random map. Options: nofinish(nofin), norank, noauthor',
  params: [{ name: 'option', optional: true }],
  callback: async (info, option?: string): Promise<void> => {
    if (info.privilege <= 0 && TM.jukebox.some(a => a.callerLogin === info.login)) {
      TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.vote}You can't add more than one map to the queue.`)
      return
    }
    switch (option) {
      case 'nofinish': case 'nofin': {
        const mapsWithRec: string[] = (await TM.records.fetchByLogin(info.login)).map(a => a.map)
        const eligibleMaps: TMMap[] = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id &&
          !mapsWithRec.includes(a.id))
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No unfinished maps available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)} `
          + `${TM.utils.palette.vote}added ${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.vote} to the queue.`)
        break
      }
      case 'noauthor': {
        const mapsWithAuthor: string[] = (await TM.records.fetchByLogin(info.login))
          .filter(a => TM.maps.find(b => b.id === a.map)?.authorTime ?? Infinity < a.time).map(a => a.map)
        const eligibleMaps: TMMap[] = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id &&
          !mapsWithAuthor.includes(a.id))
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps with no author time available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)} `
          + `${TM.utils.palette.vote}added ${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.vote} to the queue.`)
        break
      }
      case 'norank': {
        const ranks: { mapId: string; rank: number; }[] = []
        let i: number = -1
        const fetchSize: number = 300
        do {
          i++
          if (i * 500 > TM.maps.length) { break }
          ranks.push(...(await TM.fetchMapRank(info.login, TM.maps.slice(i * fetchSize, (i + 1) * fetchSize).map(a => a.id))).filter(a => a.rank <= TM.records.localsAmount))
        } while (((i + 1) * fetchSize) - ranks.length < fetchSize)
        const list: TMMap[] = TM.maps.slice(0, (i + 1) * fetchSize)
        const eligibleMaps: TMMap[] = list.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id &&
          !ranks.some(b => a.id === b.mapId))
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps with no rank available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)} `
          + `${TM.utils.palette.vote}added ${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.vote} to the queue.`)
        break
      }
      default: {
        const eligibleMaps: TMMap[] = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id)
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps available', info.login)
          return
        }
        const map: TMMap = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)} `
          + `${TM.utils.palette.vote}added ${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.vote} to the queue.`)
      }
    }
  },
  privilege: 0
})