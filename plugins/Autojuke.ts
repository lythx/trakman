import { TRAKMAN as TM } from "../src/Trakman.js";

TM.addCommand({
  aliases: ['aj', 'autojuke'],
  help: 'Juke a random map. Options: nofinish(nofin), norank, noauthor',
  params: [{ name: 'option', optional: true }],
  callback: async (info, option?: string) => {
    if (info.privilege <= 0 && TM.jukebox.some(a => a.callerLogin === info.login)) {
      TM.sendMessage(`${TM.palette.server}» ${TM.palette.vote}You can't add more than one map to the queue.`)
      return
    }
    switch (option) {
      case 'nofinish': case 'nofin': {
        const mapsWithRec = (await TM.fetchRecordsByLogin(info.login)).map(a => a.map)
        console.log(mapsWithRec.length, 'rec')
        console.log(TM.maps.length, 'all')
        const eligibleMaps = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id &&
          !mapsWithRec.includes(a.id))
          console.log(eligibleMaps.length, 'eligible')
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No unfinished maps available', info.login)
          return
        }
        const map = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)} `
          + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.vote} to the queue.`)
        break
      }
      case 'noauthor': {
        const mapsWithAuthor = (await TM.fetchRecordsByLogin(info.login))
          .filter(a => TM.maps.find(b => b.id === a.map)?.authorTime ?? Infinity < a.time).map(a => a.map)
        const eligibleMaps = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id &&
          !mapsWithAuthor.includes(a.id))
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps with no author time available', info.login)
          return
        }
        const map = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)} `
          + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.vote} to the queue.`)
        break
      }
      case 'norank': {
        const ranks: { mapId: string; rank: number; }[] = []
        for (let i = 0; ; i++) {
          console.log(i)
          if (i * 500 > TM.maps.length) { break }
          ranks.push(...(await TM.fetchMapRank(info.login, TM.maps.slice(i * 300, (i + 1) * 300).map(a => a.id))).filter(a => a.rank <= TM.localRecordsAmount))
          if (ranks.length > 300) { break }
        }
        const eligibleMaps = ranks.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.mapId) &&
          !TM.previousMaps.some(b => b.id === a.mapId) &&
          TM.map.id !== a.mapId)
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps with no rank available', info.login)
          return
        }
        const id = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)].mapId
        TM.addToJukebox(id, info.login)
        const map = TM.maps.find(a => a.id === id)
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)} `
          + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(map?.name ?? '', true)}${TM.palette.vote} to the queue.`)
        break
      }
      default: {
        const eligibleMaps = TM.maps.filter(a =>
          !TM.jukebox.some(b => b.map.id === a.id) &&
          !TM.previousMaps.some(b => b.id === a.id) &&
          TM.map.id !== a.id)
        if (eligibleMaps.length === 0) {
          TM.sendMessage('No maps available', info.login)
          return
        }
        const map = eligibleMaps[Math.floor(Math.random() * eligibleMaps.length)]
        TM.addToJukebox(map.id, info.login)
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickname, true)} `
          + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.vote} to the queue.`)
      }
    }
  },
  privilege: 0
})