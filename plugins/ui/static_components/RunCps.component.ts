// import { TRAKMAN as TM } from '../../../src/Trakman.js'
// import StaticComponent from '../StaticComponent.js'
// import { CONFIG, IDS, Grid, centeredText, verticallyCenteredText } from '../UiUtils.js'

// export default class RunCps extends StaticComponent {

//   private readonly width = CONFIG.bestCps.width
//   private readonly positionX = CONFIG.static.leftPosition + CONFIG.static.marginBig + CONFIG.static.width
//   private readonly positionY = CONFIG.static.topBorder
//   private readonly entries = CONFIG.bestCps.entries
//   private readonly entryHeight = CONFIG.bestCps.entryHeight
//   private readonly bestCps: { login: string, time: number, nickname: string }[] = []
//   private readonly columnProportions = CONFIG.bestCps.columnProportions
//   private readonly selfColour = CONFIG.bestCps.selfColour
//   private readonly newestColour = CONFIG.bestCps.newestColour
//   private readonly textScale = CONFIG.bestCps.textScale
//   private readonly textPadding = CONFIG.bestCps.textPadding
//   private newestCp: number = -1
//   private height = this.entries * this.entryHeight
//   private cpAmount: number
//   private grid: Grid

//   constructor() {
//     super(IDS.bestCps, 'race')
//     this.cpAmount = TM.map.checkpointsAmount
//     this.grid = new Grid(this.width, this.height, this.columnProportions, new Array(this.entries).fill(1))
//     TM.addListener('Controller.PlayerCheckpoint', (info: CheckpointInfo) => {
//       if (this.bestCps[info.index] === undefined || this.bestCps[info.index].time > info.time) {
//         this.bestCps[info.index] = { login: info.player.login, time: info.time, nickname: info.player.nickName }
//         this.newestCp = info.index
//         this.display()
//       }
//     })
//     TM.addListener('Controller.BeginMap', (info: BeginMapInfo) => {
//       this.newestCp = -1
//       this.cpAmount = TM.map.checkpointsAmount
//       this.grid = new Grid(this.width, this.height,this.columnProportions, new Array(this.entries).fill(1))
//       this.bestCps.length = 0
//       this.display()
//     })
//   }

//   display(): void {
//     this._isDisplayed = true
//     for (const e of TM.players) {
//       this.displayToPlayer(e.login)
//     }
//   }

//   displayToPlayer(login: string): void {
//     TM.sendManialink(`
//     <manialink id="${this.id}">
//       <frame posn="${this.positionX} ${this.positionY} 1">
//         <format textsize="1"/>
//         ${this.constructText(login)}
//       </frame>
//     </manialink>`, login)
//   }

//   private constructText(login: string): string {
//     // bestCps[i] can be undefined if someone was driving while controller was off (first indexes dont exist) so im just returning empty cells

//     const indexCell = (i: number, j: number, w: number, h: number): string => {
//       return this.bestCps[i] === undefined ? '' : centeredText(`${i + 1}.`, w, h, { textScale: this.textScale, padding: this.textPadding })
//     }

//     const timeCell = (i: number, j: number, w: number, h: number): string => {
//       const cp = this.bestCps[i]
//       if (cp === undefined) { return '' }
//       let format = cp.login === login ? `<format textcolor="${this.selfColour}"/>` : ''
//       if(i === this.newestCp) { format = `<format textcolor="${this.newestColour}"/>` }
//       return format + centeredText(TM.Utils.getTimeString(this.bestCps[i].time), w, h, { textScale: this.textScale, padding: this.textPadding })
//     }

//     const nicknameCell = (i: number, j: number, w: number, h: number): string => {
//       return this.bestCps[i] === undefined ? '' : verticallyCenteredText(TM.strip(this.bestCps[i].nickname, false), w, h, { textScale: this.textScale, padding: this.textPadding })
//     }

//     const arr: ((i: number, j: number, w: number, h: number) => string)[] = []
//     for (let i = 0; i < Math.min(this.cpAmount, this.entries); i++) {
//       arr.push(indexCell, timeCell, nicknameCell)
//     }
//     return this.grid.constructXml(arr)
//   }

// }

