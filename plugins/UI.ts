'use strict'

import { TRAKMAN as TM } from '../src/Trakman.js'
import UIConfig from './UIConfig.json' assert { type: 'json' }

// THIS IS A BIG, HUGE, GIGANTIC TODO FOR NOW!!!
// EVENT DESCRIPTIONS TAKEN FROM RE/EYEPIECE

// Manialink IDs (RACE) begin with 10000
// Manialink IDs (SCORE) begin with 20000
// Manialink Action IDs begin with 50000

// Manialinks have their Z-index on 10

// Manialink IDs in use:
// 10000 - ChallengeWidget
// 10001 - LocalRecordsWidget
// 10002 - DediRecordsWidget
// 10003 - LiveRankingsWidget
// 10004 - KarmaVotesWidget
// 20000 ChallengeWidgetScore

// Action IDs in use:
// 50000 - ChallengeWidget
// 50001 - LocalRecordsWidget
// 50002 - DediRecordsWidget
// 50003 - LiveRankingsWidget
// 50004 - KarmaVotesWidget

abstract class UIGeneral {
    /**
     * format custom ui using values from config
     * @returns xml of the customui block
     */
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

    // this is for reference only!
    static buildTempWindows(): string {
        // temporary position variables you know
        const lrPos: boolean = (UIConfig.liveRankingsWidget.posX < 0) ? true : false
        const dediPos: boolean = (UIConfig.dediRecordsWidget.posX < 0) ? true : false
        const kvPos: boolean = (49.2 < 0) ? true : false // impossible calculation
        // and more!
        const lrWidgetHeight: number = 1.8 * UIConfig.liveRankingsWidget.entries + 3.3
        const dediWidgetHeight: number = 1.8 * UIConfig.dediRecordsWidget.entries + 3.3
        // and more!!!
        const titleWidth = UIConfig.localRecordsWidget.width - 0.8
        // no way actual build biuild
        const temporaryWindows: string =
            `<manialink id="10002">` // DEDIMANIA WIDGET ID
            + `<frame posn="${UIConfig.dediRecordsWidget.posX} ${UIConfig.dediRecordsWidget.posY} 10">`
            + `<quad posn="0 0 0.01" sizen="${UIConfig.dediRecordsWidget.width} ${dediWidgetHeight}" `
            + `action="50002" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `<quad posn="0.4 -0.36 0.02" sizen="${titleWidth} 2" style="${UIConfig.widgetStyleRace.titleStyle}" substyle="${UIConfig.widgetStyleRace.titleSubStyle}"/> `
            + `<quad posn="${dediPos ? 12.5 + UIConfig.dediRecordsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="${UIConfig.dediRecordsWidget.iconStyle}" substyle="${UIConfig.dediRecordsWidget.iconSubStyle}"/>`
            + `<label posn="${dediPos ? 12.4 + UIConfig.dediRecordsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${dediPos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + UIConfig.dediRecordsWidget.title}"/> `
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10003">` // LIVE RANKS WIDGET ID
            + `<frame posn="${UIConfig.liveRankingsWidget.posX} ${UIConfig.liveRankingsWidget.posY} 10">`
            + `<quad posn="0 0 0.01" sizen="${UIConfig.liveRankingsWidget.width} ${lrWidgetHeight}" `
            + `action="50003" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `<quad posn="0.4 -0.36 0.02" sizen="${titleWidth} 2" style="${UIConfig.widgetStyleRace.titleStyle}" substyle="${UIConfig.widgetStyleRace.titleSubStyle}"/> `
            + `<quad posn="${lrPos ? 12.5 + UIConfig.liveRankingsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="${UIConfig.liveRankingsWidget.iconStyle}" substyle="${UIConfig.liveRankingsWidget.iconSubStyle}"/>`
            + `<label posn="${lrPos ? 12.4 + UIConfig.liveRankingsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${lrPos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + UIConfig.liveRankingsWidget.title}"/> `
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10004">` // KARMA WIDGET ID NOT IN CONFIG SO VALUES ARE FUNNY
            + `<frame posn="49.2 32.8 10">`
            + `<quad posn="0 0 0.01" sizen="15.76 10.65" `
            + `action="50004" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `<quad posn="0.4 -0.36 0.02" sizen="${titleWidth} 2" style="${UIConfig.widgetStyleRace.titleStyle}" substyle="${UIConfig.widgetStyleRace.titleSubStyle}"/> `
            + `<quad posn="${kvPos ? 12.5 + 15.76 - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="Icons64x64_1" substyle="ToolLeague1"/>`
            + `<label posn="${kvPos ? 12.4 + 15.76 - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${kvPos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + 'Votes'}"/> `
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            // IDS FOR STUFF BELOW ARENT FINAL
            ///////////////////
            + `<manialink id="10005">` // TIMER (SERVER) OVERLAY ID
            + `<frame posn="49.2 22.25 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 4.55" `
            + `action="50005" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10006">` // PREV+BEST OVERLAY ID
            + `<frame posn="49.2 39.25 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 6.55" `
            + `action="50006" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10007">` // SPEC OVERLAY ID
            + `<frame posn="-64.7 28.85 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 5.25" ` // why the fuck is it bigger than the rest ngiagda
            + `action="50007" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10008">` // RANKINGS OVERLAY ID
            + `<frame posn="-64.7 33.25 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 4.5" `
            + `action="50008" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10009">` // RANDOM ASS WINDOW FOR REFERENCE ID (autistic flexi)
            + `<frame posn="-64.7 37.65 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 4.5" `
            + `action="50009" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
            ///////////////////
            + `<manialink id="10010">` // RANDOM ASS WINDOW FOR REFERENCE ID 2 (autistic mk)
            + `<frame posn="-64.7 48 10">`
            + `<quad posn="0 0 0.01" sizen="15.5 10.5" `
            + `action="50010" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
        return temporaryWindows
    }

