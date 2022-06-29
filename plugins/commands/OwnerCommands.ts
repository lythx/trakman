import { TRAKMAN as TM } from '../../src/Trakman.js'

const commands: TMCommand[] = [
  {
    aliases: ['fetchallfromdb'],
    help: 'Adds all the maps present in database if they are on TMX based on id',
    callback: async (info: MessageInfo) => {
      const res = await TM.queryDB('SELECT * FROM maps;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (TM.maps.some(a => a.id === map.id))
          continue
        const file = await TM.fetchTrackFileByUid(map.id)
        if (file instanceof Error) {
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Track ${TM.palette.highlight + TM.strip(map.name, false)}$z$s ${TM.palette.error}is not on TMX.`, info.login)
          continue
        }
        const write = await TM.call('WriteFile', [{ string: file.name }, { base64: file.content }])
        if (write instanceof Error) {
          TM.error('Failed to write file', write.message)
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to write the track ${TM.palette.highlight + TM.strip(map.name, false)}$z$s ${TM.palette.error}file to the server.`, info.login)
          continue
        }
        const insert = await TM.call('InsertChallenge', [{ string: file.name }])
        if (insert instanceof Error) {
          TM.error('Failed to insert map to jukebox', insert.message)
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the track ${TM.palette.highlight + TM.strip(map.name, false)}$z$s ${TM.palette.error}into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
          + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
          + `${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.admin} from TMX.`)
      }
    },
    privilege: 4
  },
  {
    aliases: ['addallfromdb'],
    help: 'Adds all the maps present in database if they are on the server based on filename.',
    callback: async (info: MessageInfo) => {
      const res = await TM.queryDB('SELECT * FROM maps;')
      if (res instanceof Error) {
        TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to get maps from the database.`, info.login)
        return
      }
      for (const map of res) {
        if (TM.maps.some(a => a.id === map.id))
          continue
        const insert = await TM.call('InsertChallenge', [{ string: map.filename }])
        if (insert instanceof Error) {
          TM.error('Failed to insert map to jukebox', insert.message)
          TM.sendMessage(`${TM.palette.server}» ${TM.palette.error}Failed to insert the track ${TM.palette.highlight + TM.strip(map.name, false)}$z$s ${TM.palette.error}into queue.`, info.login)
          continue
        }
        TM.sendMessage(`${TM.palette.server}»» ${TM.palette.admin}${TM.getTitle(info)} `
          + `${TM.palette.highlight + TM.strip(info.nickName, true)}${TM.palette.admin} has added and queued `
          + `${TM.palette.highlight + TM.strip(map.name, true)}${TM.palette.admin} from server files.`)
      }
    },
    privilege: 4
  }
]

for (const command of commands) { TM.addCommand(command) }