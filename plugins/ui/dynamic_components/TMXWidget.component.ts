import PopupWindow from "./PopupWindow.js";
import IPopupWindow from "./PopupWindow.interface.js";
import { TRAKMAN as TM } from "../../../src/Trakman.js";
import CFG from '../UIConfig.json' assert { type: 'json' }

interface PlayerPage {
    readonly login: string
    page: number
}

export default class TMXWidget extends PopupWindow implements IPopupWindow {

    readonly itemCount = 3
    private readonly challengeActionIds: string[] = []
    private readonly playerPages: PlayerPage[] = []

    constructor(openId: number, closeId: number) {
        super(openId, closeId, 56)
    }

    initialize(): void {
        TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
            //   if (info.answer >= this.id + 1000 && info.answer <= this.id + 6000) {
            //     const challengeId = this.challengeActionIds[info.answer - (this.id + 1000)]
            //     if (challengeId === undefined) {
            //       TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
            //       TM.error('Error while adding map to queue from jukebox', `Can't find actionId ${info.answer} in memory`)
            //       return
            //     }
            //     const challenge = TM.challenges.find(a => a.id === challengeId)
            //     if (challenge === undefined) {
            //       TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
            //       TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${challengeId} in memory`)
            //       return
            //     }
            //     if (TM.challengeQueue.some(a => a.id === challengeId)) {
            //       TM.removeFromQueue(challengeId)
            //       TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)} `
            //         + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
            //     }
            //     else {
            //       TM.addToJukebox(challengeId)
            //       TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(info.nickName, true)} `
            //         + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
            //     }
            //     this.displayToPlayer(info.login)
            //   }
            //   else if (info.answer >= this.id + 1 && info.answer <= this.id + 6) {
            //     const playerPage = this.playerPages.find(a => a.login === info.login)
            //     if (playerPage === undefined) {
            //       TM.error(`Can't find player ${info.login} in memory`)
            //       return
            //     }
            //     switch (info.answer) {
            //       case this.id + 1:
            //         playerPage.page = 1
            //         break
            //       case this.id + 2:
            //         playerPage.page -= 10
            //         if (playerPage.page < 1) { playerPage.page = 1 }
            //         break
            //       case this.id + 3:
            //         playerPage.page--
            //         break
            //       case this.id + 4:
            //         playerPage.page++
            //         break
            //       case this.id + 5: {
            //         const lastPage = Math.ceil(TM.challenges.length / (this.gridHeight * this.gridWidth))
            //         playerPage.page += 10
            //         if (playerPage.page > lastPage) {
            //           playerPage.page = lastPage
            //         }
            //         break
            //       } case this.id + 6:
            //         const lastPage = Math.ceil(TM.challenges.length / (this.gridHeight * this.gridWidth))
            //         playerPage.page = lastPage
            //         break
            //     }
            //     this.displayToPlayer(info.login)
            //   }
        })
    }

    constructContent(login: string): string {
        const challenges = TM.challenges
        challenges.sort((a, b) => a.author.localeCompare(b.author))
        let xml = ''
        const titles = [CFG.challengeWidget.titles.lastTrack, CFG.challengeWidget.titles.currTrack, CFG.challengeWidget.titles.nextTrack]
        for (let i = 0; i < 3; i++) {
            const challenge = [TM.previousChallenges[0], TM.challenge, TM.challengeQueue[0]][i]
            if (challenge === undefined) {
                continue
            }
            const tmxInfo = TM.TMXInfo
            if (tmxInfo === null) {
                continue
            }
            const screnshot = tmxInfo.thumbnailUrl
            const recordIndex = TM.records.filter(a => a.challenge === challenge.id).sort((a, b) => a.score - b.score).findIndex(a => a.login === login) + 1
            let recordIndexString
            if (recordIndex === 0) { recordIndexString = "--" }
            else if (recordIndex.toString().length === 1) { recordIndexString = `0${recordIndex}` }
            else { recordIndexString = recordIndex.toString() }
            let replaysXml = ''
            if (tmxInfo.replays.length > 0) {
                replaysXml += `<quad posn="0.4 -39 2" sizen="24.5 9.8" style="BgsPlayerCard" substyle="BgCardSystem"/>
                <quad posn="5 -39.5 3" sizen="2.1 2.1" style="Icons128x128_1" substyle="Solo"/>
                <quad posn="11 -39.5 3" sizen="2 2" style="BgRaceScore2" substyle="ScoreLink"/>
                <quad posn="17.3 -39.5 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>`
                const medals = ['MedalGold', 'MedalSilver', 'MedalBronze']
                for (let i = 0; i < Math.min(tmxInfo.replays.length, 3); i++) {
                    const imgPos = -(41.7 + (2.3 * i))
                    const txtPos = -(41.9 + (2.3 * i))
                    replaysXml += `
                    <quad posn="0.9 ${imgPos} 3" sizen="2 2" style="MedalsBig" substyle="${medals[i]}"/>
                    <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.safeString(tmxInfo.replays[i].name)}"/>
                    <label posn="10 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(tmxInfo.replays[i].time)}"/>
                    <label posn="16 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.replays[i].recordDate.getDay()}/${tmxInfo.replays[i].recordDate.getMonth()}/${tmxInfo.replays[i].recordDate.getFullYear()}"/>
                    <quad posn="22 ${imgPos + 0.2} 3" sizen="2 2" style="Icons128x128_1" substyle="Save" url="${tmxInfo.replays[i].url.replace(/^https:\/\//, '')}"/>`
                }
                replaysXml += `<quad posn="6 -49 3" sizen="3.5 3.5" style="Icons128x128_1" substyle="Save" url="${tmxInfo.downloadUrl.replace(/^https:\/\//, '')}"/>
                <quad posn="15 -49.2 3" sizen="3.2 3.2" style="Icons128x128_1" substyle="ServersAll" url="${tmxInfo.pageUrl.replace(/^https:\/\//, '')}"/>`
            }
            xml += `
        <frame posn="${i * 26} 0 0.02">
          <quad posn="0 0 1" sizen="25 53" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
          <quad posn="0.4 -0.36 2" sizen="24.2 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>
          <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
          <format textsize="1.3" textcolor="FFFF"/>
          <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + titles[i]}"/>
          <quad posn="1 -3.5 2" sizen="23 18" style="Bgs1" substyle="BgCard"/>
          <quad posn="1.1 -3.6 3" sizen="22.8 17.8" image="${TM.safeString(screnshot + `&.jpeg`)}"/>
          <label posn="1 -22.5 3" sizen="15.2 3" scale="1.5" text="${CFG.widgetStyleRace.formattingCodes + TM.safeString(TM.strip(challenge.name, false))}"/>
          <label posn="1 -25.7 3" sizen="16.2 2" scale="1.2" text="${CFG.widgetStyleRace.formattingCodes}by ${TM.safeString(challenge.author)}"/>
          <quad posn="0.4 -28.2 3" sizen="2 2" style="BgRaceScore2" substyle="ScoreLink"/>
          <label posn="2.5 -28.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + TM.Utils.getTimeString(challenge.authorTime)}"/>
          <quad posn="0.4 -30.2 3" sizen="2 2" style="Icons128x128_1" substyle="Vehicles"/>
          <label posn="2.5 -30.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.environment}"/>
          <quad posn="0.4 -32.2 3" sizen="2 2" style="Icons128x128_1" substyle="Manialink"/>
          <label posn="2.5 -32.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.mood}"/>
          <quad posn="0.4 -34.2 3" sizen="2 2" style="Icons128x128_1" substyle="Coppers"/>
          <label posn="2.5 -34.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.copperPrice}"/>
          <quad posn="0.4 -36.2 3" sizen="2 2" style="Icons128x32_1" substyle="RT_Cup"/>
          <label posn="2.5 -36.38 3" sizen="4.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.awards}"/>
          <quad posn="8 -28.2 3" sizen="2 2" image="https://cdn.discordapp.com/attachments/793464821030322196/986680709538267227/build2.dds"/>
          <label posn="10.1 -28.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.lastUpdateDate}"/>
          <quad posn="8 -30.2 3" sizen="2 2" style="Icons128x128_1" substyle="NewTrack"/>
          <label posn="10.1 -30.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.type} "/>
          <quad posn="8 -32.2 3" sizen="2 2" style="Icons128x128_1" substyle="Custom"/>
          <label posn="10.1 -32.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.style}"/>
          <quad posn="8 -34.2 3" sizen="2 2" style="Icons128x128_1" substyle="United"/>
          <label posn="10.1 -34.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.difficulty}"/>
          <quad posn="8 -36.2 3" sizen="2 2" style="Icons128x128_1" substyle="Puzzle"/>
          <label posn="10.1 -36.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.routes}"/>
          <quad posn="17.5 -28.2 3" sizen="2 2" style="Icons128x128_1" substyle="Credits"/>
          <label posn="19.6 -28.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.game}"/>
          <quad posn="17.5 -30.2 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>
          <label posn="19.6 -30.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}TODO"/>
          <quad posn="17.5 -32.2 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>
          <label posn="19.6 -32.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}TODO"/>
          <quad posn="17.5 -34.2 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>
          <label posn="19.6 -34.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}TODO"/>
          <quad posn="17.5 -36.2 3" sizen="2 2" style="MedalsBig" substyle="MedalNadeo"/>
          <label posn="19.6 -36.38 3" sizen="7 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}TODO"/>
          ${replaysXml}
        </frame>`
        }
        return xml
    }

    // constructFooter(login: string): string {
    //     let xml = ''
    //     const playerPage = this.playerPages.find(a => a.login === login)
    //     if (playerPage === undefined) {
    //         TM.error(`Can't find player ${login} in the memory`)
    //         return `<quad posn="39.6 -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
    //   imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    //   image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    //     }
    //     if (playerPage.page !== 1) {
    //         xml += `
    //   <quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 1}" 
    //   imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551449370634/firstek8.png"
    //   image="https://cdn.discordapp.com/attachments/599381118633902080/986427881192296448/firstek8w.png"/>
    //   <quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 2}" 
    //   imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551835250738/jumpekbw8.png"
    //   image="https://cdn.discordapp.com/attachments/599381118633902080/986427881590779934/jumpekbw8w.png"/>
    //   <quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 3}" 
    //   imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552527298601/prevek8.png"
    //   image="https://cdn.discordapp.com/attachments/599381118633902080/986427882190553088/prevek8w.png"/>`
    //     }
    //     else {
    //         xml += `
    //   <quad posn="27.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>
    //   <quad posn="31.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>
    //   <quad posn="35.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
    //     }
    //     xml += `<quad posn="39.6 -2 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.closeId}" 
    // imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551008976956/closek8.png"
    // image="https://cdn.discordapp.com/attachments/599381118633902080/986427880932278322/closek8w.png"/>`
    //     if (playerPage.page !== Math.ceil(TM.challenges.length / this.itemCount)) {
    //         xml += `
    //    <quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 4}" 
    //    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552246276187/nextek8.png"
    //    image="https://cdn.discordapp.com/attachments/599381118633902080/986427881985048616/nextek8w.png"/>
    //    <quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 5}" 
    //    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425551654887514/jumpek8.png"
    //    image="https://cdn.discordapp.com/attachments/599381118633902080/986427881402019941/jumpek8w.png"/>
    //    <quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" action="${this.id + 6}" 
    //    imagefocus="https://cdn.discordapp.com/attachments/599381118633902080/986425552019816489/lastek8.png"
    //    image="https://cdn.discordapp.com/attachments/599381118633902080/986427881792086046/lastek8w.png"/>`
    //     }
    //     else {
    //         xml += `
    //   <quad posn="43.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>
    //   <quad posn="47.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>
    //   <quad posn="51.6 -2.15 0.01" sizen="3.5 3.5" halign="center" valign="center" image="https://cdn.discordapp.com/attachments/599381118633902080/986425551248031784/emptek8.png"/>`
    //     }
    //     return xml
    // }
} 