    /**
     * close all plugin manialinks
     * @param mode race (true) or score (false)
     * @returns xml with manialinks closed
     */
    static closeManialinks(mode: boolean): string {
        // This will need to be updated when more widgets are added!
        const ids: Array<number> = mode
            ? [10000, 10001, 10002, 10003, 10004, 10005, 10006, 10007, 10008, 10009, 10010]
            : [20000]
        let xml: string = ``
        for (const id of ids) {
            xml += `<manialink id="${id}"></manialink>`
        }
        return xml
    }
}

abstract class UIRace {
    /**
     * build the challenge widget for race
     * @param info challenge info from callback
     * @returns xml of the widget
     */
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
            + `style="${UIConfig.challengeWidget.icons.currTrack.style}" substyle="${UIConfig.challengeWidget.icons.currTrack.subStyle}"/>`
            + `<label posn="${pos ? 12.4 + UIConfig.challengeWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${pos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + UIConfig.challengeWidget.titles.currTrack}"/>`
            + `<label posn="1 -2.7 0.04" sizen="13.55 2" scale="1" text="${UIConfig.widgetStyleRace.formattingCodes + TM.strip(info.name, false)}"/>`
            + `<label posn="1 -4.5 0.04" sizen="14.85 2" scale="0.9" text="${UIConfig.widgetStyleRace.formattingCodes}by ${info.author}"/>`
            + `<quad posn="0.7 -6.25 0.04" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>`
            + `<label posn="2.7 -6.55 0.04" sizen="6 2" scale="0.75" text="${UIConfig.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(info.authorTime)}"/>`
            + `</frame>`
            + `</manialink>`
        return xml
    }

    static buildLocalRecordsWidget(player: TMPlayer): string {
        const pos: boolean = (UIConfig.localRecordsWidget.posX < 0) ? true : false
        const widgetHeight = 1.8 * UIConfig.localRecordsWidget.entries + 3.3
        const columnHeight = widgetHeight - 3.1
        const columnWidth = UIConfig.localRecordsWidget.width - 6.45
        const titleWidth = UIConfig.localRecordsWidget.width - 0.8
        // Build records list
        const players = TM.topPlayers
        let playersXML = `<frame posn="0 -3 10">`
        for (const [i, p] of players.entries()) {
            playersXML += // Records list in XML
                `<label posn="1 ${-1.8 * i} 0.04" sizen="1 0" halign="left" textsize="1" `
                + `text="${UIConfig.widgetStyleRace.formattingCodes}${i + 1}."/>`
                + `<label posn="2.485 ${-1.8 * i} 0.04" sizen="3.5 0" halign="left" textsize="1" `
                + `text="${UIConfig.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(p.score)}"/>`
                + `<label posn="6.45 ${(-1.8 * i) + 0.05} 0.04" sizen="7.5 0" halign="left" textsize="1" `
                + `text="${UIConfig.widgetStyleRace.formattingCodes + TM.strip(p.nickName, false)}"/>`
            // Display an arrow next to active player (but not self)
            if (TM.getPlayer(p.login) !== undefined) {
                playersXML += `<quad posn="-1.9 ${-1.8 * i} 0.04" sizen="2 2" `
                if (p.login !== player.login) {
                    playersXML +=
                        `style="${UIConfig.widgetStyleRace.hlOtherStyle}" substyle="${UIConfig.widgetStyleRace.hlOtherSubStyle}"/>`
                        + `<quad posn="-1.7 ${-1.8 * i - 0.2} 0.05" sizen="1.6 1.6" style="Icons128x128_1" substyle="Solo"/>`
                } else {
                    playersXML +=
                        `style="${UIConfig.widgetStyleRace.hlSelfStyle}" substyle="${UIConfig.widgetStyleRace.hlSelfSubStyle}"/>`
                        + `<quad posn="-1.7 ${-1.8 * i - 0.2} 0.05" sizen="1.6 1.6" style="Icons64x64_1" substyle="ArrowNext"/>`
                }
            }
        }
        playersXML += `</frame>`
        // Add no record thing if no record from player
        if (!players.find(pl => pl.login === player.login)) {
            playersXML += `` // TODO
        }
        const xml: string = // Locals widget
            `<manialink id="10001">`
            + `<frame posn="${UIConfig.localRecordsWidget.posX} ${UIConfig.localRecordsWidget.posY} 10">`
            + `<quad posn="0 0 0.01" sizen="${UIConfig.localRecordsWidget.width} ${widgetHeight}" `
            + `action="50001" style="${UIConfig.widgetStyleRace.bgStyle}" substyle="${UIConfig.widgetStyleRace.bgSubStyle}"/> `
            + `${playersXML}`
            + `<quad posn="0.4 -2.6 0.02" sizen="2 ${columnHeight}" bgcolor="${UIConfig.widgetStyleRace.colours.bgRank}"/> `
            + `<quad posn="2.4 -2.6 0.02" sizen="3.65 ${columnHeight}" bgcolor="${UIConfig.widgetStyleRace.colours.bgScore}"/> `
            + `<quad posn="6.05 -2.6 0.02" sizen="${columnWidth} ${columnHeight}" bgcolor="${UIConfig.widgetStyleRace.colours.bgName}"/> `
            + `<quad posn="0.4 -0.36 0.02" sizen="${titleWidth} 2" style="${UIConfig.widgetStyleRace.titleStyle}" substyle="${UIConfig.widgetStyleRace.titleSubStyle}"/> `
            + `<quad posn="${pos ? 12.5 + UIConfig.localRecordsWidget.width - 15.5 : 0.6} 0 0.04" sizen="2.5 2.5" `
            + `style="${UIConfig.localRecordsWidget.iconStyle}" substyle="${UIConfig.localRecordsWidget.iconSubStyle}"/>`
            + `<label posn="${pos ? 12.4 + UIConfig.localRecordsWidget.width - 15.5 : 3.2} -0.55 0.04" sizen="10.2 0" `
            + `halign="${pos ? 'right' : 'left'}" textsize="1" text="${UIConfig.widgetStyleRace.formattingCodes + UIConfig.localRecordsWidget.title}"/> `
            + `<format textsize="1" textcolor="${UIConfig.widgetStyleRace.colours.default}"/>`
            + `<quad posn="0.4 -2.6 0.03" sizen="${titleWidth} ${1.8 * UIConfig.localRecordsWidget.topCount + 0.3}" `
            + `style="${UIConfig.widgetStyleRace.topStyle}" substyle="${UIConfig.widgetStyleRace.topSubStyle}"/>`
            + `</frame>`
            + `</manialink>`
        return xml
    }

}

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

