

// const commands: TMCommand[] = [{
//   aliases: ['hm', 'hardmute'],
//   help: 'Mute a player and disable their commands.',
//   // TODO params
//   callback: async (info: MessageInfo): Promise<void> => {
//       const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
//       if (targetInfo === undefined) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Unknown player or no login specified.`, info.login)
//           return
//       }
//       const targetLogin: string = info.text
//       const callerLogin: string = info.login
//       if (targetLogin == null) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, callerLogin)
//           return
//       }
//       if (targetInfo.privilege === 4) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of the server owner.`, callerLogin)
//           return
//       }
//       if (targetInfo.login === callerLogin) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control your own privileges.`, callerLogin)
//           return
//       }
//       else if (targetInfo.privilege < 1) {
//           tm.admin.setPrivilege(targetLogin, -1, info)
//       }
//       else {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot disable commands of a privileged person.`, callerLogin)
//           return
//       }
//       tm.multiCallNoRes({
//           method: 'ChatSendServerMessage',
//           params: [{
//               string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
//                   `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has disabled ` +
//                   `commands and muted ${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname, true)}${tm.utils.palette.admin}.`
//           }]
//       },
//           {
//               method: 'Ignore',
//               params: [{ string: targetInfo.login }]
//           })
//   },
//   privilege: 2
// },
// {
//   aliases: ['hfs', 'hardforcespec'],
//   help: 'Force player into specmode without ability to disable it.',
//   // TODO params
//   callback: async (info: MessageInfo): Promise<void> => {
//       if (info.text.length === 0) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, info.login)
//           return
//       }
//       const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
//       if (targetInfo === undefined) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not on the server.`, info.login)
//           return
//       }
//       if (hfsList.some(a => a === targetInfo.login)) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is already hardforced into specmode.`, info.login)
//           return
//       }
//       hfsList.push(targetInfo.login)
//       await tm.multiCall(
//           {
//               method: 'ForceSpectator',
//               params: [{ string: targetInfo.login }, { int: 1 }]
//           },
//           {
//               method: 'ChatSendServerMessage',
//               params: [{
//                   string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
//                       + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has hardforced `
//                       + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo.nickname)}${tm.utils.palette.admin} into specmode.`
//               }]
//           }
//       )
//       tm.addListener('Controller.PlayerJoin', (i: JoinInfo): void => {
//           if (hfsList.some(a => a === i.login)) {
//               tm.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
//           }
//       })
//       tm.addListener('Controller.PlayerInfoChanged', async (i: InfoChangedInfo): Promise<void> => {
//           if (hfsList.some(a => a === i.login)) {
//               await new Promise((r) => setTimeout(r, (Math.random() * 6800) + 200))
//               tm.client.callNoRes('ForceSpectator', [{ string: info.text }, { int: 1 }])
//           }
//       })
//       await new Promise((r) => setTimeout(r, 5))
//       tm.client.callNoRes('SpectatorReleasePlayerSlot', [{ string: info.text }])
//   },
//   privilege: 2
// },
// {
//   aliases: ['uhfs', 'undohardforcespec'],
//   help: 'Undo hardforcespec.',
//   // TODO params
//   callback: async (info: MessageInfo): Promise<void> => {
//       if (info.text.length === 0) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}No login specified.`, info.login)
//           return
//       }
//       if (!hfsList.some(a => a === info.login)) {
//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Player is not hardforced into specmode.`, info.login)
//           return
//       }
//       hfsList.splice(hfsList.indexOf(info.login), 1)
//       const targetInfo: TMPlayer | undefined = tm.players.get(info.text)
//       tm.multiCallNoRes(
//           {
//               method: 'ForceSpectator',
//               params: [{ string: info.text }, { int: 0 }]
//           },
//           {
//               method: 'ChatSendServerMessage',
//               params: [{
//                   string: `${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
//                       + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has released `
//                       + `${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname || info.login)}${tm.utils.palette.admin} out of specmode.`
//               }]
//           }
//       )
//   },
//   privilege: 2
// },
// {
//   aliases: ['ffdb', 'fetchallfromdb'],
//   help: 'Adds all the maps present in database if they are on TMX based on id',
//   callback: async (info: TMMessageInfo): Promise<void> => {
//     const res: { uid: string, id: number }[] | Error = await tm.db.query(`SELECT uid, id FROM map_ids`)
//     const filenames: { filename: string }[] | Error = await tm.db.query(`SELECT filename FROM maps`)
//     if (res instanceof Error || filenames instanceof Error) {
//       tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to get maps from the database.`, info.login)
//       return
//     }
//     for (const map of res) {
//       if (tm.maps.list.some(a => a.id === map.uid))
//         continue
//       const file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(map.uid)
//       if (file instanceof Error) {
//         continue
//       }
//       while (filenames.some(a => a.filename === file.name)) { //yes
//         file.name = [...file.name.split('').slice(0, file.name.length - 15), (Math.random() + 1).toString(36).slice(-1), '.Challenge.Gbx'].join('')
//       }
//       const write: any[] | Error = await tm.client.call('WriteFile', [{ string: file.name }, { base64: file.content.toString('base64') }])
//       if (write instanceof Error) {
//         tm.log.error('Failed to write file', write.message)
//         tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to write the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}file to the server.`, info.login)
//         continue
//       }
//       const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: file.name }])
//       if (insert instanceof Error) {
//         tm.log.error('Failed to insert map to jukebox', insert.message)
//         tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}into queue.`, info.login)
//         continue
//       }
//       tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
//         + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
//         + `${tm.utils.palette.highlight + tm.utils.strip(map.uid, true)}${tm.utils.palette.admin} from TMX.`)
//     }
//   },
//   privilege: 4
// }
// {
//       aliases: ['bug'],
//       help: 'bug',
//       params: [{ name: 'text', type: 'multiword' }],
//       callback: (info: MessageInfo, text: string): void => {
//           const embed = new EmbedBuilder()
//               .setTitle('Bug report')
//               .setDescription(`Sent by ${tm.utils.strip(tm.utils.strip(info.nickname))}`)
//               .setColor(0x0099ff)
//               .setTimestamp(Date.now())
//               .setThumbnail(('https://media.sketchfab.com/models/c842e2bec3c2463b977de99762014d4a/thumbnails/513ca7ac0d1349a3820d6a927a23cb5c/60be795961244327984a71b1ec8b8dcd.jpeg'))
//               .addFields([
//                   {
//                       name: 'Bug info',
//                       value: `${text}`
//                   }
//               ])

//           webhooker.send({
//               embeds: [embed]
//           })

//           tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.admin}Bug successfully submitted.`, info.login)
//       },
//       privilege: 0
//   },
// ]
// {
//   aliases: ['dcmds', 'disablecommands'],
//   help: 'Disable player commands.',
//   params: [{ name: 'login' }],
//   callback: async (info: TMMessageInfo, login: string): Promise<void> => {
//     const targetLogin: string = login
//     const callerLogin: string = info.login
//     const targetInfo: TMOfflinePlayer | undefined = await tm.players.fetch(targetLogin)
//     const prevPrivilege: number = targetInfo?.privilege ?? 0
//     if (prevPrivilege >= info.privilege) {
//       tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}You cannot control privileges of a person who has equal or higher privilege than you.`, callerLogin)
//       return
//     }
//     if (prevPrivilege === -1) {
//       tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.error} already can't use commands.`, callerLogin)
//     } else {
//       tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} ` +
//         `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has disabled ` +
//         `commands for ${tm.utils.palette.highlight + tm.utils.strip(targetInfo?.nickname ?? login, true)}${tm.utils.palette.admin}.`)
//       await tm.admin.setPrivilege(targetLogin, -1, info)
//     }
//   },
//   privilege: 2
// },