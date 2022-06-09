import { TRAKMAN as TM } from '../../src/Trakman.js'
import UIConfig from './UIConfig.json' assert { type: 'json' }

import CustomUi from './CustomUi.js'

import temp1 from './static_components/temp1.component.js'
import temp2 from './static_components/temp2.component.js'
import RankWidget from './static_components/RankWidget.component.js'
import SpectatorWidget from './static_components/SpectatorWidget.component.js'
import DediRanking from './static_components/DediRanking.component.js'
import ChallengeWidget from './static_components/ChallengeWidget.component.js'
import PreviousAndBest from './static_components/PreviousAndBest.component.js'
import KarmaWidget from './static_components/KarmaWidget.component.js'
import TimerWidget from './static_components/TimerWidget.component.js'
import LocalRanking from './static_components/LocalRanking.component.js'
import LiveRanking from './static_components/LiveRanking.component.js'
import StaticComponent from './static_components/StaticComponent.js'

import DynamicComponent from './dynamic_components/DynamicComponent.js'
import Jukebox from './dynamic_components/Jukebox.component.js'


// THIS IS A BIG, HUGE, GIGANTIC TODO FOR NOW!!!
// EVENT DESCRIPTIONS TAKEN FROM RE/EYEPIECE

// Manialink IDs (RACE) begin with 100
// Manialink IDs (SCORE) begin with 20000
// Manialink Action IDs begin with 50000

// Manialinks have their Z-index on 10

// Manialink IDs in use:
// 10000 - ChallengeWidget
// 10001 - LocalRecordsWidget
// 10002 - DediRecordsWidget
// 10003 - LiveRankingsWidget
// 10004 - KarmaVotesWidget
//outdated now it goes from top left to bottom right lol
// 20000 ChallengeWidgetScore

// Action IDs in use:
// 50000 - ChallengeWidget
// 50001 - LocalRecordsWidget
// 50002 - DediRecordsWidget
// 50003 - LiveRankingsWidget
// 50004 - KarmaVotesWidget


abstract class UIScore {
    /**
     * build challenge widget for score
     * @param info challenge info from callback
     * @returns xml of the widget
     */
    static buildChallengeWidget(info: any): string {
        const pos: boolean = (UIConfig.challengeWidget.racePos.posX < 0) ? true : false
        const xml: string = // Challenge widget for podium/score
            `<manialink id="20000">`
            + `<frame posn="${UIConfig.challengeWidget.scorePos.posX} ${UIConfig.challengeWidget.scorePos.posY} 10">`
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `<quad posn="0 0 0.01" sizen="${UIConfig.challengeWidget.width} ${UIConfig.challengeWidget.height + 5.2}" `
            + `style="${UIConfig.widgetStyleScore.bgStyle}" substyle="${UIConfig.widgetStyleScore.bgSubStyle}"/>`
            + `<quad posn="0.4 -0.36 0.02" sizen="${UIConfig.challengeWidget.width - 0.8} 2" `
            + `style="${UIConfig.widgetStyleScore.titleStyle}" substyle="${UIConfig.widgetStyleScore.titleSubStyle}"/>`
            + `<quad posn="${pos ? 12.5 + UIConfig.challengeWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="${UIConfig.challengeWidget.icons.nextTrack.style}" substyle="${UIConfig.challengeWidget.icons.nextTrack.subStyle}"/>`
            + `<label posn="${pos ? 12.4 + UIConfig.challengeWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${pos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + UIConfig.challengeWidget.titles.nextTrack}"/>`
            + `<label posn="1.35 -3 0.11" sizen="15 2" text="${UIConfig.widgetStyleRace.formattingCodes + TM.strip(info[0].Name, false)}"/>`
            + `<frame posn="0.5 -10 0">`
            + `<label posn="0.85 5 0.11" sizen="14.5 2" scale="0.9" text="${UIConfig.widgetStyleRace.formattingCodes}by ${info[0].Author}"/>`
            + `<quad posn="2.95 3.38 0.11" sizen="2.5 2.5" halign="right" style="Icons128x128_1" substyle="Advanced"/>`
            + `<label posn="3.3 2.9 0.11" sizen="12 2" scale="0.9" text="${UIConfig.widgetStyleRace.formattingCodes + info[0].Environnement}"/>`
            + `</frame>`
            + `<frame posn="0.5 -14.3 0">`
            + `<quad posn="2.75 5.25 0.11" sizen="2 2" halign="right" style="Icons128x128_1" substyle="Manialink"/>`
            + `<label posn="3.3 5 0.11" sizen="12 2" scale="0.9" text="${UIConfig.widgetStyleRace.formattingCodes + info[0].Mood}"/>`
            + `<quad posn="2.75 3.1 0.11" sizen="2 2" halign="right" style="BgRaceScore2" substyle="ScoreReplay"/>`
            + `<label posn="3.3 2.9 0.11" sizen="6 2" scale="0.9" text="${UIConfig.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(info[0].AuthorTime)}"/>`
            + `</frame>`
            + `</frame>`
            + `</manialink>`
        return xml
    }
}

