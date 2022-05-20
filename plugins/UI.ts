'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

const plugins: TMEvent[] = [
    // {
    //     event: 'Controller.PlayerJoin',
    //     callback:async (player: TMPlayer) => {
    //         console.log('dsfafdsfsdsdf')
    //         TM.sendManialink(`
    //         <manialink id="8088084">
    //         <frame posn="15 15 15">
    //         <quad posn="0 0 0" sizen="10 10" halign="center" valign="center" style="MedalsBig" substyle="MedalGold" action="8088085"/>
    //         </frame></manialink>`)
    //     }
    // }
]

for (const plugin of plugins) {
    TM.addListener(plugin.event, plugin.callback)
  }