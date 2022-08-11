// import PopupWindow from "../PopupWindow.js";
// import { trakman as tm } from "../../../src/Trakman.js";
// import { CONFIG as CFG, headerIconTitleText, ICONS as ICN, ICONS, IDS } from '../UiUtils.js'
// import { Paginator } from "../UiUtils.js";

// export default class TMXWindow extends PopupWindow {

//   private readonly itemsPerPage = 3
//   private readonly queueMapsCount = 4
//   private readonly previousMapsCount = 4
//   private readonly paginator: Paginator
// 
//   constructor() {
//     super(IDS.TMXWindow)
//     this.paginator = new Paginator(this.openId, this.closeId, Math.ceil(1 + this.queueMapsCount / this.itemsPerPage))
//     this.paginator.onPageChange((login: string, page: number) => {
//       this.displayToPlayer(login, page)
//     })
//   }

//   protected onOpen(info: ManialinkClickInfo): void {
//     //for now its getting update here but thats bad, should be on event
//     const prevCount = Math.ceil((Math.min(this.previousMapsCount, tm.previousChallenges.length) - 1) / this.itemsPerPage)
//     const nextCount = Math.ceil((this.queueMapsCount - 1) / this.itemsPerPage)
//     this.paginator.updatePageCount(prevCount + 1 + nextCount)
//     this.displayToPlayer(info.login, prevCount + 1)
//   }

//   protected constructHeader(login: string, page: number): string {
//     return headerIconTitleText('Map Info', this.windowWidth, this.headerHeight, '', 2.5, 2.5, `${page}/${this.paginator.pageCount}`)
//   }