const events: TMEvent[] = [
    {
        event: 'Controller.Ready',
        callback: async () => {
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.buildCustomUi() }, { int: 0 }, { boolean: false }])
            await TM.call('SetForcedMods',
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
            TM.callNoRes('RestartChallenge') // testing purposes
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
            for (const player of TM.players) {
                TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
            }
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
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.closeManialinks(true) }, { int: 0 }, { boolean: false }])
            // This can be improved after queue/jukebox, as we can get next challenge from there also
            const info = await TM.call('GetNextChallengeInfo')
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIScore.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

            // TODO: Display all the podium/score widgets
        }
    },
    {
        event: 'Controller.BeginChallenge',
        callback: async (info: BeginChallengeInfo) => {
            // Using a function instead of SendCloseManialinkPage because we only want to close stuff that belongs to this plugin
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.closeManialinks(false) }, { int: 0 }, { boolean: false }])

            // TODO: Fetch the next challenge info
            // Temporarily moved to EndChallenge
            // We'd need to store the nextchallenge in a variable
            // This is easier achievable with queue/jukebox

            // TODO: Display current challenge widget
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIRace.buildChallengeWidget(info) }, { int: 0 }, { boolean: false }])

            // TODO: Display current challenge record widgets
            for (const player of TM.players) {
                TM.callNoRes('SendDisplayManialinkPageToLogin', [{ string: player.login }, { string: UIRace.buildLocalRecordsWidget(player) }, { int: 0 }, { boolean: false }])
            }

            // testing only
            TM.callNoRes('SendDisplayManialinkPage', [{ string: UIGeneral.buildTempWindows() }, { int: 0 }, { boolean: false }])

            // TODO: Display the miscellaneous widgets:
            // Clock, addfav, cpcounter, gamemode, visitors,
            // TMX info, trackcount, ranking, players/specs..
        }
    },
]

for (const event of events) { TM.addListener(event.event, event.callback) }
