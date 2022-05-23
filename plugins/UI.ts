'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

const plugins: TMEvent[] = [
    {
        event: 'Controller.Ready',
        callback: async () => {
            const customUi: string =
                `<manialinks><manialink id="0"><line></line></manialink><custom_ui>`
                + `<notice visible="false"/>`
                + `<challenge_info visible="false"/>`
                + `<net_infos visible="true"/>`
                + `<chat visible="true"/>`
                + `<checkpoint_list visible="true"/>`
                + `<round_scores visible="true"/>`
                + `<scoretable visible="true"/>`
                + `<global visible="true"/>`
                + `</custom_ui></manialinks>`
            await TM.call('SendDisplayManialinkPage', [{ string: customUi }, { int: 0 }, { boolean: false }])
        }
    },
    {
        event: 'TrackMania.BeginChallenge', // Need a Controller event for better handling
        callback: async (params: any[]) => {

        }
    },
]

for (const plugin of plugins) {
    TM.addListener(plugin.event, plugin.callback)
}