//   protected constructContent(login: string, page: number): string {
//     const prevCount = Math.ceil((Math.min(this.previousMapsCount, tm.previousChallenges.length) - 1) / this.itemsPerPage)
//     const challenges = tm.challenges
//     challenges.sort((a, b) => a.author.localeCompare(b.author))
//     let xml = ''
//     const titles = [CFG.map.titles.lastTrack, CFG.map.titles.currTrack, CFG.map.titles.nextTrack]
//     const pages = [
//       [tm.previousChallenges[3], tm.previousChallenges[2], tm.previousChallenges[1]],
//       [tm.previousChallenges[0], tm.challenge, tm.challengeQueue[0]],
//       [tm.challengeQueue[1], tm.challengeQueue[2], tm.challengeQueue[3]]
//     ]
//     const TMXPages = [
//       [tm.TMXPrevious[3], tm.TMXPrevious[2], tm.TMXPrevious[1]],
//       [tm.TMXPrevious[0], tm.TMXCurrent, tm.TMXNext[0]],
//       [tm.TMXNext[1], tm.TMXNext[2], tm.TMXNext[3]]
//     ]
//     for (let i = 0; i < this.itemsPerPage; i++) {
//       const challenge = pages[page - prevCount][i]
//       if (challenge === undefined) { continue }
//       const tmxInfo = TMXPages[page - prevCount][i]
//       const tmxXml = this.getTMXXml(tmxInfo)
//       const positionString = this.getPositionString(login, challenge.id)
//       const replaysXml = this.getReplaysXml(tmxInfo)
//       const image = tmxInfo === null
//         ? ICN.mapNoImage
//         : tm.utils.safeString(tmxInfo.thumbnailUrl + `&.jpeg`)
      // xml += `
      //   <frame posn="${i * 26} 0 0.02">
      //     <quad posn="0 0 1" sizen="25 53" style="BgsPlayerCard" substyle="BgRacePlayerName"/>
      //     <quad posn="0.4 -0.36 2" sizen="24.2 2.1" style="BgsPlayerCard" substyle="BgCardSystem"/>
      //     <quad posn="0.6 -0.2 3" sizen="2.5 2.5"  style="BgRaceScore2" substyle="Warmup"/>
      //     <format textsize="1.3" textcolor="FFFF"/>
      //     <label posn="3.5 -0.67 3" sizen="13.55 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + titles[i]}"/>
      //     <quad posn="1 -3.5 2" sizen="23 18" style="Bgs1" substyle="BgCard"/>
      //     <quad posn="1.1 -3.6 3" sizen="22.8 17.8" image="${image}"/>
      //     <label posn="1 -22.5 3" sizen="15.2 3" scale="1.5" text="${CFG.widgetStyleRace.formattingCodes + tm.utils.safeString(tm.utils.strip(challenge.name, false))}"/>
      //     <label posn="1 -25.7 3" sizen="16.2 2" scale="1.2" text="${CFG.widgetStyleRace.formattingCodes}by ${tm.utils.safeString(challenge.author)}"/>
      //     <quad posn="0.4 -28.2 3" sizen="1.9 1.9" image="${ICN.timerA}"/>
      //     <label posn="2.5 -28.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tm.utils.getTimeString(challenge.authorTime)}"/>
      //     <quad posn="0.4 -30.2 3" sizen="1.9 1.9" image="${ICN.environment}"/>
      //     <label posn="2.5 -30.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.environment}"/>
      //     <quad posn="0.4 -32.2 3" sizen="1.9 1.9" image="${ICN.heart}"/>
      //     <label posn="2.5 -32.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}100"/>
      //     <quad posn="8 -28.2 3" sizen="1.9 1.9" image="${ICN.addDate}"/>
      //     <label posn="10.1 -28.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}${challenge.addDate.getDate().toString().padStart(2, '0')}/${(challenge.addDate.getMonth() + 1).toString().padStart(2, '0')}/${challenge.addDate.getFullYear()}"/>
      //     <quad posn="8 -30.2 3" sizen="1.9 1.9" image="${ICN.sun}"/>
      //     <label posn="10.1 -30.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.mood}"/>
      //     <quad posn="17.5 -28.2 3" sizen="1.9 1.9"
      //      image="${ICN.barGraph}"/>
      //     <label posn="19.6 -28.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + positionString}"/>
      //     <quad posn="17.5 -30.2 3" sizen="1.9 1.9"
      //      image="${ICN.cash}"/>
      //     <label posn="19.6 -30.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + challenge.copperPrice}"/>
      //     ${tmxXml}
      //     ${replaysXml}
      //   </frame>`
  //   }
  //   return xml
  // }

  // protected constructFooter(login: string, page: number): string {
  //   return this.paginator.constructXml(page)
  // }

  // private getTMXXml(tmxInfo: TMXTrackInfo | null) {
  //   if (tmxInfo === null) { return '' }
  //   let lbRating: string = tmxInfo.leaderboardRating.toString()
  //   let lbIcon = ICN.star.white
  //   if (tmxInfo.isClassic === true) {
  //     lbRating = 'Classic'
  //     lbIcon = ICN.star.yellow
  //   }
  //   if (tmxInfo.isNadeo === true) {
  //     lbRating = 'Nadeo'
  //     lbIcon = ICN.star.green
  //   }
  //   let tmxDiffImage: string
  //   switch (tmxInfo.difficulty) {
  //     case 'Beginner':
  //       tmxDiffImage = ICN.difficulty.beginner
  //       break
  //     case 'Intermediate':
  //       tmxDiffImage = ICN.difficulty.intermediate
  //       break
  //     case 'Expert':
  //       tmxDiffImage = ICN.difficulty.expert
  //       break
  //     case 'Lunatic':
  //       tmxDiffImage = ICN.difficulty.lunatic
  //       break
  //     default:
  //       tmxDiffImage = ICN.empty
  //   }
    //   return `
    //             <quad posn="0.4 -34.2 3" sizen="1.9 1.9"
    //              image="${ICN.mapQuestionMark}"/>
    //             <label posn="2.5 -34.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.type} "/>
    //             <quad posn="0.4 -36.2 3" sizen="1.9 1.9" image="${ICN.routes}"/>
    //             <label posn="2.5 -36.38 3" sizen="5.25 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.routes}"/>
    //             <quad posn="8 -32.2 3" sizen="1.9 1.9" image="${ICN.tag}"/>
    //             <label posn="10.1 -32.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.style}"/>
    //             <quad posn="8 -34.2 3" sizen="1.9 1.9" image="${tmxDiffImage}"/>
    //             <label posn="10.1 -34.38 3" sizen="7.15 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.difficulty}"/>
    //             <quad posn="8 -36.2 3" sizen="1.9 1.9" image="${ICN.tools}"/>
    //             <label posn="10.1 -36.38 3" sizen="7.15 2" scale="1"
    //              text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.lastUpdateDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.lastUpdateDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.lastUpdateDate.getFullYear()}"/>
    //             <quad posn="17.5 -32.2 3" sizen="1.9 1.9" image="${lbIcon}"/>
    //             <label posn="19.6 -32.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + lbRating}"/>
    //             <quad posn="17.5 -34.2 3" sizen="1.9 1.9" image="${ICN.trophy}"/>
    //             <label posn="19.6 -34.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.awards}"/>
    //             <quad posn="17.5 -36.2 3" sizen="1.9 1.9" image="${ICN.TM}"/>
    //             <label posn="19.6 -36.38 3" sizen="5 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes + tmxInfo.game}"/>
    //             <quad posn="6 -49.2 3" sizen="3.2 3.2" image="${ICN.mapDownload}"
    //              url="${tmxInfo.downloadUrl.replace(/^https:\/\//, '')}"/>
    //             <quad posn="11 -49.2 3" sizen="3.2 3.2" image="${ICN.lineGraph}"
    //              url="${tm.utils.safeString(`http://dedimania.net/tmstats/?do=stat&Uid=${tmxInfo.id}&Show=RECORDS`.replace(/^https:\/\//, ''))}"/>
    //             <quad posn="16 -49.2 3" sizen="3.2 3.2"
    //              image="${ICN.MX}"
    //              url="${tmxInfo.pageUrl.replace(/^https:\/\//, '')}"/>`
  // }

  // private getPositionString(login: string, challengeId: string): string {
  //   const recordIndex = tm.records.filter(a => a.challenge === challengeId).sort((a, b) => a.time - b.time).findIndex(a => a.login === login) + 1
  //   if (recordIndex === 0) { return "--." }
  //   else { return tm.utils.getPositionString(recordIndex) }
  // }

  // private getReplaysXml(tmxInfo: TMXTrackInfo | null): string {
  //   let replaysXml = `<quad posn="0.4 -39 2" sizen="24.2 9.8" style="BgsPlayerCard" substyle="BgCardSystem"/>
  //           <quad posn="5.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.account}"/>
  //           <quad posn="11.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.timer}"/>
  //           <quad posn="17.55 -39.5 3" sizen="1.9 1.9"
  //            image="${ICN.calendar}"/>`
    //const positionIcons = [ICN.one, ICN.two, ICN.three]
    // for (let i = 0; i < 3; i++) {
    //   const imgPos = -(41.7 + (2.3 * i))
    //   const txtPos = -(41.9 + (2.3 * i))
    //   if (tmxInfo !== null && tmxInfo.replays[i] !== undefined) {
        // replaysXml += `
        //   <quad posn="0.9 ${imgPos} 3" sizen="1.9 1.9" image="${positionIcons[i]}"/>
        //   <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1"
        //    text="${CFG.widgetStyleRace.formattingCodes + tm.utils.safeString(tmxInfo.replays[i].name)}"/>
        //   <label posn="12.5 ${txtPos} 3" sizen="4 2" scale="1" halign="center"
        //    text="${CFG.widgetStyleRace.formattingCodes + tm.utils.getTimeString(tmxInfo.replays[i].time)}"/>
        //   <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1"
        //    text="${CFG.widgetStyleRace.formattingCodes}${tmxInfo.replays[i].recordDate.getDate().toString().padStart(2, '0')}/${(tmxInfo.replays[i].recordDate.getMonth() + 1).toString().padStart(2, '0')}/${tmxInfo.replays[i].recordDate.getFullYear()}"/>
        //   <quad posn="22.15 ${imgPos + 0.2} 3" sizen="1.9 1.9"
        //    image="${ICN.download}"
        //    url="${tmxInfo.replays[i].url.replace(/^https:\/\//, '')}"/>`
      // }
      // else {
        // replaysXml += `
        //   <quad posn="0.9 ${imgPos} 3" sizen="1.9 1.9" image="${positionIcons[i]}"/>
        //   <label posn="3 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}N/A"/>
        //   <label posn="10 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}-:--.--"/>
        //   <label posn="15.5 ${txtPos} 3" sizen="6.4 2" scale="1" text="${CFG.widgetStyleRace.formattingCodes}--/--/----"/>`
//       }
//     }
//     return replaysXml
//   }

// } 