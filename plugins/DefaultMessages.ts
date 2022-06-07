import { TRAKMAN as TM } from '../src/Trakman.js'

const events: TMEvent[] = [
  {
    event: 'Controller.Ready',
    callback: async () => {
      // Generate numba
      const flagSeed: number = Math.floor(Math.random() * 10) + 1
      // Make colours obj
      let co = { c1: '', c2: '', c3: '', c4: '', c5: '' }
      switch (flagSeed) {
        case 1: // Agender (fkd up)
          co.c1 = '$000'; co.c2 = '$bcc'; co.c3 = '$bf8'; co.c4 = '$bcc'; co.c5 = '$000'
          break
        case 2: // Aromantic
          co.c1 = '$3a4'; co.c2 = '$ad7'; co.c3 = '$fff'; co.c4 = '$aaa'; co.c5 = '$000'
          break
        case 3: // Transgender
          co.c1 = '$5cf'; co.c2 = '$fab'; co.c3 = '$fff'; co.c4 = '$fab'; co.c5 = '$5cf'
          break
        case 4: // Genderfluid
          co.c1 = '$f7a'; co.c2 = '$fff'; co.c3 = '$c1d'; co.c4 = '$000'; co.c5 = '$23b'
          break
        case 5: // Bisexual
          co.c1 = '$d07'; co.c2 = '$d07'; co.c3 = '$949'; co.c4 = '$03a'; co.c5 = '$03a'
          break
        case 6: // Lesbian (fkd up)
          co.c1 = '$d20'; co.c2 = '$f95'; co.c3 = '$fff'; co.c4 = '$d6a'; co.c5 = '$a06'
          break
        case 7: // Gay (fkd up)
          co.c1 = '$087'; co.c2 = '$9ec'; co.c3 = '$fff'; co.c4 = '$7ae'; co.c5 = '$317'
          break
        case 8: // Asexual (shifted)
          co.c1 = '$000'; co.c2 = '$aaa'; co.c3 = '$fff'; co.c4 = '$808'; co.c5 = '$505'
          break
        case 9: // Pansexual (shifted)
          co.c1 = '$1bf'; co.c2 = '$f28'; co.c3 = '$fd0'; co.c4 = '$1bf'; co.c5 = '$1bf'
          break
        case 10: // Prideflag (shifted)
          co.c1 = '$d22'; co.c2 = '$f81'; co.c3 = '$fe1'; co.c4 = '$074'; co.c5 = '$248'
          break
        default:
          return
      }
      TM.sendMessage(
        `${co.c1}||||||||||||||||||TRAKMAN\n`
        + `${co.c2}||||||||||||||||||0.0.1a\n`
        + `${co.c3}||||||||||||||||||STARTUP\n`
        + `${co.c4}||||||||||||||||||SEQUENCE\n`
        + `${co.c5}||||||||||||||||||SUCCESSFUL`)
    }
  },
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: JoinInfo) => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.servermsg}${TM.getTitle(player)}${TM.palette.highlight}: `
        + `${TM.strip(player.nickName, true)}${TM.palette.servermsg} Country${TM.palette.highlight}: `
        + `${player.nation} ${TM.palette.servermsg}Visits${TM.palette.highlight}: ${player.visits}${TM.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.PlayerLeave',
    callback: async (player: LeaveInfo) => {
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(player.nickName, true)}${TM.palette.servermsg} `
        + `has quit after ${TM.palette.highlight + TM.msToTime(player.sessionTime)}${TM.palette.servermsg}.`)
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: async (info: RecordInfo) => {
      let rs = { str: '', calcDiff: false } // Rec status
      let diff // Difference
      if (info.previousPosition === -1) { rs.str = 'acquired', rs.calcDiff = false }
      else if (info.previousPosition + 1 < info.position) { rs.str = 'obtained', rs.calcDiff = true }
      else if (info.previousPosition + 1 === info.position) { rs.str = 'improved', rs.calcDiff = true }
      else { rs.str = 'equaled', rs.calcDiff = false }
      if (rs.calcDiff) {
        diff = TM.Utils.getTimeString(info.score > info.previousScore ? info.score - info.previousScore : info.previousScore - info.score)
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.record} has `
        + `${rs.str} the ${TM.palette.rank + TM.Utils.getPositionString(info.position)}${TM.palette.record} `
        + `local record. Time${TM.palette.highlight}: ${TM.Utils.getTimeString(info.score)}`)
      // TODO
      //+ `${rs.calcDiff ? ` ${TM.palette.record}$n(${TM.palette.rank + info.previousPosition + 1} ${TM.palette.highlight}-${diff + TM.palette.record})` : ``}`)
    }
  },
  {
    event: 'Controller.DedimaniaRecord',
    callback: async (info: DediRecordInfo) => {
      let rs = { str: '', calcDiff: false } // Rec status
      let diff // Difference
      if (info.previousPosition === -1) { rs.str = 'acquired', rs.calcDiff = false }
      else if (info.previousPosition + 1 < info.position) { rs.str = 'obtained', rs.calcDiff = true }
      else if (info.previousPosition + 1 === info.position) { rs.str = 'improved', rs.calcDiff = true }
      else { rs.str = 'equaled', rs.calcDiff = false }
      if (rs.calcDiff) {
        diff = TM.Utils.getTimeString(info.score > info.previousScore ? info.score - info.previousScore : info.previousScore - info.score)
      }
      TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.dedirecord} has `
        + `${rs.str} the ${TM.palette.rank + TM.Utils.getPositionString(info.position)}${TM.palette.dedirecord} `
        + `dedimania record. Time${TM.palette.highlight}: ${TM.Utils.getTimeString(info.score)}`)
      // TODO
      //+ `${rs.calcDiff ? ` ${TM.palette.dedirecord}$n(${TM.palette.rank + info.previousPosition + 1} ${TM.palette.highlight}-${diff + TM.palette.dedirecord})` : ``}`)
    }
  },
]

for (const event of events) { TM.addListener(event.event, event.callback) }
