// /**
//  * @author lythx
//  * @since 1.2
//  */

// import { centeredText, closeButton, Grid, componentIds, leftAlignedText, addManialinkListener, PopupWindow } from '../UI.js'
// import { View, Text, StyleSheet } from '../NewUi.js'
// import { Paginator } from "../UI.js"

// const styles = StyleSheet({
//   headerText: {
//     textSize: 2,
//     height: 5,
//     width: 10,
//     align: 'center',
//     z: 5,
//     padding: 5
//   },
//   normalText: {
//     textSize: 1,
//     align: 'center',
//     alignVertical: 'center',
//     z: 5
//   }
// })

// export default class TMXSearchWindow extends PopupWindow {

//   constructor() {
//     super(componentIds.TMXSearchWindow, config.icon, config.title, config.navbar)
//     tm.commands.add({
//       aliases: ['warn'],
//       callback: async (info: tm.MessageInfo): Promise<void> => {
//         this.displayToPlayer(info.login)
//       },
//       privilege: config.command.privilege
//     })
//   }

//   protected async constructContent(login: string): Promise<string> {
//     const s = `sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart sussy petya among us fart`
//     const a = View({
//       width: this.contentWidth, height: this.contentHeight,
//       background: 'CCCC'
//     },
//       Text('WARNING', styles.headerText),
//       // Text(s, { ...styles.normalText, width: this.contentWidth, height: this.contentHeight })
//     ).render()
//     console.log(a)
//     return a
//   }

//   protected constructFooter(login: string, params?: { paginator: Paginator }): string {
//     return closeButton(this.closeId, this.windowWidth, this.footerHeight) + ((params === undefined) ? '' :
//       (params.paginator).constructXml(login))
//   }

// } 
