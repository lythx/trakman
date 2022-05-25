'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'

// THIS IS A BIG, HUGE, GIGANTIC TODO FOR NOW!!!
// EVENT DESCRIPTIONS TAKEN FROM RE/EYEPIECE

const plugins: TMEvent[] = [
    {
        event: 'Controller.Ready',
        callback: async () => {
            const customUi: string = // Custom UI settings
                `<manialinks><manialink id="0"><line></line></manialink><custom_ui>`
                + `<notice visible="false"/>` // Notice in the top left
                + `<challenge_info visible="false"/>` // Challenge info in the top right
                + `<net_infos visible="true"/>` // Loading bar in the top right
                + `<chat visible="true"/>` // Chat
                + `<checkpoint_list visible="true"/>` // Checkpoint list, right of timer
                + `<round_scores visible="true"/>` // Round scores in rounds mode, right side
                + `<scoretable visible="true"/>` // Scoretable on podium/score
                + `<global visible="true"/>` // All the windows: speed, timer, prev/best, etc.
                + `</custom_ui></manialinks>`
            await TM.call('SendDisplayManialinkPage', [{ string: customUi }, { int: 0 }, { boolean: false }])
            // await TM.call('SetForcedMods', [{ boolean: true }, { array: [{ 'Env': 'Stadium', 'Url': 'https://cdn.discordapp.com/attachments/599381118633902080/979148807998697512/TrakmanDefault.zip' }] }])
            // Enable later ^
        }
    },
    {
        event: 'Controller.PlayerJoin',
        callback: async (player: JoinInfo) => {
            // TODO: Fetch the connecting player info //its all in the passed object

            // TODO: Fetch player records on the current challenge
            // TODO: Display all the widgets for the new player
            // Preferably with an indicator if they have a record
        }
    },
    {
        event: 'Controller.PlayerLeave',
        callback: async (playerInfo: LeaveInfo) => {
            // TODO: Update the widgets to no more indicate the disconnectee's presence
            // That is, if they had any records

            // TODO: Update miscellaneous widgets:
            // Ranking, players/specs...
        }
    },
    {
        event: 'Controller.PlayerFinish', // Need a Controller event, PlayerRecord doesn't fit IMO //done
        callback: async (info: FinishInfo) => {
            // TODO: Update cpcounter to indicate finish
        }
    },
    {
        event: 'Controller.PlayerInfoChanged', // Need a Controller event for better handling //YEAAAAAAAAAAAAAAA
        callback: async (info: InfoChangedInfo) => {
            // TODO: Remove cpcounter if player switched to specmode
            // PlayerInfo['SpectatorStatus'] % 10 !== 0

            // TODO: Update miscellaneous widgets:
            // Ranking, players/specs...
        }
    },
    {
        event: 'Controller.ManialinkClick', // Need a Controller event for better handling //asdasd
        callback: async (info: ManialinkClickInfo) => {
            // This will basically handle every widget click
            // If I were to write every TODO I'd kill myself, so..
            // TODO: Everything about players <-> widgets interaction
        }
    },
    {
        event: 'Controller.DedimaniaRecords',
        callback: async (params: any[]) => { // Should return TMDedi[]
            // TODO: Fill in the Dedimania record widget
        }
    },
    {
        event: 'Controller.PlayerDediRecord', // Not a thing yet
        callback: async (params: any[]) => { // Should return TMRecord (TMDedi?)
            // TODO: Update the Dedimania widget
        }
    },
    {
        event: 'Controller.PlayerRecord',
        callback: async (params: RecordInfo) => { //Should return TMRecord //record info contains both TMRecord and TMPlayer and some other stuf
            // TODO: Update the local records widget
        }
    },
    {
        event: 'TrackMania.ChallengeListModified', // Need a Controller event for better handling 
        callback: async (params: any[]) => {
            // TODO: Re-fetch the next challenge info 
            //calling next challenge info should probably be done in challenge service tho
            //maybe we should always fetch next 5 maps and keep last 5 or somethign idk
            // TODO: Update miscellaneous widgets:
            // Trackcount...
        }
    },
    {
        event: 'Controller.PlayerCheckpoint', // Need a Controller event for better handling //e
        callback: async (info: CheckpointInfo) => {
            // TODO: Update cpcounter to indicate current cp
        }
    },
    {
        event: 'TrackMania.EndChallenge', // Need a Controller event for better handling
        callback: async (params: any[]) => {
            // TODO: Remove race widgets

            // TODO: Display all the podium/score widgets
        }
    },
    {
        event: 'Controller.BeginChallenge', // Need a Controller event for better handling //hhhhhhhhhh
        callback: async (info: BeginChallengeInfo) => {
            // TODO: Remove podium/score widgets

            // TODO: Fetch the current challenge info
            // TODO: Fetch the next challenge info

            // TODO: Display current challenge widget
            // TODO: Display current challenge record widgets

            // TODO: Display the miscellaneous widgets:
            // Clock, addfav, cpcounter, gamemode, visitors,
            // TMX info, trackcount, ranking, players/specs..
        }
    },
]

for (const plugin of plugins) {
    TM.addListener(plugin.event, plugin.callback)
}