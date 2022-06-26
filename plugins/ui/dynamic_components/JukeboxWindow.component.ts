// import PopupWindow from "../PopupWindow.js";
// import { TRAKMAN as TM } from "../../../src/Trakman.js";
// import { CONFIG, ICONS, IDS } from '../UiUtils.js'
// import { Paginator, headerIconTitleText } from "../UiUtils.js";
// const CFG = CONFIG.widgetStyleRace

// const MAP_ADD_ID = 1000
// // TODO CHANGE SO IT USES GRID
// // TODO HANDLE CHALLENGE LIST LENGTH UPDATES
// export default class JukeboxWindow extends PopupWindow {

//   readonly gridWidth = 5
//   readonly gridHeight = 4
//   private readonly paginator: Paginator
//   private readonly challengeActionIds: string[] = []

//   constructor() {
//     super(IDS.JukeboxWindow)
//     this.paginator = new Paginator(this.openId, this.closeId, Math.ceil(TM.challenges.length / (this.gridHeight * this.gridWidth)))
//     this.paginator.onPageChange((login: string, page: number) => {
//       this.displayToPlayer(login, page)
//     })
//     TM.addListener('Controller.ManialinkClick', (info: ManialinkClickInfo) => {
//       if (info.answer >= this.openId + MAP_ADD_ID && info.answer <= this.openId + MAP_ADD_ID + 5000) {
//         const challengeId = this.challengeActionIds[info.answer - (this.openId + MAP_ADD_ID)]
//         if (challengeId === undefined) {
//           TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, info.login)
//           TM.error('Error while adding map to queue from jukebox', `Challenge index out of range`)
//           return
//         }
//         this.handleMapClick(challengeId, info.login, info.nickName)
//         const page = this.paginator.getPageByLogin(info.login)
//         if (page === undefined) {
//           this.displayToPlayer(info.login, 1)
//           return
//         }
//         this.displayToPlayer(info.login, page)
//       }
//     })
//   }

//   protected onOpen(info: ManialinkClickInfo): void {
//     const page = this.paginator.getPageByLogin(info.login)
//     if (page === undefined) {
//       this.displayToPlayer(info.login, 1)
//       return
//     }
//     this.displayToPlayer(info.login, page)
//   }

//   protected constructHeader(login: string, page: number): string {
//     return headerIconTitleText('Map List', this.windowWidth, this.titleHeight, '', 2.5, 2.5, `${page}/${this.paginator.pageCount}`)
//   }

//   protected constructContent(login: string, page: number): string {
//     const challenges = [...TM.challenges]
//     //TODO USE CHALLENGELISTUPDATE EVENT OR SOMETHING CUZ THIS IS GIGA INEFFECTIVE
//     challenges.sort((a, b) => a.name.localeCompare(b.name))
//     challenges.sort((a, b) => a.author.localeCompare(b.author))
//     let xml = ''
//     let trackIndex = (this.gridHeight * this.gridWidth) * (page - 1)
//     for (let i = 0; i < this.gridHeight; i++) {
//       for (let j = 0; j < this.gridWidth; j++) {
//         trackIndex++
//         if (challenges[trackIndex] === undefined) { break }
//         const recordIndexString = this.getRecordIndexString(login, challenges[trackIndex].id)
//         const actionId = this.getActionId(challenges[trackIndex].id)
//         const header = this.getHeader(challenges[trackIndex].id, actionId)
//         xml += `
//           <frame posn="${j * 15.75} ${-i * 10.9} 0.02">
//             ${header}
//             <quad posn="0 0 1" sizen="14.5 10" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
//             <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
//             <format textsize="1.3" textcolor="FFFF"/>
//             <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.formattingCodes}Track #${trackIndex}"/>
//             <label posn="0.7 -3.1 3" sizen="13 2" scale="1" text="${CFG.formattingCodes + TM.safeString(TM.strip(challenges[trackIndex].name, false))}"/>
//             <label posn="0.7 -5.3 3" sizen="13 2" scale="0.9" text="${CFG.formattingCodes}by ${TM.safeString(challenges[trackIndex].author)}"/>
//             <format textsize="1" textcolor="FFFF"/>
//             <quad posn="0.4 -7.6 3" sizen="1.7 1.7" style="BgRaceScore2" substyle="ScoreReplay"/>
//             <label posn="2.1 -7.9 3" sizen="4.4 2" scale="0.75" text="${CFG.formattingCodes + TM.Utils.getTimeString(challenges[trackIndex].authorTime)}"/>
//             <quad posn="5.7 -7.5 3" sizen="1.9 1.9" style="BgRaceScore2" substyle="LadderRank"/>
//             <label posn="7.5 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.formattingCodes + recordIndexString}"/>
//             <quad posn="10.2 -7.4 3" sizen="1.9 1.9" style="Icons64x64_1" substyle="StateFavourite"/>
//             <label posn="12.1 -7.9 3" sizen="3 2" scale="0.75" text="${CFG.formattingCodes}100"/>
//           </frame>`
//       }
//     }
//     return xml
//   }

//   protected constructFooter(login: string, page: number): string {
//     return this.paginator.constructXml(page)
//   }

//   private handleMapClick(challengeId: string, login: string, nickName: string) {
//     const challenge = TM.challenges.find(a => a.id === challengeId)
//     if (challenge === undefined) {
//       TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Error while adding challenge to queue.`, login)
//       TM.error('Error while adding map to queue from jukebox', `Can't find challenge with id ${challengeId} in memory`)
//       return
//     }
//     if (TM.jukebox.some(a => a.id === challengeId)) {
//       TM.removeFromJukebox(challengeId)
//       TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
//         + `${TM.palette.vote}removed ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} from the queue.`)
//     }
//     else {
//       TM.addToJukebox(challengeId)
//       TM.sendMessage(`${TM.palette.server}»» ${TM.palette.highlight + TM.strip(nickName, true)} `
//         + `${TM.palette.vote}added ${TM.palette.highlight + TM.strip(challenge.name, true)}${TM.palette.vote} to the queue.`)
//     }
//   }

//   private getRecordIndexString(login: string, challengeId: string): string {
//     // IDK IF I NEED TO SORT HERE NEED TO CHECK LATER
//     const recordIndex = TM.records.filter(a => a.challenge === challengeId).sort((a, b) => a.time - b.time).findIndex(a => a.login === login) + 1
//     if (recordIndex === 0) { return "--." }
//     else { return TM.Utils.getPositionString(recordIndex) }
//   }

//   private getActionId(challengeId: string): number {
//     const challengeActionId = this.challengeActionIds.indexOf(challengeId)
//     if (challengeActionId !== -1) { return challengeActionId + this.openId + MAP_ADD_ID }
//     else {
//       this.challengeActionIds.push(challengeId)
//       return this.challengeActionIds.length - 1 + this.openId + MAP_ADD_ID
//     }
//   }

//   private getHeader(challengeId: string, actionId: number): string {
//     if (TM.jukebox.some(a => a.id === challengeId)) {
//       return `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}"
//           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
//           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260325638154/minusek8.png"/>
//           <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="Bgs1InRace" substyle="BgListLine"/>`
//     }
//     else {
//       return `<quad posn="0 0 4" sizen="14.5 10" action="${actionId}" 
//           image="http://maniacdn.net/undef.de/uaseco/blank.png" 
//           imagefocus="https://cdn.discordapp.com/attachments/793464821030322196/986391260547911740/plusek8.png"/>
//           <quad posn="0.4 -0.36 2" sizen="13.7 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>`
//     }
//   }

// } 