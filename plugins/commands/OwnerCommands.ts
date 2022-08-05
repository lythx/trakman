import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['ffdb', 'fetchallfromdb'],
    help: 'Adds all the maps present in database if they are on TMX based on id',
    callback: async (info: MessageInfo): Promise<void> => {
      const res: any[] | Error = await TM.db.query('SELECT * FROM maps;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (TM.maps.some(a => a.id === map.id))
          continue
        const file: { name: string, content: Buffer } | Error = await TM.fetchMapFileByUid(map.id)
        if (file instanceof Error) {
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.highlight + TM.utils.strip(map.name, false)}$z$s ${TM.utils.palette.error}is not on TMX.`, info.login)
          continue
        }
        const write: any[] | Error = await TM.call('WriteFile', [{ string: file.name }, { base64: file.content }])
        if (write instanceof Error) {
          TM.error('Failed to write file', write.message)
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to write the map ${TM.utils.palette.highlight + TM.utils.strip(map.name, false)}$z$s ${TM.utils.palette.error}file to the server.`, info.login)
          continue
        }
        const insert: any[] | Error = await TM.call('InsertChallenge', [{ string: file.name }])
        if (insert instanceof Error) {
          TM.error('Failed to insert map to jukebox', insert.message)
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to insert the map ${TM.utils.palette.highlight + TM.utils.strip(map.name, false)}$z$s ${TM.utils.palette.error}into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added and queued `
          + `${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.admin} from TMX.`)
      }
    },
    privilege: 4
  },
  {
    aliases: ['aadb', 'addallfromdb'],
    help: 'Adds all the maps present in database if they are on the server based on filename.',
    callback: async (info: MessageInfo): Promise<void> => {
      const res: any[] | Error = await TM.db.query('SELECT * FROM maps;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (TM.maps.some(a => a.id === map.id))
          continue
        const insert: any[] | Error = await TM.call('InsertChallenge', [{ string: map.filename }])
        if (insert instanceof Error) {
          TM.error('Failed to insert map to jukebox', insert.message)
          TM.sendMessage(`${TM.utils.palette.server}» ${TM.utils.palette.error}Failed to insert the map ${TM.utils.palette.highlight + TM.utils.strip(map.name, false)}$z$s ${TM.utils.palette.error}into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.utils.palette.server}»» ${TM.utils.palette.admin}${TM.utils.getTitle(info)} `
          + `${TM.utils.palette.highlight + TM.utils.strip(info.nickname, true)}${TM.utils.palette.admin} has added and queued `
          + `${TM.utils.palette.highlight + TM.utils.strip(map.name, true)}${TM.utils.palette.admin} from server files.`)
      }
    },
    privilege: 4
  }
]

for (const command of commands) { TM.addCommand(command) }