let customUi: CustomUi
const staticComponents: StaticComponent[] = []
const dynamicComponents: DynamicComponent[] = []
const loadMod = () => {
    TM.callNoRes('SetForcedMods',
        [{
            boolean: true
        },
        {
            array: [{
                struct: {
                    Env: { string: 'Stadium' },
                    Url: { string: 'https://cdn.discordapp.com/attachments/599381118633902080/979148807998697512/TrakmanDefault.zip' }
                }
            }]
        }])
}

const events: TMEvent[] = [
    {
        event: 'Controller.Ready',
        callback: async () => {
            loadMod()
            customUi = new CustomUi()
            customUi.display()
            staticComponents.push(
                new temp1(100),
                new temp2(101),
                new RankWidget(102),
                new SpectatorWidget(103),
                new DediRanking(104),
                new ChallengeWidget(105),
                new PreviousAndBest(106),
                new KarmaWidget(107),
                new TimerWidget(108),
                new LocalRanking(109),
                new LiveRanking(110)
            )
            for (const c of staticComponents) { c.display() }
            dynamicComponents.push(
                new Jukebox(1000, 2000)
            )
        }
    },
    {
        event: 'Controller.PlayerJoin',
        callback: async (info: JoinInfo) => {
            customUi.displayToPlayer(info.login)
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
        event: 'Controller.PlayerFinish',
        callback: async (info: FinishInfo) => {
            // TODO: Update cpcounter to indicate finish
        }
    },
    {
        event: 'Controller.PlayerInfoChanged',
        callback: async (info: InfoChangedInfo) => {
            // TODO: Remove cpcounter if player switched to specmode
            // PlayerInfo['SpectatorStatus'] % 10 !== 0

            // TODO: Update miscellaneous widgets:
            // Ranking, players/specs...
        }
    },
    {
        event: 'Controller.ManialinkClick',
        callback: async (info: ManialinkClickInfo) => {
            // This will basically handle every widget click
            // If I were to write every TODO I'd kill myself, so..
            // TODO: Everything about players <-> widgets interaction
        }
    },
    {
        event: 'Controller.DedimaniaRecords',
        callback: async (info: ChallengeDedisInfo) => {
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
        callback: async (info: RecordInfo) => {
            // for (const player of TM.players) {
            //     TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
            // }
        }
    },
    {
        event: 'TrackMania.ChallengeListModified', // Need a Controller event for better handling 
        callback: async (params: any[]) => {
            // TODO: Re-fetch the next challenge info 
            // calling next challenge info should probably be done in challenge service tho
            // maybe we should always fetch next 5 maps and keep last 5 or somethign idk
            // TODO: Update miscellaneous widgets:
            // Trackcount...
        }
    },
    {
        event: 'Controller.PlayerCheckpoint',
        callback: async (info: CheckpointInfo) => {
            // TODO: Update cpcounter to indicate current cp
        }
    },
    {
        event: 'TrackMania.EndChallenge', // Need a Controller event for better handling
        callback: async (params: any[]) => {
            // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin

            // This can be improved after queue/jukebox, as we can get next challenge from there also
            // const info = await TM.call('GetNextChallengeInfo')
            // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIScore.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

            // TODO: Display all the podium/score widgets
        }
    },
    {
        event: 'Controller.BeginChallenge',
        callback: async (info: BeginChallengeInfo) => {
            customUi.display()
            loadMod()
            // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin
            // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.closeManialinks(false) }, { int: 0 }, { boolean: false }])
            // console.log(TM.challengeQueue)
            // console.log(TM.previousChallenges)
            // TODO: Fetch the next challenge info
            // Temporarily moved to EndChallenge
            // We'd need to store the nextchallenge in a variable
            // This is easier achievable with queue/jukebox

            // TODO: Display current challenge widget
            //TM.callNoRes('SendDisplayManialinkPage', [{ string: UIRace.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

            // TODO: Display current challenge record widgets
            // for (const player of TM.players) {
            //     TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
            // }

            // // testing only
            // TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.buildTempWindows() }, { int: 0 }, { boolean: false }])

            // TODO: Display the miscellaneous widgets:
            // Clock, addfav, cpcounter, gamemode, visitors,
            // TMX info, trackcount, ranking, players/specs..
        }
    },
]

for (const event of events) { TM.addListener(event.event, event.callback) }
