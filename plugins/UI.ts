'use strict'
import { TRAKMAN as TM } from '../src/Trakman.js'
import UIConfig from './UIConfig.json' assert { type: 'json' }

// THIS IS A BIG, HUGE, GIGANTIC TODO FOR NOW!!!
// EVENT DESCRIPTIONS TAKEN FROM RE/EYEPIECE

// Manialink IDs in use:
// 10000 - ChallengeWidget

// Action IDs in use:
// 50000 - ChallengeWidget

abstract class UI {

    // Manialink IDs (RACE) begin with 10000
    // Manialink IDs (SCORE) begin with 20000
    // Manialink Action IDs begin with 50000
    // Manialinks have their Z-index on 10

    // I HATE OOP XDDDD

    // $re_config['Positions'] = array(
    // 	'left'	=> array(
    // 		'icon'		=> array(
    // 			'x'		=> 0.6,
    // 			'y'		=> 0
    // 		),
    // 		'title'		=> array(
    // 			'x'		=> 3.2,
    // 			'y'		=> -0.55,
    // 			'halign'	=> 'left'
    // 		),
    // 		'image_open'	=> array(
    // 			'x'		=> -0.3,
    // 			'image'		=> $re_config['IMAGES'][0]['WIDGET_OPEN_LEFT'][0]
    // 		)
    // 	),
    // 	'right'	=> array(
    // 		'icon'		=> array(
    // 			'x'		=> 12.5,
    // 			'y'		=> 0
    // 		),
    // 		'title'		=> array(
    // 			'x'		=> 12.4,
    // 			'y'		=> -0.55,
    // 			'halign'	=> 'right'
    // 		),
    // 		'image_open'	=> array(
    // 			'x'		=> 12.2,
    // 			'image'		=> $re_config['IMAGES'][0]['WIDGET_OPEN_RIGHT'][0]
    // 		)
    // 	)
    // );

    static closeManialinks(mode: boolean): string {
        // This will need to be updated when more widgets are added!
        const ids: Array<number> = mode ? [10000] : [20000]
        let xml: string = ``
        for (const id of ids) {
            xml += `<manialink id="${id}"></manialink>`
        }
        return xml
    }

    static buildCustomUi(): string {
        const customUi: string = // Custom UI settings
            `<manialinks><manialink id="0"><line></line></manialink><custom_ui>`
            + `<notice visible="${UIConfig.customUi.notice.toString()}"/>` // Notice in the top left
            + `<challenge_info visible="${UIConfig.customUi.challengeInfo.toString()}"/>` // Challenge info in the top right
            + `<net_infos visible="${UIConfig.customUi.netInfo.toString()}"/>` // Loading bar in the top right
            + `<chat visible="${UIConfig.customUi.chat.toString()}"/>` // Chat
            + `<checkpoint_list visible="${UIConfig.customUi.checkpointList.toString()}"/>` // Checkpoint list, right of timer
            + `<round_scores visible="${UIConfig.customUi.roundScores.toString()}"/>` // Round scores in rounds mode, right side
            + `<scoretable visible="${UIConfig.customUi.scoreTable.toString()}"/>` // Scoretable on podium/score
            + `<global visible="${UIConfig.customUi.global.toString()}"/>` // All the windows: speed, timer, prev/best, etc.
            + `</custom_ui></manialinks>`
        return customUi
    }

    static buildChallengeWidget(info: BeginChallengeInfo): string {
        const pos: boolean = (UIConfig.challengeWidget.racePos.posX < 0) ? true : false
        const xml: string = // Challenge widget
            `<manialink id="10000">`
            + `<frame posn="${UIConfig.challengeWidget.racePos.posX} ${UIConfig.challengeWidget.racePos.posY} 10">`
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `<quad posn="0 0 0.01" sizen="${UIConfig.challengeWidget.width} ${UIConfig.challengeWidget.height}" `
            + `action="50000" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `<quad posn="0.4 -0.36 0.02" sizen="${UIConfig.challengeWidget.width - 0.8} 2" `
            + `style="${UIConfig.widgetStyleRace.titleStyle}" substyle="${UIConfig.widgetStyleRace.titleSubStyle}"/>`
            + `<quad posn="${pos ? 12.5 + UIConfig.challengeWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="${UIConfig.challengeWidget.icons.currTrack.style}" substyle="${UIConfig.challengeWidget.icons.currTrack.substyle}"/>`
            + `<label posn="${pos ? 12.4 + UIConfig.challengeWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${pos ? 'right' : 'left'}" textsize="1" text="${UIConfig.challengeWidget.titles.currTrack}"/>`
            + `<label posn="1 -2.7 0.04" sizen="13.55 2" scale="1" text="${info.name}"/>`
            + `<label posn="1 -4.5 0.04" sizen="14.85 2" scale="0.9" text="by ${info.author}"/>`
            + `<quad posn="0.7 -6.25 0.04" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>`
            + `<label posn="2.7 -6.55 0.04" sizen="6 2" scale="0.75" text="${info.authorTime}"/>`
            + `</frame>`
            + `</manialink>`
        return xml
    }

    static buildChallengeWidgetScore(info: any): string {
        const xml: string = // Challenge widget for podium/score
            ``
        return xml
    }
}

const plugins: TMEvent[] = [
    {
        event: 'Controller.Ready',
        callback: async () => {
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UI.buildCustomUi() }, { int: 0 }, { boolean: false }])
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
            // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UI.closeManialinks(true) }, { int: 0 }, { boolean: false }])

            // TODO: Display all the podium/score widgets
        }
    },
    {
        event: 'Controller.BeginChallenge', // Need a Controller event for better handling //hhhhhhhhhh
        callback: async (info: BeginChallengeInfo) => {
            // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UI.closeManialinks(false) }, { int: 0 }, { boolean: false }])

            // TODO: Fetch the next challenge info
            // This can be improved after queue/jukebox, as we can get next challenge from there also
            const nextInfo = await TM.call('GetNextChallengeInfo')

            // TODO: Display current challenge widget
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UI.buildChallengeWidget(info) }])

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
