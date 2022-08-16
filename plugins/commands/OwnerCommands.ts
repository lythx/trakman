import { trakman as tm } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ffdb', 'fetchallfromdb'],
    help: 'Adds all the maps present in database if they are on TMX based on id',
    callback: async (info: MessageInfo): Promise<void> => {
      const res: { uid: string, id: number }[] | Error = await tm.db.query(`SELECT uid, id FROM map_ids`)
      const filenames: { filename: string }[] | Error = await tm.db.query(`SELECT filename FROM maps`)
      if (res instanceof Error || filenames instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (tm.maps.list.some(a => a.id === map.uid))
          continue
        const file: { name: string, content: Buffer } | Error = await tm.tmx.fetchMapFile(map.uid)
        if (file instanceof Error) {
          continue
        }
        while (filenames.some(a => a.filename === file.name)) { //yes
          file.name = [...file.name.split('').slice(0, file.name.length - 15), (Math.random() + 1).toString(36).slice(-1), '.Challenge.Gbx'].join('')
        }
        const write: any[] | Error = await tm.client.call('WriteFile', [{ string: file.name }, { base64: file.content.toString('base64') }])
        if (write instanceof Error) {
          tm.log.error('Failed to write file', write.message)
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to write the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}file to the server.`, info.login)
          continue
        }
        const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: file.name }])
        if (insert instanceof Error) {
          tm.log.error('Failed to insert map to jukebox', insert.message)
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map ${tm.utils.palette.highlight + tm.utils.strip(map.uid, false)}$z$s ${tm.utils.palette.error}into queue.`, info.login)
          continue
        }
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
          + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
          + `${tm.utils.palette.highlight + tm.utils.strip(map.uid, true)}${tm.utils.palette.admin} from TMX.`)
      }
    },
    privilege: 4
  },
  {
    aliases: ['aadb', 'addallfromdb'],
    help: 'Adds all the maps present in database if they are on the server based on filename.',
    callback: async (info: MessageInfo): Promise<void> => {
      const res: any[] | Error = await tm.db.query('SELECT * FROM maps;')
      if (res instanceof Error) {
        tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (tm.maps.list.some(a => a.id === map.id))
          continue
        const insert: any[] | Error = await tm.client.call('InsertChallenge', [{ string: map.filename }])
        if (insert instanceof Error) {
          tm.log.error('Failed to insert map to jukebox', insert.message)
          tm.sendMessage(`${tm.utils.palette.server}» ${tm.utils.palette.error}Failed to insert the map ${tm.utils.palette.highlight + tm.utils.strip(map.name, false)}$z$s ${tm.utils.palette.error}into queue.`, info.login)
          continue
        }
        tm.sendMessage(`${tm.utils.palette.server}»» ${tm.utils.palette.admin}${tm.utils.getTitle(info)} `
          + `${tm.utils.palette.highlight + tm.utils.strip(info.nickname, true)}${tm.utils.palette.admin} has added and queued `
          + `${tm.utils.palette.highlight + tm.utils.strip(map.name, true)}${tm.utils.palette.admin} from server files.`)
      }
    },
    privilege: 4
  }
]

for (const command of commands) { tm.commands.add(command) }