'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'
const titles = ['Player' , 'Operator' , 'Admin' , 'Masteradmin' , 'Server Owner']
const specialTitles = [{
  login:'petr_kharpe', title: 'Femboy'
}]

const getTitle=(player: TMPlayer): string =>{
  let title = titles[player.privilege]
  const specialTitle = specialTitles.find(a=>a.login=== player.login)
  if(specialTitle != null){
    title = specialTitle.title
  }
  return title
}

const plugins: TMEvent[] = [
  {
    event: 'Controller.PlayerJoin',
    callback: async (player: TMPlayer) => {
      const title = getTitle(player) 
      const c1 = TM.colours.white
      const c2 = TM.colours.magenta
      const msg = `»» ${c2}${title}${c1}: ${player.nickName}$z$s${c2} Country${c1}: ${player.nation} ${c2}Visits: ${c1}${player.visits}${c2}.`
      TM.sendMessage(msg)
    }
  },
  {
    event: 'Controller.PlayerRecord',
    callback: async (params: any[]) => {
      const player = TM.getPlayer(params[0].login)
      if (player == null) { throw new Error('Cant find player object in runtime memory') }
      const records = TM.getLocalRecords(params[0].challenge, 30)
      const position = records.findIndex(r => r.login === player.login)
      if (position === -1) {
        return
      }
      const msg = `Player $z${player.nickName}$z${TM.colours.white}$s${params[1]}${TM.Utils.getPositionString(position + 1)} local record: ${TM.Utils.getTimeString(params[0].score)}`
      await TM.sendMessage(msg)
    }
  }
]

for (const plugin of plugins) {
  TM.addListener(plugin.event, plugin.callback)
}